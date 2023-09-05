import { Router } from 'express';
import citiesByTag from './citiesByTag.js';
import allCities from './allCities.js';

// Routing
// Here the import/export of all routes
export default () => {
  const app = Router();
  // Routes passing app as Router()
  // That initialize as a route for the API endpoint
  citiesByTag(app);
  allCities(app);

  return app;
};
