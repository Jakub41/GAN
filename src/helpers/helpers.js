import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../loaders/logger.js';
import _ from 'lodash';

const log = logger();

const getCityData = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const resolvedPath = path.resolve(__dirname, '../../addresses.json');
  const file = fs.readFileSync(resolvedPath);

  return JSON.parse(file);
};

const filterCities = async ({ tag, isActive }) => {
  const cityData = await getCityData();
  if (_.isEmpty(cityData)) return [];

  return tag && isActive
    ? cityData.filter((city) => city.tags.includes(tag) && city.isActive === !!isActive)
    : [];
};

const successResponseHandler = (res, body, statusCode) => {
  body = typeof body === 'object' ? JSON.stringify(body) : body;
  log.info('🎉🎉🎉  Response was successful!');
  res.status(statusCode).send(body);
};

const unsuccessResponse = (res, ex, statusCode) => {
  const body = JSON.stringify(ex, Object.getOwnPropertyNames(ex));
  log.info('❌❌❌ Response was not successful!');
  res.status(statusCode).send(body);
};

export { getCityData, filterCities, successResponseHandler, unsuccessResponse };
