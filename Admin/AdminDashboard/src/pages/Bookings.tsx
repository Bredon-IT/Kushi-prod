// --- FULL UPDATED FILE WITH PAYMENT STATUS EDIT SUPPORT ---

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
  IndianRupee as RupeeIcon,
  MapPin,
  X,
  UserCheck,
  Calendar,
  Clock,
  Tag,
  Phone,
} from "lucide-react";

/* ------------------------- Utilities / Types ------------------------- */

const formatDateForDisplay = (rawDateString: string | undefined): string => {
  if (!rawDateString || rawDateString === "N/A") return "N/A";
  try {
    const date = new Date(rawDateString);
    if (isNaN(date.getTime())) return "N/A (Invalid Date)";

    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  } catch {
    return "N/A (Error)";
  }
};

interface Booking {
  booking_id: number;
  customer_name: string;
  customer_email: string;
  customer_number: string;
  booking_service_name: string;
  booking_amount: number;
  totalAmount: number;
  discount: number;
  booking_date: string;
  booking_time: string;
  bookingStatus: string;
  canceledBy?: "customer" | "admin" | string;
  cancellation_reason?: string;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  city: string;
  pincode: string;
  duration: string;
  worker_assign: string[];
  inspection_status?: string;
  site_visit?: string;

  // ⭐ NEW FIELDS ADDED
  paymentMethod?: string;
  paymentStatus?: string;
}

/* ------------------------- Status Badges ------------------------- */

