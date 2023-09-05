import { Router } from 'express';
import _ from 'lodash';
import { successResponseHandler, unsuccessResponse } from '../helpers/helpers.js';
import getCityByTag from '../utils/cities.js';

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
