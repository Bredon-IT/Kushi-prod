import axios from "axios";
import { Invoice } from "../components/types/Invoice";
import Global_API_BASE from "./GlobalConstants";

const API_BASE = Global_API_BASE + "/api/admin"; // adjust to your backend URL

export const getAllInvoices = async (): Promise<Invoice[]> => {
  const res = await axios.get(`${API_BASE}/invoices`);
  return res.data;
};
