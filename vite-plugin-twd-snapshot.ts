/**
 * SPIKE / THROWAWAY — plugin mínimo de Vite para escribir snapshots a disco.
 *
 * El navegador no puede escribir ficheros, pero el dev server sí. Expone:
 *
 *   GET  /__twd_snapshot?name=x  -> { exists, snap? }
 *   POST /__twd_snapshot?name=x  -> { snap?, png?, suffix? }  escribe a disco
 *
 * Escribe SIEMPRE el .snap y el .png para poder comparar cuál de los dos
 * formatos merece la pena como referencia.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { IncomingMessage } from 'node:http';

const DIR = '__twd_snapshots__';

function readJson(req: IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export function twdSnapshot(): Plugin {
  return {
    name: 'twd-snapshot-spike',
    configureServer(server) {
      const dir = path.resolve(server.config.root, DIR);

      server.middlewares.use('/__twd_snapshot', (req, res) => {
        void (async () => {
          const query = new URL(req.url ?? '/', 'http://x').searchParams;
          // el nombre viene del test y acaba en una ruta de fichero: sanear.
          const name = (query.get('name') ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
          res.setHeader('content-type', 'application/json');

          if (!name) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'missing name' }));
          }

          const snapFile = path.join(dir, `${name}.snap`);

          if (req.method === 'GET') {
            const exists = fs.existsSync(snapFile);
            return res.end(
              JSON.stringify({ exists, snap: exists ? fs.readFileSync(snapFile, 'utf8') : null })
            );
          }

          if (req.method === 'POST') {
            const body = await readJson(req);
            fs.mkdirSync(dir, { recursive: true });

            const suffix = (body.suffix ?? '').replace(/[^a-zA-Z0-9_.-]/g, '');
            const written: string[] = [];

            if (body.snap) {
              fs.writeFileSync(snapFile, body.snap, 'utf8');
              written.push(`${name}.snap`);
            }
            if (body.png) {
              const file = `${name}${suffix}.png`;
              fs.writeFileSync(
                path.join(dir, file),
                Buffer.from(body.png.replace(/^data:image\/png;base64,/, ''), 'base64')
              );
              written.push(file);
            }

            return res.end(JSON.stringify({ ok: true, dir, written }));
          }

          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'method not allowed' }));
        })();
      });
    },
  };
}
