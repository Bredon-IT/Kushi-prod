import axios from 'axios';
import Global_API_BASE from './GlobalConstants';

const API_BASE_URL = Global_API_BASE + "/api/admin";

const getOverview = (timePeriod = 'all-time') => {
  return axios.get(`${API_BASE_URL}/overview`, { params: { timePeriod } });
};

export default { getOverview };
