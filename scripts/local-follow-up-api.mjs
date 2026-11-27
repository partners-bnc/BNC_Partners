import process from 'node:process';
import { followUpHandler } from '../server/follow-up.mjs';
import { zeptoMailWebhook } from '../server/zeptomail-webhook.mjs';

// Run the same authenticated Vercel handler during plain Vite development.
export function localFollowUpApi(env) {
  return {
    name: 'local-follow-up-api',
    apply: 'serve',
    configureServer(server) {
      // Serve the chatbot's Vercel edge route during plain Vite development, streaming the reply.
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          for (const key of ['OPENAI_API_KEY', 'OPENAI_ANSWER_MODEL']) if (env[key] && !process.env[key]) process.env[key] = env[key];
          let body = '';
          for await (const chunk of req) body += chunk.toString();
          const { default: chatHandler } = await server.ssrLoadModule('/api/chat.ts');
          const request = new Request('http://localhost/api/chat', { method: req.method, headers: { 'content-type': 'application/json' }, ...(req.method === 'POST' ? { body } : {}) });
          const response = await chatHandler(request);
          res.writeHead(response.status, Object.fromEntries(response.headers));
          if (!response.body) return res.end();
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (error) {
          console.error('[local /api/chat]', error);
          if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Local chat API could not complete the request.' }));
        }
      });
      for (const [path, handler] of [['/api/follow-up', followUpHandler], ['/api/zeptomail-webhook', zeptoMailWebhook]]) {
      server.middlewares.use(path, async (req, res) => {
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
            if (body.length > 250000) {
              res.writeHead(413, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Request is too large.' }));
              return;
            }
          }
          const headers = new Headers();
          for (const name of ['authorization', 'producer-signature', 'content-type']) if (req.headers[name]) headers.set(name, req.headers[name]);
          const request = new Request('http://localhost/api/follow-up', { method: req.method, headers, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body } : {}) });
          const response = await handler(request, env);
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(await response.text());
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Local follow-up API could not complete the request.' }));
        }
      });
      }
    },
  };
}
