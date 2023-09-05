import { findCitiesCoordinates, isValidCoordinates } from './helpers.js';
import logger from '../loaders/logger.js';

const log = logger();

const distanceBetweenCitiesByHaversineFormula = ({ fromCity, toCity }) => {
  const { lat: lat1, lon: lon1 } = fromCity;
  const { lat: lat2, lon: lon2 } = toCity;

  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLon1 = (Math.PI * lon1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLon2 = (Math.PI * lon2) / 180;

  // Radius of the Earth in kilometers
  const radius = 6371;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = radius * c;

  if (!distance) {
    log.warn('The calculation failed');
    return 0;
  }
  log.info('📏📏📏 The distance between cities in KM is %s', distance);
  return distance.toFixed(2);
};

const getDistance = async ({ from, to }) => {
  const fromCity = await findCitiesCoordinates({ guid: from });
  const toCity = await findCitiesCoordinates({ guid: to });

  if (!isValidCoordinates(fromCity) || !isValidCoordinates(toCity)) {
    log.warn('❌❌❌ City Coordinates are not valid');
    return null;
  }
  log.info('📍📍📍 Distance found');
  return distanceBetweenCitiesByHaversineFormula({ fromCity, toCity });
};

export { getDistance, distanceBetweenCitiesByHaversineFormula };
