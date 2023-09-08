const EARTH_RADIUS_KM = 6371;

function haversine(theta) {
  return Math.sin(theta / 2) ** 2;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function rad2deg(rad) {
  return rad * (180 / Math.PI);
}

export { EARTH_RADIUS_KM, deg2rad, haversine, rad2deg };
