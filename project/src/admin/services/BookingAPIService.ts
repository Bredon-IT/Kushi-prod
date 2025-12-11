import axios from "axios";
import Global_API_BASE from "./GlobalConstants";

const API_URL = Global_API_BASE + "/api/bookings";

const BookingsAPIService = {
  // Fetch all bookings
  getAllBookings: () => axios.get(`${API_URL}/allbookings`),

  // Customer-created booking
  createBooking: (bookingData: any) =>
    axios.post(`${API_URL}/newbookings`, bookingData),

  // Update booking status
  updateBookingStatus: (bookingId: number, status: string) =>
    axios.put(`${API_URL}/${bookingId}/status`, { status }),

  // Notification
  sendBookingNotification: (email: string, phoneNumber: string, status: string) =>
    axios.post(`${API_URL}/notify`, { email, phoneNumber, status }),

  // Discount update
  updateBookingDiscount: (bookingId: number, discount: number) =>
    axios.put(`${API_URL}/${bookingId}/discount`, { discount }),

  // Delete booking
  deleteBooking: (bookingId: number) =>
    axios.delete(`${API_URL}/${bookingId}`),

  // Assign Worker (Correct endpoint)
  assignWorker: (bookingId: number, workerName: string, userRole: string) =>
    axios.put(Global_API_BASE + `/api/admin/${bookingId}/assign-worker`, {
      workername: workerName,
      userRole: userRole,
    }),

  // REMOVE Worker (Correct endpoint + correct key = workername)
  removeWorker: (bookingId: number, workerName: string) =>
    axios.put(Global_API_BASE + `/api/admin/${bookingId}/remove-worker`, {
      workername: workerName,
    }),

  // ⭐ ADMIN Create Booking
  adminCreateBooking: (payload: any) =>
    axios.post(`${API_URL}/admin/create`, payload),
};

export default BookingsAPIService;
