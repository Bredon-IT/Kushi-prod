import axios from "axios";

const API_BASE_URL = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin";

export const DashboardAPIService = {
  getTopRatedServices: () => axios.get(`${API_BASE_URL}/top-rated-services`),
  getTopBookedCustomers: () => axios.get(`${API_BASE_URL}/top-booked-customers`)
};
