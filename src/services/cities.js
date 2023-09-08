import { getDistance } from '../utils/calculations.js';
import { geoSpatialBoundsCalculations } from '../utils/geoSpatialBoundsCalculations.js';
import { geoSpatialDistance } from '../utils/geoSpatialDistance.js';
import { geoSpatialCalculations } from '../utils/geospatialCalculations.js';
import { geoSpatialFilter } from '../utils/geospatialFilter.js';
import { filterCities, getCityData } from '../utils/helpers.js';

const getAllCities = () => getCityData();
const getCityByTag = ({ tag, isActive }) => filterCities({ tag, isActive });
const getCitiesDistance = ({ from, to }) => getDistance({ from, to });
const getCityByGuid = ({ guid }) => filterCities({ guid });

const getCitiesWithinArea = async ({ from, cities, radius }) => {
  const outerBounds = geoSpatialCalculations({ originLocation: from, radius });
  const boundaries = geoSpatialBoundsCalculations({ originPoint: from, outerBounds });
  const citiesWithinArea = geoSpatialFilter({ cities, boundaries });

  return citiesWithinArea.filter((city) => {
    const distance = geoSpatialDistance(from, city);
    return distance > 0 && distance <= radius;
  });
};

export { getAllCities, getCitiesDistance, getCityByGuid, getCityByTag, getCitiesWithinArea };
