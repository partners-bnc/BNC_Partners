import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, dirname } from 'node:path';
import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';
const site=JSON.parse(await readFile('src/seo/site.json','utf8'));
const root=resolve('dist');
const shell=await readFile(resolve(root,'index.html'),'utf8');
const mime={'.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+pathname);
    if (!file.startsWith(root+'/')) { res.setHeader('Content-Type','text/html');return res.end(shell); }
    if ((await stat(file).catch(()=>null))?.isFile()) {res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');return res.end(await readFile(file));}
    res.setHeader('Content-Type','text/html');res.end(shell);
  }catch{res.statusCode=500;res.end('Build preview failed');}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port;
let browser;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
try {
  browser=await playwright.launch({executablePath:process.env.PRERENDER_CHROME_PATH||await chromium.executablePath(),args:chromium.args,headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__PRERENDER__=true;});
  // Third-party embeds/media never determine whether a public page can be published.
  await context.route('**/*',route=>new URL(route.request().url()).origin===base ? route.continue() : route.request().resourceType() === 'image' ? route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRc8AAAAASUVORK5CYII=','base64')}) : route.abort());
  if(site.privateRoutes.length) await writeFile(resolve(root,'app.html'),shell.replace('</head>','<meta name="robots" content="noindex, follow"></head>'));
  const snapshots=[];
  for(const route of [...site.routes,{path:'/404',title:'Page Not Found'}]) {
    console.log("Prerender",route.path);
    const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(base+route.path,{waitUntil:'load',timeout:45000});
      await page.locator('#root h1').first().waitFor({state:'attached',timeout:30000}).catch(error=>{throw new Error(route.path+': '+(errors.join('; ')||error.message));});
      await page.waitForFunction(()=>document.head.querySelector('link[rel="canonical"]') && document.head.querySelector('#site-schema'));
      // Wait for deferred sections and lazy route chunks to finish before taking the snapshot.
      await page.waitForTimeout(400);
      // Snapshot in one browser task without innerText, which forces layout of
      // this animation-heavy page and can time out on constrained build workers.
      // Exclude non-content text so embedded CSS cannot satisfy the content check.
      const {html,text,title}=await page.evaluate(()=>{
        const root=document.getElementById('root');
        if(!root)throw new Error('Rendered application root is missing');
        const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
        const parts=[];
        while(walker.nextNode()){
          const node=walker.currentNode;
          if(!node.parentElement.closest('script,style,noscript,[hidden],[aria-hidden="true"]')) parts.push(node.textContent);
        }
        const text=parts.join(' ').replace(/\s+/g,' ').trim();
        const title=document.title;
        const doc=document.documentElement.cloneNode(true);
        doc.querySelectorAll('[style]').forEach(el=>{if(el.style.opacity==='0' && el.style.transform){el.style.opacity='1';el.style.transform='none';}});
        doc.querySelectorAll('script[src]').forEach(el=>{if(el.src.includes('localhost'))el.setAttribute('src',new URL(el.src).pathname);});
        return {html:'<!doctype html>\n'+doc.outerHTML,text,title};
      });
      if(errors.length)throw new Error(route.path+': '+errors.join('; '));
      if(text.length<(route.path==='/404'?30:120))throw new Error(route.path+': insufficient rendered content');
      if(route.path!=='/404' && !html.includes('name="robots" content="index, follow"'))throw new Error(route.path+': not indexable');
      const file=resolve(root,route.path==='/'?'index.html':route.path==='/404'?'404.html':route.path.slice(1)+'.html');
      await mkdir(dirname(file),{recursive:true});await writeFile(file,html);
      snapshots.push({path:route.path,title,characters:text.length});
    }catch(error){
      throw new Error(`Prerender failed for ${route.path} (${page.url()}): ${errors.join('; ') || error.message}`,{cause:error});
    }finally{await page.close();}
  }
  const urls=site.routes.map(p=>`  <url><loc>${escape(site.origin+p.path)}</loc>${p.modified||p.published?'<lastmod>'+escape(p.modified||p.published)+'</lastmod>':''}</url>`).join('\n');
  await writeFile(resolve(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n');
  await writeFile(resolve(root,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
  await writeFile(resolve(root,'llms.txt'),'# '+site.name+'\n\nPublic services and information.\n\n'+site.routes.map(route=>'- ['+route.title+']('+site.origin+route.path+')').join('\n')+'\n');
  await writeFile('seo-build.json',JSON.stringify(snapshots,null,2)+'\n');
  console.log(`Verified ${snapshots.length} readable HTML snapshots, sitemap and robots.txt`);
}finally{await browser?.close();server.close();}
