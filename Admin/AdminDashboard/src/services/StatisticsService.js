import axios from 'axios';
 
const API_URL = 'https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin/statistics?timePeriod=all-time'; // Update if needed
 
const getStatistics = (timePeriod='all-time') => {
  return axios.get(`${API_URL}?timePeriod=${timePeriod}`);
};
 
export default { getStatistics };
 