import NodeCache from 'node-cache';
import { Readable, Transform } from 'stream';
import { getDistance } from '../utils/calculations.js';
import logger from '../loaders/logger.js';

const log = logger();

const cache = new NodeCache({ stdTTL: 3600 });

class CitiesWorker extends Readable {
  constructor({ cities, from }) {
    super({ objectMode: true });
    this.cities = cities.filter((city) => city.guid !== from[0].guid);
    this.batchSize = 5000;
  }

  _read() {
    if (this.cities.length === 0) {
      this.push(null);
      return;
    }

    // Push a batch of cities
    const batch = this.cities.splice(0, this.batchSize);
    this.push(batch);
    log.info('⚙️⚙️⚙️ CitiesWorker processing');
  }
}

class DistanceCalculatorWorker extends Transform {
  constructor({ from, range }) {
    super({ objectMode: true });
    this.from = from;
    this.range = range;
    this.batchIndex = 0;
    this.totalBatches = 0;
  }

  async _transform(batch, encoding, callback) {
    const nearCities = [];
    console.log('----------------------------------------');
    console.log('-------------BATCHES HAPPENING----------');
    console.log('----------------------------------------');
    for (const city of batch) {
      const cacheKey = `${city.guid}-${this.from[0].guid}`;
      const cachedDistance = cache.get(cacheKey);

      if (cachedDistance !== undefined) {
        // Use cached distance if available
        nearCities.push(cachedDistance);
      } else {
        const distance = await getDistance({
          from: this.from[0].guid,
          to: city.guid
        });
        // console.log('DISTANCE', distance);
        if (distance !== null && distance <= this.range) {
          console.log('DISTANCE TO PUSH', distance);
          let { guid, longitude, latitude, address, tags } = city;
          nearCities.push({ guid, longitude, latitude, address, tags, distance });

          // Cache the distance for future use
          cache.set(cacheKey, distance);
        }
      }
    }

    this.batchIndex++;
    log.info('Batch processed', {
      batchIndex: this.batchIndex,
      totalBatches: this.totalBatches
    });

    this.push(nearCities);
    callback();
  }
  _flush(callback) {
    this.totalBatches = this.batchIndex;
    callback();
  }
}

export { CitiesWorker, DistanceCalculatorWorker };
