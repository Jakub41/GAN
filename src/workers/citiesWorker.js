import NodeCache from 'node-cache';
import { Readable, Transform } from 'stream';
import { getDistance } from '../utils/calculations.js';
import logger from '../loaders/logger.js';

const log = logger();

const cache = new NodeCache({ stdTTL: 3600 });

class CitiesWorker extends Readable {
  constructor({ cities, from, zones }) {
    super({ objectMode: true });
    this.cities = cities.filter((city) => city.guid !== from[0].guid);
    this.batchSize = 15000;
    this.zones = zones;
    this.assignCitiesToZones(cities, zones);
  }

  assignCitiesToZones(cities, zones) {
    cities.forEach((city) => {
      const zone = this.findMatchingZone(city, zones);
      if (zone) {
        zone.cities.push(city);
      }
    });
  }

  findMatchingZone(city, zones) {
    return zones.find((zone) => {
      const { latitude, longitude } = city;
      return (
        latitude >= zone.minLat &&
        latitude <= zone.maxLat &&
        longitude >= zone.minLon &&
        longitude <= zone.maxLon
      );
    });
  }

  _read() {
    if (this.zones.length === 0) {
      this.push(null);
      return;
    }

    const zone = this.zones.shift();
    const batch = zone.cities.splice(0, this.batchSize);
    this.push(batch);
    log.info(`⚙️⚙️⚙️ CitiesWorker processing for ${zone.name}`);
  }
}

class DistanceCalculatorWorker extends Transform {
  constructor({ from, range }) {
    super({ objectMode: true });
    this.from = from;
    this.range = range;
  }

  async _transform(batch, encoding, callback) {
    const startTime = performance.now();
    const nearCities = [];
    const cacheKeys = batch.map((city) => `${city.guid}-${this.from[0].guid}`);
    const cachedDistances = cache.mget(cacheKeys);
    console.log('----------------------------------------');
    console.log('-------------BATCHES HAPPENING----------');
    console.log('----------------------------------------');
    for (const [index, city] of batch.entries()) {
      const cacheKey = cacheKeys[index];
      const cachedDistance = cachedDistances[index];

      if (cachedDistance !== undefined) {
        // Use cached distance if available
        nearCities.push(cachedDistance);
      } else {
        const distance = await getDistance({
          from: this.from[0].guid,
          to: city.guid
        });

        if (distance !== null && distance <= this.range) {
          let { guid, longitude, latitude, address, tags } = city;
          nearCities.push({ guid, longitude, latitude, address, tags, distance });

          // Cache the distance for future use
          cache.set(cacheKey, distance);
        }
      }
    }

    const endTime = performance.now(); // Stop timing
    const bachingTime = endTime - startTime;

    setTimeout(() => {
      console.log('BachingTime took ms', bachingTime.toFixed(2));
    }, 30000);

    this.push(nearCities);
    callback();
  }
  _flush(callback) {
    this.totalBatches = this.batchIndex;
    callback();
  }
}

export { CitiesWorker, DistanceCalculatorWorker };
