import { Router } from 'express';
import allCities from './allCities.js';
import citiesByTag from './citiesByTag.js';
import citiesDistance from './citiesDistance.js';
import citiesWithinArea from './citiesWithinArea.js';
import cityByGuid from './cityByGuid.js';

// Routing
// Here the import/export of all routes
export default () => {
  const app = Router();
  // Routes passing app as Router()
  // That initialize as a route for the API endpoint
  citiesByTag(app);
  allCities(app);
  citiesDistance(app);
  citiesWithinArea(app);
  cityByGuid(app);

  return app;
};
