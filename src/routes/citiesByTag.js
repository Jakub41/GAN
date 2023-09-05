import { Router } from 'express';

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/cities-by-tag/', (req, res) => {
    console.log('cities by tag');
  });
};
