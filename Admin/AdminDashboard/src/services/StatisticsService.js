import axios from 'axios';
import Global_API_BASE from './GlobalConstants';
 
const API_URL = Global_API_BASE + '/api/admin/statistics?timePeriod=all-time'; // Update if needed
 
const getStatistics = (timePeriod='all-time') => {
  return axios.get(`${API_URL}?timePeriod=${timePeriod}`);
};
 
export default { getStatistics };
 