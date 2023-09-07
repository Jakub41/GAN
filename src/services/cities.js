import { getDistance } from '../utils/calculations.js';
import { filterCities, getCityData } from '../utils/helpers.js';

const getAllCities = () => getCityData();
const getCityByTag = ({ tag, isActive }) => filterCities({ tag, isActive });
const getCitiesDistance = ({ from, to }) => getDistance({ from, to });
const getCityByGuid = ({ guid }) => filterCities({ guid });

export { getAllCities, getCitiesDistance, getCityByGuid, getCityByTag };
