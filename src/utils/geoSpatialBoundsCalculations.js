export const geoSpatialBoundsCalculations = ({ originPoint, outerBounds }) => {
  const { deltaLatitude, deltaLongitude } = outerBounds;

  // Adjust the originPoint coordinates
  const coordinates = [
    geoSpatialAdjust(originPoint, [deltaLatitude, 0]),
    geoSpatialAdjust(originPoint, [-deltaLatitude, 0]),
    geoSpatialAdjust(originPoint, [0, deltaLongitude]),
    geoSpatialAdjust(originPoint, [0, -deltaLongitude])
  ];

  let maxLatitude = coordinates[0].latitude;
  let minLatitude = coordinates[0].latitude;
  let maxLongitude = coordinates[0].longitude;
  let minLongitude = coordinates[0].longitude;

  for (const coordinate of coordinates) {
    if (coordinate.latitude > maxLatitude) {
      maxLatitude = coordinate.latitude;
    }
    if (coordinate.latitude < minLatitude) {
      minLatitude = coordinate.latitude;
    }
    if (coordinate.longitude > maxLongitude) {
      maxLongitude = coordinate.longitude;
    }
    if (coordinate.longitude < minLongitude) {
      minLongitude = coordinate.longitude;
    }
  }

  return {
    maxLatitude: parseFloat(maxLatitude.toFixed(2)),
    minLatitude: parseFloat(minLatitude.toFixed(2)),
    maxLongitude: parseFloat(maxLongitude.toFixed(2)),
    minLongitude: parseFloat(minLongitude.toFixed(2))
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
