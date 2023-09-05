import { strictEqual } from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { startServer } from '../server.js';
import logger from '../src/loaders/logger.js';

const protocol = 'http';
const host = '127.0.0.1';
const port = '8080';
const server = `${protocol}://${host}:${port}`;

const log = logger();

let serverInit;
beforeEach(async () => {
  // Start server before each test
  serverInit = await startServer({ server, port, log });
});

afterEach(async () => {
  // Stop server after each test
  if (serverInit) {
    serverInit.close();
  }
});

describe('Server', () => {
  test('Starts the server - status code 200', async () => {
    // Make a request to a route
    const response = await fetch(server);

    // Assert the response
    // we expect a status code 200 as the server correctly started
    strictEqual(response.status, 200);
  });

  test('Fetch a not existing route - status code 404', async () => {
    // Make a request to a route
    const response = await fetch(`${server}/foo`);

    // Assert the response
    // we expect a status code 404 as the route does not exist
    strictEqual(response.status, 404);
  });
});
