import axios from "axios";
import Global_API_BASE from "./GlobalConstants"; // ✅ import your base API URL

const API_BASE_URL = `${Global_API_BASE}/api/admin`; // ensure no trailing slash

// ✅ Fetch category-wise bookings from backend
export const getCategoryWiseBookings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category-wise-bookings`);
    console.log("Raw API Response:", response.data);

    // ✅ Always return a clean array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching category-wise bookings:", error);
    return [];
  }
};
