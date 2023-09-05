import express from 'express';
import loaders from './src/loaders/index.js';

// Starting the server from loaders
export async function startServer({ server, port, log }) {
  const app = express();
  try {
    // Await the loaders init the API
    await loaders({ expressApp: app, server, port, log });
  } catch (err) {
    log.error('⛔️⛔️⛔️ The server failed t start %o', err);
  }
}
