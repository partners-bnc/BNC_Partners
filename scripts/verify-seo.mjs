import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const site=JSON.parse(await readFile('src/seo/site.json','utf8'));
const root=resolve('dist');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const xml=await readFile(resolve(root,'sitemap.xml'),'utf8');
assert.equal((xml.match(/<loc>/g)||[]).length,site.routes.length);
const titles=new Map();
for(const route of site.routes){
 const html=await readFile(resolve(root,route.path==='/'?'index.html':route.path.slice(1)+'.html'),'utf8');
 const title=decode(html.match(/<title>(.*?)<\/title>/s)?.[1]||'');
 assert.ok(title.length>5,route.path+' title');
 assert.ok(html.includes('name="description" content="'),route.path+' description');
 assert.ok(html.includes(`rel="canonical" href="${site.origin+route.path}"`),route.path+' canonical');
 assert.ok(html.includes('name="robots" content="index, follow"'),route.path+' indexing');
 assert.ok(html.includes('<h1'),route.path+' heading');
 const schema=html.match(/<script[^>]*id="site-schema"[^>]*>(.*?)<\/script>/s)?.[1];
 assert.ok(JSON.parse(schema)['@graph'].some(item=>item['@type']==='Organization'),route.path+' organization schema');
 assert.ok(xml.includes('<loc>'+site.origin+route.path+'</loc>'),route.path+' discovery');
 if(titles.has(title))throw new Error('Duplicate title: '+route.path+' / '+titles.get(title));titles.set(title,route.path);
}
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(site.redirects[path]){res.writeHead(308,{Location:site.redirects[path]});return res.end();}
 const file=resolve(root,path==='/'?'index.html':path.slice(1)+(path.includes('.')?'':'.html'));
 const exists=file.startsWith(root+'/')&&(await stat(file).catch(()=>null))?.isFile();
 res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.xml':'application/xml','.txt':'text/plain','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'})[extname(file)]||'text/html');
 res.statusCode=exists?200:404;res.end(await readFile(exists?file:resolve(root,'404.html')));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 const missing=await fetch(base+'/definitely-missing-audit-page');assert.equal(missing.status,404);
 for(const [from,to] of Object.entries(site.redirects)){const r=await fetch(base+from,{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),to);assert.ok(site.routes.some(p=>p.path===to),'Redirect destination '+to);}
 assert.match(await (await fetch(base+'/robots.txt')).text(),/Sitemap:/);
 browser=await playwright.launch({executablePath:process.env.PRERENDER_CHROME_PATH||await chromium.executablePath(),args:chromium.args,headless:true});
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 for(const route of [site.routes[0],site.routes.find(p=>p.type==='service'),site.routes.find(p=>p.type==='post'),site.routes.find(p=>p.path==='/ar')].filter(Boolean)){
  const page=await context.newPage();await page.goto(base+route.path);assert.ok((await page.locator('#root').innerText()).length>120,route.path+' readable without JS');assert.ok(await page.locator('h1').count());if(process.env.SEO_SCREENSHOT_DIR) await page.screenshot({path:resolve(process.env.SEO_SCREENSHOT_DIR,site.name.replace(/[^a-z0-9]/gi,'-')+route.path.replace(/[^a-z0-9]/gi,'-')+'.png')});await page.close();
 }
 console.log(`PASS: ${site.routes.length} complete static pages, unique titles, schemas, sitemap, ${Object.keys(site.redirects).length} redirects, missing-route status and no-JS mobile content`);
}finally{await browser?.close();server.close();}
