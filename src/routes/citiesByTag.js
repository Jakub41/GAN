import { Router } from 'express';
import _ from 'lodash';
import { getCityByTag } from '../services/cities.js';
import { successResponseHandler, unsuccessResponse } from '../utils/helpers.js';

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/cities-by-tag', async (req, res) => {
    const { tag, isActive } = req.query;
    const cities = await getCityByTag({ tag, isActive });

    if (_.isEmpty(cities)) return unsuccessResponse(res, 'Records not found', 400);

    return successResponseHandler(res, { cities }, 200);
  });
};
