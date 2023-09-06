import { Router } from 'express';
import logger from '../loaders/logger.js';
import { successResponseHandler, unsuccessResponse } from '../utils/helpers.js';
import { getCityByGuid } from '../services/cities.js';

const log = logger();

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/city', async (req, res) => {
    const { guid } = req.query;

    if (!guid) {
      log.error('❌❌❌ GUID was not provided!');
      return unsuccessResponse(res, 'City GUID was not provided', 400);
    }

    const city = await getCityByGuid({ guid });

    return successResponseHandler(res, { city }, 200);
  });
};
