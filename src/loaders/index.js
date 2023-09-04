import expressLoader from './express.js';

// Initialize express
export default async ({ expressApp, server, port, log }) => {
  try {
    // Loading express
    await expressLoader({ app: expressApp, server, port, log });
    log.info('✅✅✅ API loaded ');
  } catch (error) {
    log.error(error);
  }
  // throw new Error('This is an intentional error for testing purposes.');
};
