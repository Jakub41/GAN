import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../loaders/logger.js';

const log = logger();

const getCityData = async () => {
  const startTime = performance.now();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const resolvedPath = path.resolve(__dirname, '../../addresses.json');
  const file = fs.readFileSync(resolvedPath);

  const endTime = performance.now(); // Stop timing
  const loadTime = endTime - startTime;

  console.log(`Loaded JSON data in ${loadTime.toFixed(2)} ms`);

  return JSON.parse(file);
};

const filterCities = async ({ tag, isActive, guid }) => {
  const cityData = await getCityData();
  if (_.isEmpty(cityData)) return [];

  let filteredCities = cityData;

  if (tag && isActive) {
    filteredCities =
      filteredCities.filter((city) => city.tags.includes(tag) && city.isActive === !!isActive) ||
      [];
  }

  if (guid) {
    filteredCities = filteredCities.filter((city) => city.guid === guid) || [];
  }

  return filteredCities;
};

const findCitiesCoordinates = async ({ guid }) => {
  const [{ latitude, longitude }] = await filterCities({ guid });
  if (!latitude || !longitude) return null;

  return { lat: latitude, lon: longitude };
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

const isValidCoordinates = (city) =>
  city && typeof city.lat === 'number' && typeof city.lon === 'number';

export {
  filterCities,
  findCitiesCoordinates,
  getCityData,
  isValidCoordinates,
  successResponseHandler,
  unsuccessResponse
};
