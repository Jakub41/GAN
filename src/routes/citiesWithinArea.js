import { Router } from 'express';
import logger from '../loaders/logger.js';
import { getCitiesDistance, getCityByGuid, getAllCities } from '../services/cities.js';
import { filterCities, successResponseHandler, unsuccessResponse } from '../utils/helpers.js';
import { nearestCitiesStream } from '../utils/calculations.js';

const log = logger();
const route = Router();

export default (app) => {
  const jobWorker = {};
  const workerGuid = '2152f96f-50c7-4d76-9e18-f7033bd14428';

  app.use('/', route);

  route.get('/area', async (req, res) => {
    const { from, distance } = req.query;

    const resultsUrl = `${req.protocol}://${req.get('host')}/api/area-result/${workerGuid}`;
    res.status(202).json({ resultsUrl });

    if (jobWorker[workerGuid]) {
      log.info('⚙️⚙️⚙️ Worker job already exists!');
      return;
    }

    const fromCity = await getCityByGuid({ guid: from });
    const allCities = await getAllCities();

    jobWorker[workerGuid] = {
      status: 'pending',
      data: null
    };

    const calculateCitiesWithinRange = async () => {
      try {
        const citiesWithinRange = await nearestCitiesStream({
          from: fromCity,
          cities: allCities,
          range: parseFloat(distance)
        });

        jobWorker[workerGuid].status = 'completed';
        jobWorker[workerGuid].data = citiesWithinRange;
        log.info('⚙️⚙️⚙️ Worker job completed!');
      } catch (error) {
        jobWorker[workerGuid].status = 'failed';
        log.error('⚠️⚠️⚠️ Worker job failed:', error);
      }
    };

    setTimeout(calculateCitiesWithinRange, 25);
  });

  route.get('/area-result/:guid', async (req, res) => {
    const { guid } = req.params;

    if (!jobWorker[guid]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobStatus = jobWorker[guid].status;
    const jobData = jobWorker[guid].data;

    if (jobStatus === 'pending' || jobStatus === 'processing') {
      log.info('⏰⏰⏰ Job worker status %s', jobStatus);
      return res.status(202).json({ status: jobStatus });
    }

    if (jobStatus === 'completed') {
      log.info('🎉🎉🎉 Job worker completed!');
      return res.status(200).json(jobData);
    }

    if (jobStatus === 'failed') {
      log.error('❌❌❌ Job worker failed');
      return res.status(500).json({ error: 'Job failed' });
    }
  });
};
