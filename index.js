import { ok, strictEqual } from 'assert';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import logger from './src/loaders/logger.js';
import { startServer } from './server.js';

const protocol = 'http';
const host = '127.0.0.1';
const port = '8080';
const server = `${protocol}://${host}:${port}`;

const { exists, remove, createWriteStream, readFile } = fs;
const log = logger();

(async () => {
  // init the server
  await startServer({ server, port, log });

  // get a city by tag ("excepteurus")
  let result = await fetch(`${server}/api/cities-by-tag?tag=excepteurus&isActive=true`);

  // oh, authentication is required
  strictEqual(result.status, 401);
  result = await fetch(`${server}/api/cities-by-tag?tag=excepteurus&isActive=true`, {
    headers: { Authorization: 'bearer dGhlc2VjcmV0dG9rZW4=' }
  });

  // ah, that's better
  strictEqual(result.status, 200);
  let body = await result.json();

  // we expect only one city to match
  strictEqual(body.cities.length, 1);

  // let's just make sure it's the right one
  const city = body.cities[0];
  strictEqual(city.guid, 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408');
  strictEqual(city.latitude, -1.409358);
  strictEqual(city.longitude, -37.257104);

  // find the distance between two cities
  result = await fetch(
    `${server}/api/distance?from=${city.guid}&to=17f4ceee-8270-4119-87c0-9c1ef946695e`,
    {
      headers: { Authorization: 'bearer dGhlc2VjcmV0dG9rZW4=' }
    }
  );

  // we found it
  strictEqual(result.status, 200);
  body = await result.json();

  // let's see if the calculations agree
  strictEqual(body.from.guid, 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408');
  strictEqual(body.to.guid, '17f4ceee-8270-4119-87c0-9c1ef946695e');
  strictEqual(body.unit, 'km');
  strictEqual(body.distance, 13376.38);

  // now it get's a bit more tricky. We want to find all cities within 250 km of the
  // the one we found earlier. That might take a while, so rather than waiting for the
  // result we expect to get a url that can be polled for the final result
  result = await fetch(`${server}/api/area?from=${city.guid}&distance=250`, {
    headers: { Authorization: 'bearer dGhlc2VjcmV0dG9rZW4=' },
    timeout: 25
  });

  // so far so good
  strictEqual(result.status, 202);
  body = await result.json();

  // THE GUID 2152f96f-50c7-4d76-9e18-f7033bd14428 does not exist
  strictEqual(body.resultsUrl, `${server}/api/area-result/ed354fef-31d3-44a9-b92f-4a3bd7eb0408`);

  let status;
  do {
    result = await fetch(body.resultsUrl, {
      headers: { Authorization: 'bearer dGhlc2VjcmV0dG9rZW4=' }
    });
    status = result.status;
    // return 202 while the result is not yet ready, otherwise 200
    ok(status === 200 || status === 202, 'Unexpected status code');

    // let's wait a bit if the result is not ready yet
    if (status === 202) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } while (status !== 200);

  // so we got a result. let's see if it looks as expected
  body = await result.json();
  let { cities } = body;
  strictEqual(cities.length, 15);

  // and let's look at a sample
  const filteredByAddress = cities.filter(
    (city) => city.address === '859 Cyrus Avenue, Devon, Missouri, 1642'
  );
  strictEqual(filteredByAddress.length, 1);

  // okay, nice we got this far. we are almost there. but let's have an endpoint
  // for downloading all cites.
  // that's quite a bit of data, so make sure to support streaming
  result = await fetch(`${server}/api/all-cities`, {
    headers: { Authorization: 'bearer dGhlc2VjcmV0dG9rZW4=' }
  });

  if (await exists('./all-cities.json')) {
    await remove('./all-cities.json');
  }

  await new Promise((resolve, reject) => {
    const dest = createWriteStream('./all-cities.json');
    result.body.on('error', (err) => {
      reject(err);
    });
    dest.on('finish', () => {
      resolve();
    });
    dest.on('error', (err) => {
      reject(err);
    });
    result.body.pipe(dest);
  });

  // are they all there?
  const file = await readFile('./all-cities.json');
  cities = JSON.parse(file);
  strictEqual(cities.length, 100000);

  console.log('You made it! Now make your code available on git and send us a link');
})().catch((err) => {
  console.log(err);
});
