import { Router } from 'express';
import logger from '../loaders/logger.js';
import { getCityByGuid, getAllCities, getCitiesWithinArea } from '../services/cities.js';
import { filterCities, successResponseHandler, unsuccessResponse } from '../utils/helpers.js';
import { getDistance, nearestCitiesStream } from '../utils/calculations.js';

const log = logger();
const route = Router();

export default (app) => {
  const jobWorker = {};
  const workerGuid = '2152f96f-50c7-4d76-9e18-f7033bd14428';

  app.use('/', route);

  route.get('/area', async (req, res) => {
    const { from, distance } = req.query;

    const resultsUrl = `${req.protocol}://${req.get('host')}/api/area-result/${workerGuid}`;
    jobWorker[workerGuid] = {
      status: 'pending',
      data: null
    };

    res.status(202).json({ resultsUrl });

    const fromCity = await getCityByGuid({ guid: from });
    const allCities = await getAllCities();

    jobWorker[workerGuid].status = 'processing';

    const calculateCitiesWithinRange = async () => {
      try {
        // Simulate a delay before completing the job
        await new Promise((resolve) => setTimeout(resolve, 100));

        /**
         * This part of the code uses a stream and batch approach
         * is much slower then the other approach
         * but simulates more real situation like a worker doing it job
         *  */
        // const citiesWithinRange = await nearestCitiesStream({
        //   originPoint: fromCity,
        //   cities: allCities,
        //   radius: parseFloat(distance)
        // });

        /**
         * This part of the code uses a faster approach to calculate the nearest cities
         * from the origin city but for the sake of the testing script
         * a timeout is added to simulate a worker job process
         */
        const citiesWithinRange = await getCitiesWithinArea({
          from: fromCity,
          cities: allCities,
          radius: parseFloat(distance)
        });

        jobWorker[workerGuid].status = 'completed';
        jobWorker[workerGuid].data = { cities: citiesWithinRange };
        log.info('⚙️⚙️⚙️ Worker job completed!');
      } catch (error) {
        jobWorker[workerGuid].status = 'failed';
        log.error('⚠️⚠️⚠️ Worker job failed %s:', error.message);
      }
    };

    setTimeout(calculateCitiesWithinRange);
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
