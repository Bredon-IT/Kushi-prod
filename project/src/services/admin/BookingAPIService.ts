import axios from "axios";
import Global_API_BASE from "./GlobalConstants";

const API_URL = Global_API_BASE + "/api/bookings";

const BookingsAPIService = {
  getAllBookings: () => axios.get(`${API_URL}/allbookings`),
  createBooking: (bookingData: any) => axios.post(`${API_URL}/newbookings`, bookingData),
  updateBookingStatus: (bookingId: number, status: string) =>
    axios.put(`${API_URL}/${bookingId}/status`, { status }),
  sendBookingNotification: (email: string, phoneNumber: string, status: string) =>
    axios.post(`${API_URL}/notify`, { email, phoneNumber, status }),
  updateBookingDiscount: (bookingId: number, discount: number) =>
    axios.put(`${API_URL}/${bookingId}/discount`, { discount }),
  deleteBooking: (bookingId: number) => axios.delete(`${API_URL}/${bookingId}`),

  // Assign Worker
  assignWorker: (bookingId: number, workerName: string, userRole: string) => {
    return axios.put(Global_API_BASE + `/api/admin/${bookingId}/assign-worker`, {
      workername: workerName,
      userRole: userRole,
    });
  },
};

export default BookingsAPIService;
