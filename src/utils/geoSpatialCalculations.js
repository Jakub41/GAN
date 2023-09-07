const EARTH_RADIUS_KM = 6371;

export const geoSpatialCalculations = ({ originLocation, radius }) => {
  const deltaLatitude = radius / EARTH_RADIUS_KM;
  const deltaLongitude =
    2 *
    Math.asin(
      Math.sqrt(
        haversine(radius / EARTH_RADIUS_KM) / Math.cos(deg2rad(originLocation.latitude)) ** 2
      )
    );

  return {
    deltaLatitude: rad2deg(deltaLatitude),
    deltaLongitude: rad2deg(deltaLongitude)
  };
};

const haversine = (theta) => Math.sin(theta / 2) ** 2;

const deg2rad = (deg) => deg * (Math.PI / 180);

const rad2deg = (rad) => rad * (180 / Math.PI);
