import { Router } from 'express';
import logger from '../loaders/logger.js';
import { getCitiesDistance } from '../services/cities.js';
import { filterCities, successResponseHandler, unsuccessResponse } from '../utils/helpers.js';

const log = logger();

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/area', async (req, res) => {
    const { from, distance } = req.query;

    if (!from && !distance) {
      log.error('Query parameters are missing from the request');
      return unsuccessResponse(res, 'Query parameters from and distance are mandatory', 400);
    }

    const resultsUrl = `${req.protocol}://${req.get('host')}/api/area-result/${from}`;
    setTimeout(() => {
      res.status(202).json({ resultsUrl }).end();
    }, 25);
  });
};
