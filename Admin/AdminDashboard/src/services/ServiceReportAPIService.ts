// src/services/ServiceReportAPIService.ts
import axios from "axios";
import Global_API_BASE from "./GlobalConstants";

const API_URL = Global_API_BASE + "/api/admin";

class ServiceReportAPIService {
  async getServiceReport() {
    const response = await axios.get(`${API_URL}/service-report`);
    return response.data;
  }

  async downloadServiceReportCSV() {
  const response = await axios.get(`${API_URL}/service-report/csv`, {
    responseType: "blob", // important
  });

  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "service_report.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
}

export default new ServiceReportAPIService();
