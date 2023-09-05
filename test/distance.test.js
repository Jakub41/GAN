import { strictEqual } from 'node:assert';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { distanceBetweenCitiesByHaversineFormula } from '../src/utils/calculations.js';

describe('Distance between 2 cities', () => {
  test('calculate the distance', () => {
    const fromCity = {
      lat: Number(16.61159),
      lon: Number(172.7791)
    };

    const toCity = {
      lat: Number(-20.1017),
      lon: Number(172.7791)
    };

    const distance = distanceBetweenCitiesByHaversineFormula({ fromCity, toCity });
    strictEqual(Number(distance), 4082.33);
  });

  test('failed to calculate', () => {
    const fromCity = {};
    const toCity = {};

    const distance = distanceBetweenCitiesByHaversineFormula({ fromCity, toCity });
    strictEqual(Number(distance), 0);
  });
});
