import express from 'express';
import { createServer } from 'http';
import { setupVite } from './vite';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());

const server = createServer(app);

async function startDevServer() {
  try {
    // Register API routes
    await registerRoutes(app);

    // Setup Vite in development mode
    await setupVite(app, server);

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Development server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start development server:', error);
    process.exit(1);
  }
}

startDevServer(); 