import { createServer as createViteServer } from 'vite';
import type { Server } from 'http';

export async function createViteServer(httpServer: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server: httpServer
      }
    }
  });

  return vite;
} 