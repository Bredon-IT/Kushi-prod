// src/services/OverviewService.js
import axios from "axios";
import Global_API_BASE from "./GlobalConstants";
 
const API_BASE_URL = Global_API_BASE + "/api/admin";
 
// FINANCIAL PAGE (pass query string starting with '?' OR empty string)
const getFinancialOverview = (queryParams = "") => {
  // example queryParams -> "?filter=month" or "?startDate=2025-01-01&endDate=2025-01-31"
  return axios.get(`${API_BASE_URL}/overview${queryParams}`);
};
 
// DASHBOARD (always all-time)
const getDashboardOverview = () => {
  return axios.get(`${API_BASE_URL}/dashboard-overview`);
};
 
export default { getFinancialOverview, getDashboardOverview };
 
 