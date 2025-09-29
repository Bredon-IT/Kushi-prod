import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookingsAPIService from '../services/BookingAPIService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  IndianRupee,
  Search,
} from 'lucide-react';

export function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  const [workerInputs, setWorkerInputs] = useState<{ [key: number]: string }>({});
  const [userRole] = useState<string>('Admin'); // Could come from auth context

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedBooking ? 'hidden' : 'auto';
  }, [selectedBooking]);

  /** Fetch all bookings */
  const fetchBookings = () => {
    setLoading(true);
    BookingsAPIService.getAllBookings()
      .then((response) => {
        console.log('Bookings API Response:', response.data);

        const normalized = response.data.map((b: any) => ({
          booking_id: b.booking_id,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_number: b.customer_number,
          booking_service_name: b.booking_service_name,
          booking_amount: b.booking_amount,
          grand_total: b.grand_total,
         booking_date: b.booking_date || b.bookingDate, // ✅ fallback
  booking_time: b.booking_time,
          bookingStatus: b.bookingStatus || b.booking_status,
          city: b.city,
          address: b.address,
          discount: b.discount || 0,
          worker_assign: b.worker_assign || [], // Assigned workers
          canceledBy: b.canceledBy || '', // Who cancelled
        }));
        setBookings(normalized);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch bookings:', error);
        setLoading(false);
      });
  };

  /** Assign worker to booking */
  const assignWorker = async (bookingId: number) => {
    const workerName = workerInputs[bookingId];
    if (!workerName) {
      alert('Please enter a worker name before assigning.');
      return;
    }
    try {
      await axios.put(`/api/admin/${bookingId}/assign-worker`, { workerName });
      alert('✅ Worker assigned successfully');
      setWorkerInputs((prev) => ({ ...prev, [bookingId]: '' }));
      fetchBookings();
    } catch (error) {
      console.error('Failed to assign worker:', error);
      alert('❌ Failed to assign worker.');
    }
  };

  /** Filter bookings by status and search term */
  const filteredBookings = bookings
    .filter((booking) => {
      const status = booking.bookingStatus?.toLowerCase();
      switch (filter) {
        case 'all':
          return true;
        case 'pending':
          return status === 'pending';
        case 'confirmed':
          return status === 'confirmed';
        case 'completed':
          return status === 'completed';
        case 'cancelled':
          return status === 'cancelled';
        default:
          return false;
      }
    })
    .filter((booking) => {
      const term = searchTerm.toLowerCase();
      return (
        booking.customer_name?.toLowerCase().includes(term) ||
        booking.customer_number?.toLowerCase().includes(term) ||
        booking.booking_service_name?.toLowerCase().includes(term)
      );
    })
   .sort((a, b) => {
  const dateA = new Date(`${a.booking_date}T${a.booking_time || '00:00'}`);
  const dateB = new Date(`${b.booking_date}T${b.booking_time || '00:00'}`);
  return dateB.getTime() - dateA.getTime(); // Most recent first
});


  /** Update booking status (confirm, cancel, complete) */
  const confirmOrder = (booking: any, action: 'confirmed' | 'cancelled' | 'completed') => {
  const originalStatus = booking.bookingStatus;

  // If admin is canceling, set canceledBy = 'admin'
  const canceledBy = action === 'cancelled' && userRole === 'Admin' ? 'admin' : '';

  setBookings((prev) =>
    prev.map((b) =>
      b.booking_id === booking.booking_id
        ? { ...b, bookingStatus: action, canceledBy: canceledBy }
        : b
    )
  );

  BookingsAPIService.updateBookingStatus(booking.booking_id, action, canceledBy)
    .then(() => {
      alert(`✅ Booking updated to ${action} (customer will be notified).`);
      fetchBookings();
    })
    .catch((error) => {
      console.error('Failed to update booking:', error);
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === booking.booking_id ? { ...b, bookingStatus: originalStatus } : b
        )
      );
      alert('❌ Failed to update booking status.');
    });
};


  /** Delete a booking */
  const handleDelete = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await BookingsAPIService.deleteBooking(bookingId);
      alert('✅ Booking deleted successfully.');
      fetchBookings();
    } catch (err) {
      console.error('Failed to delete booking:', err);
      alert('❌ Failed to delete booking.');
    }
  };

  /** Save discount changes */
  const handleSaveDiscount = async (bookingId: number) => {
    try {
      await BookingsAPIService.updateBookingDiscount(bookingId, discount);
      alert('✅ Discount updated successfully!');
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? { ...b, discount, grand_total: Math.max(b.booking_amount - discount, 0) }
            : b
        )
      );
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to update discount:', error);
      alert('❌ Failed to update discount.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-lg font-semibold">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Bookings: {filteredBookings.length}
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="grid gap-6">
        {filteredBookings.map((booking) => (
          <Card key={booking.booking_id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{booking.customer_name || 'Unknown Customer'}</h2>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  booking.bookingStatus === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : booking.bookingStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : booking.bookingStatus === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : booking.bookingStatus === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {booking.bookingStatus || 'N/A'}
              </span>
            </div>

            {/* Cancelled By Section */}
           {/* Cancelled By Section (only show if customer cancelled) */}
{booking.bookingStatus === 'cancelled' && booking.canceledBy === 'Customer' && (
  <p className="text-red-500 text-sm">
    ❌ Cancelled by Customer
  </p>
)}

            {/* Assigned Worker Section */}
            {booking.worker_assign?.length > 0 ? (
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-medium">👷 Assigned Workers: </span>
                {booking.worker_assign.join(', ')}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500 italic">No worker assigned yet.</div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mt-2">
              <div className="flex-1">
                {/* Customer Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {booking.customer_name?.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {booking.customer_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{booking.customer_email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button onClick={() => confirmOrder(booking, 'confirmed')}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button onClick={() => confirmOrder(booking, 'cancelled')}>
                    <XCircle className="w-4 h-4 mr-1" /> Decline
                  </Button>
                  <Button onClick={() => confirmOrder(booking, 'completed')}>✅ Completed</Button>
                </div>

                {/* Assign Worker */}
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    type="text"
                    placeholder="Enter worker name"
                    value={workerInputs[booking.booking_id] ?? ''}
                    onChange={(e) =>
                      setWorkerInputs((prev) => ({ ...prev, [booking.booking_id]: e.target.value }))
                    }
                    className="px-2 py-1 border rounded w-48"
                  />
                  <Button onClick={() => assignWorker(booking.booking_id)}>Assign Worker</Button>
                </div>

                {/* Service Details */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Service</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {booking.booking_service_name}
                        </div>
                        <div className="text-xs text-gray-500">City: {booking.city}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">Date & Time</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {booking.booking_date
                            ? new Date(booking.booking_date).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{booking.booking_time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {booking.duration || '60'} minutes
                        </div>
                        <div className="text-xs text-gray-500">Estimated time</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {booking.address || booking.city}
                        </div>
                        <div className="text-xs text-gray-500">Service address</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹
                          {booking.grand_total?.toLocaleString() ||
                            booking.booking_amount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setDiscount(booking.discount || 0);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Booking
                  </Button>

                  <Button variant="danger" onClick={() => handleDelete(booking.booking_id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredBookings.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No bookings found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter settings.</p>
        </Card>
      )}

      {/* Edit Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Booking</h2>

            {/* Read-only fields */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm text-gray-600">Customer Name</label>
                <input
                  type="text"
                  value={selectedBooking.customer_name}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Service</label>
                <input
                  type="text"
                  value={selectedBooking.booking_service_name}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Booking Amount</label>
                <input
                  type="number"
                  value={selectedBooking.booking_amount}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
            </div>

            {/* Discount */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600">Add Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Grand Total */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600">Grand Total</label>
              <input
                type="number"
                value={Math.max(selectedBooking.booking_amount - discount, 0)}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-100 mb-2"
              />
              <p className="text-lg font-semibold text-green-600">
                ₹{Math.max(selectedBooking.booking_amount - discount, 0).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => setSelectedBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => handleSaveDiscount(selectedBooking.booking_id)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
