import axios from 'axios';

const API_BASE_URL = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin";

const getOverview = (timePeriod = 'all-time') => {
  return axios.get(`${API_BASE_URL}/overview`, { params: { timePeriod } });
};

export default { getOverview };
