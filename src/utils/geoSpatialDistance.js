import { EARTH_RADIUS_KM, deg2rad, haversine } from './geoSpatialTools.js';

export function geoSpatialDistance(a, b) {
  const lat1 = deg2rad(a.latitude);
  const lat2 = deg2rad(b.latitude);
  const deltaLatitude = deg2rad(a.latitude - b.latitude);
  const deltaLongitude = deg2rad(a.longitude - b.longitude);
  const x = haversine(deltaLatitude) + Math.cos(lat1) * Math.cos(lat2) * haversine(deltaLongitude);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return EARTH_RADIUS_KM * c; // Distance in km
}
