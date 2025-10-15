import axios from "axios";
import { Invoice } from "../components/types/Invoice";

const API_BASE = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin"; // adjust to your backend URL

export const getAllInvoices = async (): Promise<Invoice[]> => {
  const res = await axios.get(`${API_BASE}/invoices`);
  return res.data;
};
