import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BookingsAPIService from "../services/BookingAPIService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import Global_API_BASE from "../services/GlobalConstants";
import {
  Edit,
  Search,
  Mail,
  User,
  IndianRupee,
  MapPin,
  X,
  UserCheck,
  Calendar,
  Clock, // Added Clock icon for time
} from "lucide-react";

// --- CUSTOM HOOK: useDebounce ---
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = React.useRef<number | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
};

// --- 1. Type Definition ---
interface Booking {
  booking_id: number;
  customer_name: string;
  customer_email: string;
  customer_number: string;
  booking_service_name: string;
  booking_amount: number;
  totalAmount: number;
  booking_date: string;
  booking_time: string;
  bookingStatus: string;
  canceledBy?: "customer" | "admin";
  cancellation_reason?: string;
  address: string;
  city: string;
  pincode: string;
  duration: string;
  worker_assign: string[];
  discount: number;
}

// --- 2. Status Badge ---
const StatusBadge: React.FC<{ status: string; canceledBy?: string }> = ({
  status,
  canceledBy,
}) => {
  const s = status?.toLowerCase() || "pending";
  let colorClass = "bg-gray-100 text-gray-800";
  if (s === "completed") colorClass = "bg-blue-100 text-blue-700";
  else if (s === "confirmed") colorClass = "bg-green-100 text-green-700";
  else if (s === "cancelled") colorClass = "bg-red-100 text-red-700";
  else if (s === "pending") colorClass = "bg-yellow-100 text-yellow-700";
// Display 'Cancelled by Customer' or 'Cancelled by Admin'
  const displayText =
    s === "cancelled" && canceledBy ? `Cancelled by ${canceledBy.charAt(0).toUpperCase() + canceledBy.slice(1)}` : status;

  return (
    <span
      className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full shadow-md ${colorClass} uppercase`}
    >
      {displayText}
    </span>
  );
};

// --- 3. Edit Modal ---
interface EditModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (
    booking: Booking,
    status: string,
    canceledBy?: "customer" | "admin",
    reason?: string
  ) => void;
  onAssignWorker: (bookingId: number, workerName: string) => Promise<void>;
  onSaveDiscount: (bookingId: number, discountAmount: number) => Promise<void>;
}

const EditBookingModal: React.FC<EditModalProps> = ({
  booking,
  onClose,
  onUpdateStatus,
  onAssignWorker,
  onSaveDiscount,
}) => {
  const [discount, setDiscount] = useState<number>(booking.discount ?? 0);
  const [workerName, setWorkerName] = useState("");
  const [cancelReason, setCancelReason] = useState<string>(
    booking.cancellation_reason || ""
  );
  const basePrice = booking.booking_amount ?? 0;
  const newTotalAmount = Math.max(0, basePrice - discount);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDiscount(isNaN(value) || value < 0 ? 0 : value);
  };

  const handleSaveDiscountClick = async () => {
    const finalDiscount = Math.min(discount, basePrice);
    await onSaveDiscount(booking.booking_id, finalDiscount);
  };

  const handleAssignWorkerClick = async () => {
    if (!workerName.trim()) return;
    await onAssignWorker(booking.booking_id, workerName.trim());
    setWorkerName("");
  };

 // UPDATED: Adjusted logic to pass 'admin' for canceledBy
  const handleStatusUpdate = async (status: string) => {
    let reason: string | undefined = undefined;
    let canceledBy: "customer" | "admin" | undefined = undefined;
    if (status.toLowerCase() === "cancelled") {
      reason = cancelReason.trim();
      if (!reason) {
        alert("Please enter a cancellation reason!");
        return;
      }
      canceledBy = "admin"; // Admin cancelling
    }
    await onUpdateStatus(booking, status, canceledBy, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">
            Update Booking #{booking.booking_id}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">Service:</span>
          <span className="font-semibold">{booking.booking_service_name}</span>
          <span className="text-gray-500">Customer:</span>
          <span className="font-semibold">{booking.customer_name}</span>
          <span className="text-gray-500">Contact:</span>
          <span className="font-semibold">
            {booking.customer_number} / {booking.customer_email}
          </span>
        </div>

        {/* Status Update */}
        <div className="border-t pt-4 space-y-2">
          <h3 className="font-semibold text-lg text-gray-700">Update Status</h3>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-red-400 focus:border-red-400"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleStatusUpdate("confirmed")}
              >
                Confirmed
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleStatusUpdate("completed")}
              >
                Completed
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleStatusUpdate("cancelled")}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </div>

        {/* Discount Feature */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold text-lg text-gray-700">Apply Discount</h3>
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Original Price:</span>
              <span className="font-medium flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {basePrice.toFixed(2)}
              </span>
            </p>
            <div className="flex justify-between items-center">
              <label className="text-red-600 font-semibold">Discount (₹):</label>
              <input
                type="number"
                value={discount > 0 ? discount : ""}
                onChange={handleDiscountChange}
                min="0"
                max={basePrice}
                placeholder="Enter discount"
                className="w-1/2 border border-gray-300 rounded-lg p-2 text-right focus:ring-red-400 focus:border-red-400"
              />
            </div>
            <p className="flex justify-between pt-2 border-t text-base font-bold">
              <span className="text-blue-700">Final Total:</span>
              <span className="flex items-center text-blue-700">
                <IndianRupee className="w-5 h-5 mr-1" />
                {newTotalAmount.toFixed(2)}
              </span>
            </p>
            <Button
              onClick={handleSaveDiscountClick}
              size="sm"
              className="w-full"
            >
              Save Discount
            </Button>
          </div>
        </div>

        {/* Worker Assignment */}
        <div className="border-t pt-4 space-y-2">
          <h3 className="font-semibold text-lg text-gray-700">Assign Worker</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Worker name"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="flex-grow border border-gray-300 px-3 py-2 rounded-lg"
            />
            <Button
              onClick={handleAssignWorkerClick}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Assign
            </Button>
          </div>
          {booking.worker_assign?.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              Assigned: {booking.worker_assign.join(", ")}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// --- 4. Main Component ---
export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    BookingsAPIService.getAllBookings()
      .then((res) => {
        const normalized: Booking[] = res.data.map((b: any) => ({
          booking_id: b.booking_id,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_number: b.customer_number,
          booking_service_name: b.booking_service_name,
          booking_amount: b.booking_amount ?? 0,
          totalAmount: b.grand_total ?? b.booking_amount ?? 0,
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          bookingStatus: b.bookingStatus?.toLowerCase() || "pending",
         canceledBy: b.canceledBy?.toLowerCase() === "admin" ? "admin" : b.canceledBy?.toLowerCase() === "customer" ? "customer" : undefined,
          cancellation_reason: b.cancellation_reason || "",
          address: b.address,
          city: b.city,
          pincode: b.zip_code || b.pincode || "",
          duration: b.duration || "60",
          worker_assign:
            typeof b.worker_assign === "string"
              ? b.worker_assign.split(",").map((w: string) => w.trim())
              : b.worker_assign || [],
          discount: b.discount ?? 0,
        }));
        setBookings(normalized.sort((a, b) => b.booking_id - a.booking_id));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAssignWorker = async (bookingId: number, workerName: string) => {
    try {
      await axios.put(
        Global_API_BASE + `/api/admin/${bookingId}/assign-worker`,
        { workername: workerName }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? { ...b, worker_assign: [...(b.worker_assign || []), workerName] }
            : b
        )
      );

      if (selectedBooking?.booking_id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          worker_assign: [...(selectedBooking.worker_assign || []), workerName],
        });
      }
    } catch (error) {
      console.error("Failed to assign worker:", error);
    }
  };

  const handleDiscountSave = async (bookingId: number, discountAmount: number) => {
    try {
      const res = await axios.put(
        Global_API_BASE + `/api/bookings/${bookingId}/discount`,
        { discount: discountAmount }
      );

      const updatedBooking = res.data;
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? {
                ...b,
                discount: updatedBooking.discount,
                totalAmount: updatedBooking.grand_total,
              }
            : b
        )
      );

      if (selectedBooking?.booking_id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          discount: updatedBooking.discount,
          totalAmount: updatedBooking.grand_total,
        });
      }
    } catch (err) {
      console.error("Failed to update discount:", err);
    }
  };

  const handleUpdateStatus = async (
    booking: Booking,
    status: string,
   canceledBy?: "customer" | "admin",
    cancellation_reason?: string
  ) => {
    try {
      await axios.put(Global_API_BASE + `/api/bookings/${booking.booking_id}/status`, {
        status,
        canceledBy,
        cancellationReason: cancellation_reason,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === booking.booking_id
            ? { ...b, bookingStatus: status, canceledBy, cancellation_reason }
            : b
        )
      );

      if (selectedBooking?.booking_id === booking.booking_id) {
        setSelectedBooking({
          ...selectedBooking,
          bookingStatus: status,
          canceledBy,
          cancellation_reason,
        });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  // --- FILTER & SEARCH ---
  const filtered = bookings
    .filter((b) => (filter === "all" ? true : b.bookingStatus === filter))
    .filter((b) => {
      const term = searchTerm.toLowerCase();
      return (
        (b.customer_name?.toLowerCase() || "").includes(term) ||
        (b.customer_email?.toLowerCase() || "").includes(term) ||
        (b.customer_number?.toLowerCase() || "").includes(term)
      );
    });

  if (loading)
    return <div className="text-center p-6 text-gray-700">Loading...</div>;

  return (
    // CHANGE 1: Reduced horizontal padding from p-6 to px-4 py-6.
    <div className="px-4 py-6 space-y-6 min-h-screen bg-gray-50 text-gray-900 md:px-6"> 
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">
          Booking Dashboard
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="flex items-center w-full sm:w-1/2 relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 rounded-lg border border-gray-300 bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white w-full sm:w-auto"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-3"> {/* Reduced gap */}
        {filtered.map((b) => (
          <Card
            key={b.booking_id}
            // CHANGE 2 & 3: Reduced padding and removed excessive min-height on mobile (p-4 instead of p-5, min-h-auto).
            // Added md:p-5 for larger screens to maintain good spacing there.
            className="p-4 rounded-xl shadow-lg border border-gray-200 bg-white relative hover:shadow-xl md:min-h-[auto] min-h-[auto] md:p-5"
          >
            {/* The StatusBadge now uses smaller padding via updated StatusBadge component */}
            <StatusBadge status={b.bookingStatus} canceledBy={b.canceledBy} />
            {/* CHANGE 4: Modified grid layout for mobile to stack items efficiently */}
            <div className="grid grid-cols-1 gap-y-3 gap-x-6 items-center md:grid-cols-12 md:gap-y-2">
              
              {/* Customer Info - Takes full width on mobile, 3 cols on md+ */}
              <div className="md:col-span-3 space-y-0.5">
                <div className="text-xs text-gray-500 font-medium">Customer</div>
                <div className="font-bold text-base sm:text-lg">{b.customer_name}</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {b.customer_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {b.customer_email}
                  </span>
                 {/* INSERTED: Cancellation Reason Block */}
                  {b.bookingStatus === "cancelled" && b.cancellation_reason && (
                    <div className="mt-2 p-3 border rounded bg-gray-50 text-xs">
                      <span className="font-semibold text-red-700 block mb-0.5">
                        {b.canceledBy === "customer"
                          ? "Cancellation Reason (Customer): "
                          : "Cancellation Reason (Admin): "}
                      </span>
                      <span className="text-gray-700 block">{b.cancellation_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Info - Takes full width on mobile, 4 cols on md+ */}
              <div className="md:col-span-4 md:border-l-2 md:pl-4 space-y-0.5 sm:space-y-1 pt-2 border-t md:border-t-0 md:pt-0"> {/* Added border-t for visual separation on mobile */}
                <div className="font-semibold text-purple-700 text-sm sm:text-base">
                  {b.booking_service_name}
                </div>
                <div className="text-xs text-gray-700 flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    {b.address}, {b.city} {b.pincode}
                  </span>
                </div>
                
                {/* NEW: Date and Time Display */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span className="font-medium">{b.booking_date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="font-medium">{b.booking_time}</span>
                  </span>
                </div>
                {/* END NEW */}

                {b.worker_assign?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-700 mt-1 font-medium">
                    <UserCheck className="w-3 h-3" />
                    Worker: {b.worker_assign.join(", ")}
                  </div>
                )}
              </div>

              {/* Pricing & Action - Placed side-by-side or stacked on mobile for compactness, 3 and 2 cols on md+ */}
              <div className="grid grid-cols-2 gap-3 md:contents pt-2 border-t md:border-t-0 md:pt-0"> {/* New container for mobile layout */}
                
                {/* Pricing */}
                <div className="md:col-span-3 md:border-l-2 md:pl-4 space-y-0.5 order-2 md:order-none">
                  <div className="text-xs text-gray-500 font-medium">Final Total</div>
                  <div className="flex items-center font-bold text-base sm:text-xl text-green-700">
                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                    {(b.totalAmount ?? 0).toFixed(2)}
                  </div>
                  {b.discount > 0 && (
                    <div className="text-xs text-red-500 font-medium">
                      - ₹{b.discount.toFixed(2)} discount
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="md:col-span-2 flex justify-start items-center order-1 md:order-none">
                  <Button
                    size="sm"
                    className="bg from-peach-300 to-navy-700 hover:bg-peach-300 text-white text-xs sm:text-sm"
                    onClick={() => handleEditClick(b)}
                  >
                    <Edit className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" /> Update
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-gray-500 border rounded-xl bg-white shadow-md">
            No bookings found matching your criteria.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
          onAssignWorker={handleAssignWorker}
          onSaveDiscount={handleDiscountSave}
        />
      )}
    </div>
  );
}