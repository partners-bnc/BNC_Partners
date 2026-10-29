import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import site from './site.json';

export default function SiteSEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    const prefix = /^\/ar(?:\/|$)/.test(window.location.pathname) ? '/ar' : '';
    const localPath = site.redirects[pathname] || pathname.replace(/\/$/, '') || '/';
    const path = prefix + (localPath === '/' ? '' : localPath) || '/';
    const route = site.routes.find(item => item.path === path);
    const privatePage = site.privateRoutes.some(item => localPath === item || localPath.startsWith(item + '/'));
    document.documentElement.lang = prefix ? 'ar' : 'en';
    document.documentElement.dir = prefix ? 'rtl' : 'ltr';
    const origin = (import.meta.env.VITE_SITE_URL || site.origin).replace(/\/$/, '');
    const title = route ? (route.title.includes(site.name) ? route.title : `${route.title} | ${site.name}`) : `${privatePage ? 'Account' : 'Page Not Found'} | ${site.name}`;
    const description = route?.description || (privatePage ? 'Sign in to manage your account.' : 'The requested page is unavailable.');
    document.title = title;
    const set = (selector, tag, attrs) => {
      let element = document.head.querySelector(selector);
      if (!element) { element = document.createElement(tag); document.head.appendChild(element); }
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    };
    const meta = (name, content, property = false) => set(`meta[${property ? 'property' : 'name'}="${name}"]`, 'meta', { [property ? 'property' : 'name']: name, content });
    meta('description', description);
    meta('robots', route && !privatePage ? 'index, follow' : 'noindex, follow');
    set('link[rel="canonical"]', 'link', { rel: 'canonical', href: origin + path });
    document.head.querySelectorAll('link[hreflang]').forEach(element => element.remove());
    if (route && site.routes.some(item=>item.path==='/ar'+(localPath==='/'?'':localPath))) for (const [lang, href] of [['en', origin + localPath], ['ar', origin + '/ar' + (localPath === '/' ? '' : localPath)], ['x-default', origin + localPath]]) set(`link[hreflang="${lang}"]`, 'link', {rel:'alternate',hreflang:lang,href});
    const image = new URL(route?.image || site.logo, origin).href;
    for (const [key, value] of Object.entries({title, description, url: origin + path, image, type: route?.type === 'post' ? 'article' : 'website', site_name: site.name})) meta('og:' + key, value, true);
    meta('twitter:card', 'summary_large_image'); meta('twitter:title', title); meta('twitter:description', description); meta('twitter:image', image);
    const org = {'@type': 'Organization', '@id': origin + '/#organization', name: site.name, url: origin + '/', sameAs: site.sameAs || [], logo: new URL(site.logo, origin).href};
    const graph = [org];
    if (route?.type === 'service') graph.push({'@type':'Service', '@id': origin + path + '#service', name:route.title, description, url:origin + path, provider:{'@id':org['@id']}});
    if (route?.type === 'post') graph.push({'@type':'BlogPosting', '@id':origin + path + '#article', headline:route.title, description, image, datePublished:route.published, dateModified:route.modified || route.published, author:route.author ? {'@type':'Person',name:route.author} : {'@id':org['@id']}, publisher:{'@id':org['@id']}, mainEntityOfPage:origin + path});
    if (route && path !== '/') graph.push({'@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:site.name,item:origin+'/'},{'@type':'ListItem',position:2,name:route.title,item:origin+path}]});
    set('#site-schema', 'script', {id:'site-schema', type:'application/ld+json'});
    document.getElementById('site-schema').textContent = JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');
    // Remove obsolete effects from the previous implementation, including stale article schemas.
    document.getElementById('json-ld-schema')?.remove();
  }, [pathname]);
  return null;
}
