import axios from "axios";

const API_URL = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/bookings";

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
    return axios.put(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin/${bookingId}/assign-worker`, {
      workername: workerName,
      userRole: userRole,
    });
  },
};

export default BookingsAPIService;