const StatusBadge: React.FC<{ status: string; canceledBy?: string }> = ({
  status,
  canceledBy,
}) => {
  const s = (status || "pending").toLowerCase();
  let colorClass = "bg-gray-100 text-gray-800";
  if (s === "completed") colorClass = "bg-blue-100 text-blue-700";
  else if (s === "confirmed") colorClass = "bg-green-100 text-green-700";
  else if (s === "cancelled") colorClass = "bg-red-100 text-red-700";
  else if (s === "pending") colorClass = "bg-yellow-100 text-yellow-700";

  const displayText =
    s === "cancelled" && canceledBy
      ? `Cancelled by ${canceledBy.charAt(0).toUpperCase() + canceledBy.slice(1)}`
      : status;

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${colorClass} uppercase`}
    >
      {displayText}
    </span>
  );
};

const SiteVisitBadge: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  if (s === "completed")
    return (
      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-md">
        Completed
      </span>
    );
  if (s === "not completed")
    return (
      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-md">
        Not Completed
      </span>
    );
  return (
    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-md">
      Pending
    </span>
  );
};

/* ------------------------- Edit Modal ------------------------- */

interface EditModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (
    booking: Booking,
    status: string,
    canceledBy?: "customer" | "admin",
    reason?: string
  ) => Promise<void>;

  onAssignWorker: (bookingId: number, workerName: string) => Promise<void>;
  onSaveDiscount: (bookingId: number, discountAmount: number) => Promise<void>;

  // ⭐ NEW PROP FOR PAYMENT STATUS
  onUpdatePaymentStatus: (bookingId: number, status: string) => Promise<void>;
}

const EditBookingModal: React.FC<EditModalProps> = ({
  booking,
  onClose,
  onUpdateStatus,
  onAssignWorker,
  onSaveDiscount,

  // New
  onUpdatePaymentStatus,
}) => {
  const [discount, setDiscount] = useState<number>(booking.discount ?? 0);
  const [workerNames, setWorkerNames] = useState<string>(
    booking.worker_assign?.join(", ") || ""
  );
  const [cancelReason, setCancelReason] = useState<string>(
    booking.cancellation_reason || ""
  );
  const [statusSelection, setStatusSelection] = useState<string>(
    booking.bookingStatus || "pending"
  );
  const [saving, setSaving] = useState(false);

  // ⭐ Payment Status local state
  const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState<
    "Paid" | "Pending"
  >((booking.paymentStatus as "Paid" | "Pending") || "Pending");

  const basePrice = booking.booking_amount ?? 0;
  const newTotalAmount = Math.max(0, basePrice - (discount ?? 0));

  const fullAddress = [
    booking.address_line_1,
    booking.address_line_2,
    booking.address_line_3,
    booking.city,
    booking.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const handleSaveDiscountClick = async () => {
    const finalDiscount = Math.min(Math.max(discount || 0, 0), basePrice);
    setSaving(true);
    try {
      await onSaveDiscount(booking.booking_id, finalDiscount);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignWorkerClick = async () => {
    const trimmed = workerNames
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);
    if (trimmed.length === 0) return;
    setSaving(true);
    try {
      for (const w of trimmed) {
        await onAssignWorker(booking.booking_id, w);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentStatus = async () => {
    setSaving(true);
    try {
      await onUpdatePaymentStatus(booking.booking_id, updatedPaymentStatus);
      alert("Payment status updated successfully.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusSave = async () => {
    const s = statusSelection.toLowerCase();
    if (s === "cancelled" && !cancelReason.trim()) {
      alert("Please provide a cancellation reason before cancelling.");
      return;
    }

    setSaving(true);
    try {
      await onUpdateStatus(
        booking,
        statusSelection,
        s === "cancelled" ? "admin" : undefined,
        cancelReason.trim() || undefined
      );
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <Card className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-700">
              Update Booking #{booking.booking_id}
            </h2>
            <div className="text-sm text-gray-500">
              {booking.customer_name} · {booking.customer_number}
            </div>
          </div>

          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4 border-b md:border-b-0 md:border-r pr-6">
            <h3 className="text-md font-semibold">Status & Assignment</h3>

            {/* Booking Status */}
            <div>
              <label className="block text-sm mb-1">Booking Status</label>
              <select
                value={statusSelection}
                onChange={(e) => setStatusSelection(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Cancellation */}
            <div>
              <label className="block text-sm mb-1">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm resize-none"
              />
            </div>

            {/* Worker Assignment */}
            <div>
              <label className="block text-sm mb-1">
                Assign Workers (comma separated)
              </label>
              <input
                value={workerNames}
                onChange={(e) => setWorkerNames(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={handleAssignWorkerClick}
              >
                Assign Workers
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Pricing & Payment</h3>

            {/* Base Amount */}
            <div>
              <label className="block text-sm mb-1">Base Amount</label>
              <div className="text-lg font-semibold text-navy-700">
                ₹{booking.booking_amount}
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm mb-1">Discount (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <Button size="sm" onClick={handleSaveDiscountClick}>
                  Save
                </Button>
              </div>
            </div>

            {/* ⭐ PAYMENT METHOD (NON-EDITABLE) */}
            <div>
              <label className="block text-sm mb-1">Payment Method</label>
              <div className="px-3 py-2 border rounded-lg bg-gray-100 text-sm">
                {booking.paymentMethod || "N/A"}
              </div>
            </div>

            {/* ⭐ PAYMENT STATUS (EDITABLE) */}
            <div>
              <label className="block text-sm mb-1">Payment Status</label>
              <select
                value={updatedPaymentStatus}
                onChange={(e) =>
                  setUpdatedPaymentStatus(
                    e.target.value as "Paid" | "Pending"
                  )
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>

              <Button
                size="sm"
                className="mt-2"
                onClick={handleSavePaymentStatus}
              >
                Save Payment Status
              </Button>
            </div>

            {/* Address */}
            <div className="text-sm text-gray-600">
              <MapPin className="inline w-4 h-4 mr-1" />
              {fullAddress}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleStatusSave}>Save Status</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ------------------------- Main Bookings Page ------------------------- */

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(() => {
    setLoading(true);

    BookingsAPIService.getAllBookings()
      .then((res: any) => {
        const valid = (res.data || []).filter(
          (b: any) => b && b.booking_id
        );

        const normalized: Booking[] = valid.map((b: any) => ({
          booking_id: b.booking_id,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_number: b.customer_number,
          booking_service_name: b.booking_service_name,
          booking_amount: b.booking_amount ?? 0,
          totalAmount: b.grand_total ?? b.booking_amount ?? 0,
          discount: b.discount ?? 0,
          booking_date: b.booking_date || "N/A",
          booking_time: b.booking_time || "",
          bookingStatus: (b.bookingStatus || "pending").toLowerCase(),
          canceledBy: b.canceledBy?.toLowerCase(),
          cancellation_reason: b.cancellation_reason || "",
          address_line_1: b.address_line_1 || b.address || "",
          address_line_2: b.address_line_2 || "",
          address_line_3: b.address_line_3 || "",
          city: b.city || "",
          pincode: b.zip_code ?? b.pincode ?? "",
          duration: b.duration || "60",
          worker_assign:
            typeof b.worker_assign === "string"
              ? b.worker_assign
                  .split(",")
                  .map((w: string) => w.trim())
              : b.worker_assign || [],
          inspection_status: (
            b.inspection_status ||
            b.inspectionStatus ||
            "pending"
          ).toLowerCase(),
          site_visit: (b.site_visit || "pending").toLowerCase(),

          // ⭐ PAYMENT FIELDS ADDED
          paymentMethod: b.paymentMethod || "N/A",
          paymentStatus: b.paymentStatus || "Pending",
        }));

        setBookings(normalized.sort((a, b) => b.booking_id - a.booking_id));
      })
      .catch((err) =>
        console.error("Failed to fetch bookings:", err)
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ---------------------- UPDATE PAYMENT STATUS ---------------------- */

  const updatePaymentStatus = async (
    bookingId: number,
    status: string
  ) => {
    try {
      await axios.put(
        `${Global_API_BASE}/api/bookings/${bookingId}/payment-status`,
        {
          paymentStatus: status,
        }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? { ...b, paymentStatus: status }
            : b
        )
      );

      if (selectedBooking?.booking_id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          paymentStatus: status,
        });
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  /* ------------------------- Worker Assignment ------------------------ */

  const handleAssignWorker = async (
    bookingId: number,
    workerName: string
  ) => {
    try {
      await axios.put(
        Global_API_BASE + `/api/admin/${bookingId}/assign-worker`,
        {
          workername: workerName,
        }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? {
                ...b,
                worker_assign: [...(b.worker_assign || []), workerName],
              }
            : b
        )
      );

      if (selectedBooking?.booking_id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          worker_assign: [
            ...(selectedBooking.worker_assign || []),
            workerName,
          ],
        });
      }
    } catch (err) {
      console.error("Failed assign worker:", err);
    }
  };

  /* ------------------------- Discount Save ------------------------- */

  const handleSaveDiscount = async (
    bookingId: number,
    discountAmount: number
  ) => {
    try {
      const res = await axios.put(
        Global_API_BASE + `/api/bookings/${bookingId}/discount`,
        {
          discount: discountAmount,
        }
      );

      const updated = res.data;

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? {
                ...b,
                discount: updated.discount,
                totalAmount: updated.grand_total,
              }
            : b
        )
      );

      if (selectedBooking?.booking_id === bookingId)
        setSelectedBooking({
          ...selectedBooking,
          discount: updated.discount,
          totalAmount: updated.grand_total,
        });
    } catch (err) {
      console.error("Failed save discount:", err);
    }
  };

  /* ------------------------- Status Update ------------------------- */

  const handleUpdateStatus = async (
    booking: Booking,
    status: string,
    canceledBy?: "customer" | "admin",
    cancellation_reason?: string
  ) => {
    try {
      await axios.put(
        Global_API_BASE + `/api/bookings/${booking.booking_id}/status`,
        {
          status,
          canceledBy,
          cancellationReason: cancellation_reason,
        }
      );

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
      console.error("Failed update status:", err);
    }
  };

  /* ------------------------- Render Bookings List ------------------------- */

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const filteredByStatus = bookings.filter((b) =>
    filter === "all" ? true : b.bookingStatus === filter
  );

  const filtered = filteredByStatus.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.customer_name || "").toLowerCase().includes(term) ||
      (b.customer_email || "").toLowerCase().includes(term) ||
      (b.customer_number || "").toLowerCase().includes(term) ||
      b.booking_id.toString().includes(term)
    );
  });

  if (loading)
    return (
      <div className="text-center p-8 text-gray-700 font-semibold text-lg">
        Loading Booking Dashboard...
      </div>
    );

  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">

      {/* Force width bigger than mobile so scrollbar appears */}
      <div className="min-w-[950px]">

        {/* Original Desktop Content (unchanged) */}
        <div className="px-4 py-6 space-y-6 min-h-screen bg-gray-50">

          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy-700">
              Booking Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          All bookings with quick actions (status, workers, discount,
          payment)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md border sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center w-full sm:w-1/2 relative">
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search name, email, phone, or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Show All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center p-10 text-gray-500 border-2 border-dashed rounded-xl bg-white shadow-inner">
            <X className="w-10 h-10 mx-auto mb-2" />
            <p>No bookings found.</p>
          </div>
        ) : (
          filtered.map((b) => (
            <Card
              key={b.booking_id}
              className="p-4 rounded-xl shadow-lg border-l-4 border-navy-700 bg-white md:flex md:justify-between md:items-center hover:shadow-2xl transition"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 flex-grow">
                <div>
                  <StatusBadge
                    status={b.bookingStatus}
                    canceledBy={b.canceledBy}
                  />
                  <div className="font-bold text-lg">{b.customer_name}</div>
                  <div className="text-xs text-gray-500">
                    #{b.booking_id}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="font-semibold">
                    {b.booking_service_name}
                  </div>
                  <div className="text-xs">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {formatDateForDisplay(b.booking_date)} at{" "}
                    <Clock className="inline w-3 h-3 mr-1 ml-1" />
                    {b.booking_time}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <UserCheck className="inline w-3 h-3 mr-1 text-green-600" />
                  {b.worker_assign.length
                    ? b.worker_assign.join(", ")
                    : "No workers"}
                  <div className="mt-1 text-xs text-gray-500">
                    <RupeeIcon className="inline w-4 h-4 mr-1" />
                    ₹{b.totalAmount.toFixed(2)}
                  </div>
                </div>

                <div className="text-sm text-gray-600 hidden sm:block">
                  <MapPin className="inline w-3 h-3 text-blue-600 mr-1" />
                  {b.city} - {b.pincode}
                  <div className="text-xs mt-1">
                    <Mail className="inline w-3 h-3 mr-1 text-gray-500" />
                    {b.customer_email}
                  </div>
                </div>
              </div>

              <Button
                className="mt-3 sm:mt-0 sm:ml-4 bg-navy-600 hover:bg-navy-700 text-sm py-2 px-4"
                onClick={() => handleEditClick(b)}
              >
                <Edit className="w-4 h-4 mr-2" /> Update
              </Button>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
          onAssignWorker={handleAssignWorker}
          onSaveDiscount={handleSaveDiscount}
          onUpdatePaymentStatus={updatePaymentStatus} // ⭐ Added
        />
      )}
     </div>
      </div>
    </div>
  );
}
