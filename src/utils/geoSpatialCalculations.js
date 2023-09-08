import { EARTH_RADIUS_KM, deg2rad, haversine, rad2deg } from './geoSpatialTools.js';

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
