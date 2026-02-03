import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env before any other imports that depend on env vars
config({ path: resolve(__dirname, '../.env') });

async function start() {
  // Dynamic imports to ensure env is loaded first
  const { buildApp } = await import('./app.js');
  const { env } = await import('./config/env.js');

  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.info(`Server running at http://${env.HOST}:${env.PORT}`);
    console.info(`Swagger docs at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
