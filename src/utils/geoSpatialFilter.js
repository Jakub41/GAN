export const geoSpatialFilter = ({ cities, boundaries }) => {
  return cities.filter((city) => {
    const { latitude, longitude } = city;

    if (latitude === 0 && longitude === 0) {
      return false;
    }

    // Check if the city's latitude and longitude are within the bounds
    const isWithinLatitudeBounds =
      latitude > boundaries.minLatitude && latitude < boundaries.maxLatitude;
    const isWithinLongitudeBounds =
      longitude > boundaries.minLongitude && longitude < boundaries.maxLongitude;

    return isWithinLatitudeBounds && isWithinLongitudeBounds;
  });
};
