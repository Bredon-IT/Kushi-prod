import axios from "axios";
import Global_API_BASE from "./GlobalConstants";
 
const getFinancialStats = (queryParams) => {
  return axios.get(Global_API_BASE + `/api/admin/financial-statistics${queryParams}`);
};
 
export default { getFinancialStats };
 
 