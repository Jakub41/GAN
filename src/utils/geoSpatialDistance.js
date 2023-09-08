const R = 6371;

export function geoSpatialDistance(a, b) {
  const lat1 = deg2rad(a.latitude);
  const lat2 = deg2rad(b.latitude);
  const deltaLatitude = deg2rad(a.latitude - b.latitude);
  const deltaLongitude = deg2rad(a.longitude - b.longitude);
  const x = haversine(deltaLatitude) + Math.cos(lat1) * Math.cos(lat2) * haversine(deltaLongitude);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c; // Distance in km
}

function haversine(theta) {
  return Math.sin(theta / 2) ** 2;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function rad2deg(rad) {
  return rad * (180 / Math.PI);
}
