import axios from "axios";
import Global_API_BASE from "./GlobalConstants";

const API_BASE_URL = Global_API_BASE + "/api/admin";

export const DashboardAPIService = {
  getTopRatedServices: () => axios.get(`${API_BASE_URL}/top-rated-services`),
  getTopBookedCustomers: () => axios.get(`${API_BASE_URL}/top-booked-customers`)
};
