import { filterCities } from '../helpers/helpers.js';

const getCityByTag = ({ tag, isActive }) => filterCities({ tag, isActive });

export default getCityByTag;
