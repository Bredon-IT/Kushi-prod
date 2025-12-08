import axios from "axios";
import Global_API_BASE from "./GlobalConstants";
import { InspectionUpdateRequest } from "../components/types/InspectionUpdateRequest";

const API_URL = Global_API_BASE + "/api/bookings/inspections";

const InspectionAPIService = {
  // Fetch all bookings for inspection, optionally filtered by status
  getAllInspections: (status: string | null = null) => {
    let url = `${API_URL}/all`;
    if (status) {
      url += `?status=${status}`;
    }
    // Backend returns the Customer entity for filtered list
    return axios.get(url);
  },

  // Update inspection details (amount, status, site visit details)
  updateInspection: (bookingId: number, data: InspectionUpdateRequest) => {
    return axios.put(`${API_URL}/${bookingId}`, data);
  },
};

export default InspectionAPIService;
