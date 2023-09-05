import express from 'express';
import cors from 'cors';

export default async ({ app, server, port, log }) => {
  // Health Check endpoint
  app.get('/', (req, res) => {
    res.status(200).send('🔥🔥 Server is running 🔥🔥').end();
  });

  app.head('/', (req, res) => {
    res.status(200).end();
  });

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Middleware that transforms the raw string of req.body into json
  app.use(express.json());

  // Load API routes
  // app.use('/api/', routes());

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message
      }
    });
    next();
  });

  app.listen(port || 3000, (err) => {
    // If any error before the server loader will show the message
    if (err) {
      log.error(err);
      process.exit(1);
    }
    log.info(`🚀🚀🚀 Server is running at %s`, server);
  });
};
