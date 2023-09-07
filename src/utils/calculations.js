import NodeCache from 'node-cache';
import { pipeline } from 'stream';
import logger from '../loaders/logger.js';
import { CitiesWorker, DistanceCalculatorWorker } from '../workers/citiesWorker.js';
import { findCitiesCoordinates, isValidCoordinates } from './helpers.js';

const log = logger();
const cache = new NodeCache({ stdTTL: 3600 });
const EARTH_RADIUS = 6371; // Earth's radius in kilometers

const distanceBetweenCitiesByHaversineFormula = ({ fromCity, toCity }) => {
  // log.info('🔢🔢🔢 Distance calculation in process');
  const { lat: lat1, lon: lon1 } = fromCity;
  const { lat: lat2, lon: lon2 } = toCity;

  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLon1 = (Math.PI * lon1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLon2 = (Math.PI * lon2) / 180;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS * c;

  if (!distance) {
    log.warn('The calculation failed');
    return 0;
  }
  // log.info('📏📏📏 The distance between cities in KM is %s', parseFloat(distance.toFixed(2)));
  return parseFloat(distance.toFixed(2));
};

const getCityCoordinates = async ({ guid }) => {
  const cachedCoordinates = cache.get(guid);

  if (cachedCoordinates) {
    return cachedCoordinates;
  }

  // Fetch city coordinates from your data source
  const cityCoordinates = await findCitiesCoordinates({ guid });

  if (isValidCoordinates(cityCoordinates)) {
    // log.info('📍📍📍 City Coordinates are valid');
    cache.set(guid, cityCoordinates);
    return cityCoordinates;
  }

  log.warn('❌❌❌ City Coordinates are not valid');
  return null;
};

const getDistance = async ({ from, to }) => {
  const [fromCity, toCity] = await Promise.all([
    getCityCoordinates({ guid: from }),
    getCityCoordinates({ guid: to })
  ]);
  console.log('fromCity: ', fromCity);

  if (fromCity && toCity) {
    // log.info('📍📍📍 Coordinates found');
    return distanceBetweenCitiesByHaversineFormula({ fromCity, toCity });
  }

  return null;
};

const zones = [
  {
    name: 'Zone1',
    minLat: -35.0,
    maxLat: 37.0,
    minLon: -27.0,
    maxLon: 58.0,
    cities: []
  },
  {
    name: 'Zone2',
    minLat: -10.0,
    maxLat: 60.0,
    minLon: 30.0,
    maxLon: 160.0,
    cities: []
  },
  {
    name: 'Zone3',
    minLat: 36.0,
    maxLat: 71.0,
    minLon: -31.0,
    maxLon: 64.0,
    cities: []
  },
  {
    name: 'Zone4',
    minLat: 7.0,
    maxLat: 84.0,
    minLon: -170.0,
    maxLon: -35.0,
    cities: []
  },
  {
    name: 'Zone5',
    minLat: -56.0,
    maxLat: 12.0,
    minLon: -81.0,
    maxLon: -34.0,
    cities: []
  },
  {
    name: 'Zone6',
    minLat: 6.0,
    maxLat: 17.0,
    minLon: -93.0,
    maxLon: -77.0,
    cities: []
  },
  {
    name: 'Zone7',
    minLat: -50.0,
    maxLat: 0.0,
    minLon: 110.0,
    maxLon: -180.0,
    cities: []
  },
  {
    name: 'Zone8',
    minLat: 66.5,
    maxLat: 90.0,
    minLon: -180.0,
    maxLon: 180.0,
    cities: []
  },
  {
    name: 'Zone9',
    minLat: -90.0,
    maxLat: -66.5,
    minLon: -180.0,
    maxLon: 180.0,
    cities: []
  }
];

const nearestCitiesStream = ({ from, cities, range }) => {
  return new Promise((resolve, reject) => {
    const cityStream = new CitiesWorker({ cities, from, zones });
    const distanceCalculator = new DistanceCalculatorWorker({ from, range });
    const nearCities = [];

    pipeline(cityStream, distanceCalculator, (err) => {
      if (err) {
        log.error('Error processing cities:', err);
        reject(err);
      } else {
        // The processing is complete
        log.info('Processing completed');
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
