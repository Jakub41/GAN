import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../loaders/logger.js';
import { getAllCities } from '../services/cities.js';

const log = logger();

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/all-cities', async (req, res, next) => {
    log.info('⬇️⬇️⬇️ Generatring all-cities.json');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputFile = path.resolve(__dirname, '../../all-cities.json'); // Output JSON file path in the root

    const allCitiesData = await getAllCities();
    const jsonData = JSON.stringify(allCitiesData);

    fs.writeFileSync(outputFile, jsonData);

    res.setHeader('Content-Disposition', 'attachment; filename="all-cities.json"');
    res.setHeader('Content-Type', 'application/json');

    const readStream = fs.createReadStream(outputFile);

    readStream.on('open', () => {
      readStream.pipe(res);
    });

    readStream.on('error', (err) => {
      log.error(err.message);
      res.status(500).end();
    });

    res.on('close', () => {
      log.info('🎉🎉🎉 Completed!');
      readStream.close(); // Close the read stream
    });
  });
};
