export const geoSpatialBoundsCalculations = ({ originPoint, outerBounds }) => {
  const { deltaLatitude, deltaLongitude } = outerBounds;

  // Adjust the originPoint coordinates
  const north = geoSpatialAdjust(originPoint, [deltaLatitude, 0]);
  const south = geoSpatialAdjust(originPoint, [-deltaLatitude, 0]);
  const east = geoSpatialAdjust(originPoint, [0, deltaLongitude]);
  const west = geoSpatialAdjust(originPoint, [0, -deltaLongitude]);

  console.log('bounds: ', {
    maxLatitude: north.latitude,
    minLatitude: south.latitude,
    maxLongitude: east.longitude,
    minLongitude: west.longitude
  });

  return {
    maxLatitude: parseFloat(north.latitude.toFixed(2)),
    minLatitude: parseFloat(south.latitude.toFixed(2)),
    maxLongitude: parseFloat(east.longitude.toFixed(2)),
    minLongitude: parseFloat(west.longitude.toFixed(2))
  };
};

const geoSpatialAdjust = (origin, by) => {
  const adjusted = { ...origin };
  adjusted.latitude += by[0];
  adjusted.longitude += by[1];

  return {
    latitude: adjusted.latitude,
    longitude: adjusted.longitude
  };
};
