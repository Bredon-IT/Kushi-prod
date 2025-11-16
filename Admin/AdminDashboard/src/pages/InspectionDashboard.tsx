import React, { useState, useEffect, useCallback } from "react";
import InspectionAPIService from "../services/InspectionAPIService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Edit,
  Search,
  Mail,
  User,
  IndianRupee,
  MapPin,
  X,
  Clock,
  CheckCircle,
  Users,
  IndianRupee as RupeeIcon,
  Calendar,
  Tag,
  Phone,
} from "lucide-react";

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

export interface InspectionUpdateRequest {
  inspection_status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  booking_amount: number;
  bookingStatus: string;
  site_visit: "pending" | "completed" | "not completed" | string;
  worker_assign: string;
  discount: number;
}

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
  worker_assign: string[];
  duration: string;
  inspection_status: string;
  site_visit: string;
}

const InspectionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  let colorClass = "bg-gray-100 text-gray-800";
  if (s === "confirmed") colorClass = "bg-green-100 text-green-700 ring-1 ring-green-500";
  else if (s === "cancelled") colorClass = "bg-red-100 text-red-700 ring-1 ring-red-500";
  else if (s === "completed") colorClass = "bg-navy-100 text-navy-700 ring-1 ring-navy-500";
  else if (s === "pending") colorClass = "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500";

  return (
   <span
      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${colorClass} uppercase whitespace-nowrap`}
    >
      {s === "confirmed" ? "Inspection Confirmed" : status}
    </span>
  );
};

const SiteVisitStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  let colorClass = "bg-gray-200 text-gray-700";
  if (s === "completed") colorClass = "bg-blue-100 text-blue-700";
  else if (s === "not completed") colorClass = "bg-red-100 text-red-700";

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-md ${colorClass} uppercase whitespace-nowrap`}
    >
      {status}
    </span>
  );
};

interface EditInspectionModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdateInspection: (bookingId: number, data: InspectionUpdateRequest) => Promise<void>;
  onMoveToBookings: (bookingId: number) => void;
}

