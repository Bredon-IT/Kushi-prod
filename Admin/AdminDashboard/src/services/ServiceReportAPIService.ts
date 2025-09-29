// src/services/ServiceReportAPIService.ts
import axios from "axios";

const API_URL = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin";

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
