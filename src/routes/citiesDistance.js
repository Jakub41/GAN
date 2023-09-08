import { Router } from 'express';
import logger from '../loaders/logger.js';
import { getCitiesDistance } from '../services/cities.js';
import { filterCities, successResponseHandler, unsuccessResponse } from '../utils/helpers.js';

const log = logger();

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/distance', async (req, res) => {
    const { from, to } = req.query;
    const distance = await getCitiesDistance({ from, to });

    if (!distance) {
      log.warn('Distance not found between from city %s to city %s', from, to);
      return unsuccessResponse(res, 'Was not possible to get distance', 400);
    }

    const [cityFrom, cityTo] = await Promise.all([
      filterCities({ guid: from }),
      filterCities({ guid: to })
    ]);

    const response = {
      from: cityFrom,
      to: cityTo,
      unit: 'km',
      distance: Number(distance)
    };

    return successResponseHandler(res, response, 200);
  });
};
