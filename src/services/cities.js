import { filterCities } from '../utils/helpers.js';
import { getDistance } from '../utils/calculations.js';

const getCityByTag = ({ tag, isActive }) => filterCities({ tag, isActive });
const getCitiesDistance = ({ from, to }) => getDistance({ from, to });
const getCityByGuid = ({ guid }) => filterCities({ guid });

export { getCitiesDistance, getCityByTag, getCityByGuid };
