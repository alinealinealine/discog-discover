import { createServer } from 'vite';
import type { Server } from 'http';
import type { Express } from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVite(app: Express, httpServer: Server) {
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: {
        server: httpServer,
      },
      allowedHosts: 'all',
    },
    appType: 'custom',
    root: resolve(__dirname, '../'),
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  app.use(express.static(resolve(__dirname, '../dist')));
}

export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
} 