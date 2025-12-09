import axios from 'axios';
import Global_API_BASE from './GlobalConstants';

const API_BASE_URL = Global_API_BASE + '/api/customers';

const CustomerAPIService = {
  // ✅ Get all customers
  getAllCustomers: async () => {
    const res = await axios.get(`${API_BASE_URL}`);
    return res.data;
  },

  // ✅ Get logged-in customers (user_id NOT null)
  getLoggedInCustomers: async () => {
    const res = await axios.get(`${API_BASE_URL}/logged-in`);
    return res.data;
  },

  // ✅ Get guest customers (user_id null)
  getGuestCustomers: async () => {
    const res = await axios.get(`${API_BASE_URL}/guests`);
    return res.data;
  },

  // ✅ Get completed bookings (booking_status = completed)
  getCompletedCustomers: async () => {
    const res = await axios.get(`${API_BASE_URL}/completed`);
    return res.data;
  },

  // ✅ Get customers by booking status (optional: confirmed, cancelled, pending)
  getCustomersByBookingStatus: async (status: string) => {
    const res = await axios.get(`${API_BASE_URL}/by-booking-status`, {
      params: { status },
    });
    return res.data;
  },

  // ✅ Block a customer (example, implement in backend)
blockCustomer: async (id: number) => {
  const res = await axios.put(`${API_BASE_URL}/${id}/status`, { status: 'blocked' });
  return res.data;
},


  // ✅ Add reward (example, implement in backend)
  addReward: async (id: number) => {
    const res = await axios.post(`${API_BASE_URL}/${id}/reward`);
    return res.data;
  },

  // ✅ Add coupon (example, implement in backend)
  addCoupon: async (id: number) => {
    const res = await axios.post(`${API_BASE_URL}/${id}/coupon`);
    return res.data;
  },
};

export default CustomerAPIService;