const EditInspectionModal: React.FC<EditInspectionModalProps> = ({
  booking,
  onClose,
  onUpdateInspection,
  onMoveToBookings,
}) => {
  const [formData, setFormData] = useState<InspectionUpdateRequest>({
    inspection_status: (booking.inspection_status || "pending") as InspectionUpdateRequest["inspection_status"],
    booking_amount: booking.booking_amount,
    bookingStatus: booking.bookingStatus,
    site_visit: (booking.site_visit || "pending") as InspectionUpdateRequest["site_visit"],
    worker_assign: booking.worker_assign.join(", "),
    discount: booking.discount ?? 0,
  });

  const baseAmount = formData.booking_amount ?? 0;
  const discount = formData.discount ?? 0;
  const newTotalAmount = Math.max(0, baseAmount - discount);

  useEffect(() => {
    // Prevent discount exceeding base amount
    if (formData.discount > formData.booking_amount) {
      setFormData((prev) => ({ ...prev, discount: prev.booking_amount }));
    }
  }, [formData.booking_amount, formData.discount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "booking_amount" || name === "discount" ? parseFloat(value) || 0 : value,
    }));
  };

 const handleSave = async () => {
    const newBookingStatus = formData.inspection_status === "cancelled" ? "cancelled" : formData.inspection_status;

    const updateRequest: InspectionUpdateRequest = {
      inspection_status: formData.inspection_status,
      booking_amount: formData.booking_amount,
      bookingStatus: newBookingStatus,
      site_visit: formData.site_visit,
      worker_assign: formData.worker_assign,
      discount: formData.discount,
    };

    await onUpdateInspection(booking.booking_id, updateRequest);
    onClose();
  };

 const fullAddress = [booking.address_line_1, booking.address_line_2, booking.address_line_3, booking.city, booking.pincode].filter(Boolean).join(", ");
  const formattedDate = formatDateForDisplay(booking.booking_date);

  const canMoveToBookings =
    (formData.inspection_status || "").toLowerCase() === "completed" && (formData.booking_amount ?? 0) > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <Card className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xl space-y-4 transform transition-all duration-300 scale-100 my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-navy-700">Update Inspection #{booking.booking_id}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 border-b pb-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-navy-700" />
            <span className="font-semibold">{booking.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-navy-700" />
            <span>{booking.booking_service_name}</span>
          </div>
          <div className="flex items-center space-x-2 col-span-2">
            <MapPin className="w-4 h-4 text-navy-700 flex-shrink-0" />
            <span className="truncate">{fullAddress}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-4 border-b md:border-b-0 md:border-r md:pr-6 pb-4 md:pb-0">
            <h3 className="text-md font-semibold text-gray-800">Status & Assignment</h3>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Inspection Status</label>
              <select
                name="inspection_status"
                value={formData.inspection_status}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Site Visit Status</label>
              <select
                name="site_visit"
                value={formData.site_visit}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="not completed">Not Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Assigned Workers (Comma Separated)</label>
              <input
                type="text"
                name="worker_assign"
                placeholder="E.g., Anil, Vikas, Rajesh"
                value={formData.worker_assign}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800">Pricing Finalization</h3>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Final Booking Amount (₹)</label>
              <input
                type="number"
                name="booking_amount"
                min="0"
                value={formData.booking_amount}
                onChange={handleChange}
                className="w-full border border-navy-400 px-3 py-2 rounded-lg text-right font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Discount (₹)</label>
              <input
                type="number"
                name="discount"
                min="0"
                max={baseAmount}
                value={formData.discount}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-right text-base"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t font-bold text-navy-700">
              <span className="text-lg">Grand Total:</span>
              <span className="text-2xl flex items-center">
                <RupeeIcon className="w-5 h-5 mr-1" />
                {newTotalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full mt-4">
          <Button onClick={handleSave} className="flex-1 w-full bg-navy-600 hover:bg-navy-700 text-lg py-3">
            <CheckCircle className="w-5 h-5 mr-2" /> Save All Inspection Updates
          </Button>

          {canMoveToBookings && (
            <Button
              onClick={() => onMoveToBookings(booking.booking_id)}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg"
            >
              Move to Bookings
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

/** -------------------------
 * Main Page
 * ------------------------- */
export function InspectionDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchInspections = useCallback(() => {
    setLoading(true);
    InspectionAPIService.getAllInspections(null)
      .then((res: any) => {
        const validData = (res.data || []).filter((b: any) => b && b.booking_id);
        const normalized: Booking[] = validData
          .filter((b: any) => (b.booking_amount ?? 0) === 0) // KEEP: only bookings with zero booking_amount for inspection dashboard
          .map((b: any) => ({
            booking_id: b.booking_id,
            customer_name: b.customer_name,
            customer_email: b.customer_email,
            customer_number: b.customer_number,
            booking_service_name: b.booking_service_name,
            booking_amount: b.booking_amount ?? 0,
            totalAmount: b.grand_total ?? ((b.booking_amount ?? 0) - (b.discount ?? 0)),
            discount: b.discount ?? 0,
            booking_date: b.booking_date || "N/A",
            booking_time: b.booking_time,
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
                ? b.worker_assign.split(",").map((w: string) => w.trim())
                : b.worker_assign || [],
            inspection_status: (b.inspection_status || b.inspectionStatus || "pending").toLowerCase(),
            site_visit: (b.site_visit || "pending").toLowerCase(),
          }));
        setBookings(normalized.sort((a, b) => b.booking_id - a.booking_id));
      })
      .catch((err: any) => {
        console.error("Failed to fetch inspections:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleUpdateInspection = async (bookingId: number, booking_data: InspectionUpdateRequest) => {
    try {
      const res = await InspectionAPIService.updateInspection(bookingId, booking_data);
      const updatedBooking = res?.data ?? booking_data;

      setBookings((prev) =>
        prev
          .map((b) =>
            b.booking_id === bookingId
              ? {
                  ...b,
                  booking_amount: updatedBooking.booking_amount ?? b.booking_amount,
                  discount: updatedBooking.discount ?? b.discount,
                  totalAmount:
                    updatedBooking.grand_total ??
                    ((updatedBooking.booking_amount ?? b.booking_amount) - (updatedBooking.discount ?? b.discount)),
                  bookingStatus: (updatedBooking.bookingStatus || b.bookingStatus).toLowerCase(),
                  inspection_status: (updatedBooking.inspection_status || updatedBooking.inspectionStatus || b.inspection_status).toLowerCase(),
                  site_visit: (updatedBooking.site_visit || b.site_visit).toLowerCase(),
                  worker_assign:
                    typeof updatedBooking.worker_assign === "string"
                      ? updatedBooking.worker_assign.split(",").map((w: string) => w.trim())
                      : updatedBooking.worker_assign || b.worker_assign,
                  address_line_1: updatedBooking.address_line_1 ?? b.address_line_1,
                  address_line_2: updatedBooking.address_line_2 ?? b.address_line_2,
                  address_line_3: updatedBooking.address_line_3 ?? b.address_line_3,
                  city: updatedBooking.city ?? b.city,
                  pincode: updatedBooking.zip_code ?? b.pincode,
                }
              : b
          )
          .filter((b) => (b.booking_amount ?? 0) === 0) // KEEP: keep only zero-amount bookings after update
      );
    } catch (err) {
      console.error("Failed to update inspection:", err);
      // optionally: show toast / UI error
    }
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleMoveToBookings = (bookingId: number) => {
    // Remove from current inspection list (client-side only).
    // If you have an API to move booking to "bookings", call it here.
    setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
    setIsEditModalOpen(false);
    setSelectedBooking(null);
    // Feedback for user
    alert("Booking moved to Bookings page successfully!");
  };

  const filteredByStatus = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.bookingStatus === filter;
  });

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
    return <div className="text-center p-8 text-gray-700 font-semibold text-lg">Loading Inspection Dashboard...</div>;

  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">

      {/* Make content wider than mobile to force scrolling */}
      <div className="min-w-[950px]">

    <div className="px-4 py-6 space-y-6 min-h-screen bg-gray-50 text-gray-900 md:px-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-3xl font-bold drop-shadow-sm text-navy-700"> Inspection Management Dashboard</h1>
        <p className="text-gray-500 mt-1">Bookings awaiting site visit confirmation or final price setting.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center w-full sm:w-1/2 relative">
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Customer Name, Email, Phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-inner"
                />
          </div>
          <select value={filter} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-navy-400 bg-white w-full sm:w-auto font-semibold text-navy-600 shadow-sm">
            <option value="pending">Filter by: Pending Booking</option>
            <option value="confirmed">Filter by: Confirmed Booking</option>
            <option value="completed">Filter by: Completed Booking</option>
            <option value="cancelled">Filter by: Cancelled Booking</option>
            <option value="all">Show All Bookings</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center p-10 text-gray-500 border-2 border-dashed rounded-xl bg-white shadow-inner">
            <X className="w-10 h-10 mx-auto mb-2" />
            <p>No inspection bookings found matching your current filter and search criteria.</p>
          </div>
        ) : (
          filtered.map((b, index) => (
            <Card key={b.booking_id || index} className="p-4 rounded-xl shadow-lg border-l-4 border-navy-700 bg-white relative hover:shadow-2xl transition duration-300 md:flex md:justify-between md:items-center">
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                <div className="flex flex-col items-start min-w-[120px]">
                  <InspectionStatusBadge status={b.inspection_status} />
                  <div className="font-bold text-lg text-navy-700 mt-1">{b.customer_name}</div>
                  <div className="text-xs text-gray-500">Booking #{b.booking_id}</div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="font-semibold">{b.booking_service_name}</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3 h-3 text-navy-500" /> {formatDateForDisplay(b.booking_date)} at {b.booking_time}
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="font-medium text-xs">Site Visit:</span> <SiteVisitStatusBadge status={b.site_visit} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span className="font-medium text-xs">Workers:</span> <span className="text-xs">{b.worker_assign.length > 0 ? b.worker_assign.length : "0"} Assigned</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 hidden sm:block">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs truncate" title={[b.address_line_1, b.city, b.pincode].filter(Boolean).join(", ")}>
                      {[b.city, b.pincode].filter(Boolean).join(" - ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <Phone className="w-3 h-3 text-gray-500" /> {b.customer_number}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 mt-3 sm:mt-0 sm:ml-4">
                <Button
                  className="w-full sm:w-auto bg-navy-600 hover:bg-navy-700 text-sm py-2 px-4 whitespace-nowrap"
                  onClick={() => handleEditClick(b)}
                >
                  <Edit className="w-4 h-4 mr-2" /> Inspect & Update
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {isEditModalOpen && selectedBooking && (
        <EditInspectionModal
          booking={selectedBooking}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateInspection={handleUpdateInspection}
          onMoveToBookings={handleMoveToBookings}
        />
      )}
     </div>
      </div>
    </div>
  );
}

export default InspectionDashboard;