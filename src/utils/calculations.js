import NodeCache from 'node-cache';
import { findCitiesCoordinates, isValidCoordinates } from './helpers.js';
import { pipeline } from 'stream';
import logger from '../loaders/logger.js';
import { CitiesWorker, DistanceCalculatorWorker } from '../workers/citiesWorker.js';

const log = logger();

const distanceBetweenCitiesByHaversineFormula = ({ fromCity, toCity }) => {
  log.info('🔢🔢🔢 Distance calculation in process');
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
  log.info('📏📏📏 The distance between cities in KM is %s', parseFloat(distance.toFixed(2)));
  return parseFloat(distance.toFixed(2));
};

const getDistance = async ({ from, to }) => {
  const fromCity = await findCitiesCoordinates({ guid: from });
  const toCity = await findCitiesCoordinates({ guid: to });

  if (!isValidCoordinates(fromCity) || !isValidCoordinates(toCity)) {
    log.warn('❌❌❌ City Coordinates are not valid');
    return null;
  }
  log.info('📍📍📍 Coordinates found');
  return distanceBetweenCitiesByHaversineFormula({ fromCity, toCity });
};

const nearestCitiesStream = ({ from, cities, range }) => {
  return new Promise((resolve, reject) => {
    const cityStream = new CitiesWorker({ cities, from });
    const distanceCalculator = new DistanceCalculatorWorker({ from, range });
    const nearCities = [];

    pipeline(cityStream, distanceCalculator, (err) => {
      if (err) {
        log.error('Error processing cities:', err);
        reject(err);
      } else {
        // The processing is complete
        log.info('Processing completed', {
          totalBatches: distanceCalculator.totalBatches
        });
        resolve(nearCities);
      }
    });

    distanceCalculator.on('data', (batch) => {
      // Process the batch of nearCities
      nearCities.push(...batch);
    });
  });
};

export { getDistance, distanceBetweenCitiesByHaversineFormula, nearestCitiesStream };
