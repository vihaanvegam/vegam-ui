/**
 * Minimal static server for docs/ — exists so the generated relationship map
 * can be opened in a browser without a build step or a dependency.
 *
 *   pnpm graph:serve   → http://localhost:4173/graphify.html
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = resolve(fileURLToPath(new URL('../docs', import.meta.url)));
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer((request, response) => {
  const requested = decodeURIComponent((request.url ?? '/').split('?')[0]);
  const relativePath =
    requested === '/' ? 'graphify.html' : normalize(requested).replace(/^[/\\]+/, '');
  const file = join(docs, relativePath);

  // Never serve outside docs/, whatever the request path claims.
  if (!file.startsWith(docs) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
    return;
  }

  response.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`serve-docs — http://localhost:${port}/graphify.html`);
});
