import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import InspectionAPIService from "../services/InspectionAPIService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import AdminCreateBookingModal from "../components/bookings/AdminCreateBookingModal";

import {
  Edit,
  Search,
  Mail,
  User,
  MapPin,
  X,
  CheckCircle,
  Users,
  IndianRupee as RupeeIcon,
  Calendar as CalendarIcon,
  Tag,
  Phone,
} from "lucide-react";

// Helper: safe parse booking_date to Date (returns null if invalid)
const parseBookingDate = (raw?: string | null) => {
  if (!raw) return null;
  // Some legacy values might be "N/A" or empty — treat as null
  if (raw === "N/A" || raw.trim() === "") return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    // try parsing only date portion if format includes time
    const dateOnly = raw.split("T")[0];
    const d2 = new Date(dateOnly);
    if (!isNaN(d2.getTime())) return d2;
    return null;
  }
  return d;
};

// Helper function remains the same
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
  totalAmount: number; // Represents the calculated Grand Total
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
      // Ensure number fields are parsed correctly, defaulting to 0 if invalid
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

    // call parent update
    await onUpdateInspection(booking.booking_id, updateRequest);

    // Auto-move logic as per your rule:
    // move to bookings only if inspection_status === "confirmed" && booking_amount > 0
    if ((updateRequest.inspection_status || "").toLowerCase() === "confirmed" && (updateRequest.booking_amount ?? 0) > 0) {
      onMoveToBookings(booking.booking_id);
    }

    onClose();
  };

  const fullAddress = [booking.address_line_1, booking.address_line_2, booking.address_line_3, booking.city, booking.pincode].filter(Boolean).join(", ");

  const canMoveToBookings =
    (formData.inspection_status || "").toLowerCase() === "confirmed" && (formData.booking_amount ?? 0) > 0;

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
                value={formData.booking_amount === 0 && !String(formData.booking_amount).length ? "" : formData.booking_amount}
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
                value={formData.discount === 0 && !String(formData.discount).length ? "" : formData.discount}
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
              onClick={() => {
                // ensure update first with current formData then move
                (async () => {
                  const updateRequest: InspectionUpdateRequest = {
                    inspection_status: formData.inspection_status,
                    booking_amount: formData.booking_amount,
                    bookingStatus: formData.inspection_status,
                    site_visit: formData.site_visit,
                    worker_assign: formData.worker_assign,
                    discount: formData.discount,
                  };
                  await onUpdateInspection(booking.booking_id, updateRequest);
                  onMoveToBookings(booking.booking_id);
                  onClose();
                })();
              }}
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

/* -------------------------
   CalendarPopup component
   - simple, dependency-free calendar
   - supports 'single' (pick a date) and 'month' (pick month-year) modes
------------------------- */

type CalendarMode = "single" | "month";
interface CalendarPopupProps {
  anchorRef?: React.RefObject<HTMLElement>;
  initialDate?: Date | null;
  mode?: CalendarMode;
  onSelect: (d: Date | { month: number; year: number }) => void;
  onClose: () => void;
  minDate?: Date | null;
  maxDate?: Date | null;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ anchorRef, initialDate = null, mode = "single", onSelect, onClose, minDate = null, maxDate = null }) => {
  const [displayMonth, setDisplayMonth] = useState<number>((initialDate || new Date()).getMonth());
  const [displayYear, setDisplayYear] = useState<number>((initialDate || new Date()).getFullYear());
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) && !(anchorRef && anchorRef.current && anchorRef.current.contains(e.target as Node))) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  useEffect(() => {
    if (initialDate) {
      setDisplayMonth(initialDate.getMonth());
      setDisplayYear(initialDate.getFullYear());
    }
  }, [initialDate]);

  const daysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const firstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay(); // 0 = Sunday
  };

  const isDisabled = (d: Date) => {
    if (minDate && d.getTime() < minDate.getTime()) return true;
    if (maxDate && d.getTime() > maxDate.getTime()) return true;
    return false;
  };

  const handlePrev = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };
  const handleNext = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  // month picker (for mode === 'month')
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return (
    <div ref={popupRef} className="absolute z-50 mt-2 right-0 sm:right-auto sm:left-0 bg-white border rounded-lg shadow-lg p-3 w-[320px] max-w-full">
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrev} className="px-2 py-1 rounded hover:bg-gray-100">{"<"}</button>
        <div className="text-sm font-semibold">
          {months[displayMonth]} {displayYear}
        </div>
        <button onClick={handleNext} className="px-2 py-1 rounded hover:bg-gray-100">{">"}</button>
      </div>

      {mode === "month" ? (
        <div className="grid grid-cols-3 gap-1">
          {months.map((m, idx) => (
            <button
              key={m}
              className="py-2 rounded hover:bg-gray-100 text-sm"
              onClick={() => onSelect({ month: idx, year: displayYear })}
            >
              {m}
            </button>
          ))}
          <div className="col-span-3 mt-2 flex justify-between items-center">
            <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={() => { setDisplayYear((y) => y - 1); }}>
              Prev Year
            </button>
            <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={() => { setDisplayYear((y) => y + 1); }}>
              Next Year
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-1">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth(displayYear, displayMonth) }).map((_, i) => (
              <div key={"pad-" + i} />
            ))}

            {Array.from({ length: daysInMonth(displayYear, displayMonth) }).map((_, i) => {
              const day = i + 1;
              const d = new Date(displayYear, displayMonth, day, 12, 0, 0);
              const disabled = isDisabled(d);
              return (
                <button
                  key={day}
                  onClick={() => !disabled && onSelect(d)}
                  className={`py-2 rounded text-sm ${disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/* -------------------------
   Main Page (InspectionDashboard) - start
------------------------- */

export function InspectionDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "cancelled">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Date filter state
  type DateFilterOption = "all" | "today" | "yesterday" | "last7" | "thisMonth" | "custom" | "selectDate" | "selectMonth";
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("all");
  const [customFrom, setCustomFrom] = useState<string>(""); // yyyy-mm-dd
  const [customTo, setCustomTo] = useState<string>("");

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);


  // For single-date selection
  const [selectedDate, setSelectedDate] = useState<string>(""); // yyyy-mm-dd
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

  // calendar popup control
  const singleDateAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"single" | "month">("single");
  const [calendarInitial, setCalendarInitial] = useState<Date | null>(null);

  const fetchInspections = useCallback(() => {
    setLoading(true);
    InspectionAPIService.getAllInspections()
      .then((res: any) => {
        const validData = (res.data || []).filter((b: any) => b && b.booking_id);
        const normalized: Booking[] = validData
          // The filter ensures only zero-amount bookings (Inspections) are displayed on load
          .filter((b: any) => (b.booking_amount ?? 0) === 0)
          .map((b: any) => ({
            booking_id: b.booking_id,
            customer_name: b.customer_name,
            customer_email: b.customer_email,
            customer_number: b.customer_number,
            booking_service_name: b.booking_service_name,
            booking_amount: b.booking_amount ?? 0,
            // Calculate totalAmount (Grand Total) for display
            totalAmount: b.grand_total ?? ((b.booking_amount ?? 0) - (b.discount ?? 0)),
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
    setFilter(e.target.value as "all" | "pending" | "cancelled");
    setCurrentPage(1);
  };

  const handleDateFilterChange = (val: DateFilterOption) => {
    setDateFilter(val);
    setCurrentPage(1);
    // clear custom range when not custom
    if (val !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
    if (val !== "selectDate") {
      setSelectedDate("");
    }
    if (val !== "selectMonth") {
      setSelectedMonth(null);
    }
  };

  const handleCustomFromChange = (val: string) => {
    setCustomFrom(val);
    setCurrentPage(1);
  };

  const handleCustomToChange = (val: string) => {
    setCustomTo(val);
    setCurrentPage(1);
  };

  const handleCalendarSelect = (d: Date | { month: number; year: number }) => {
    if (calendarMode === "single") {
      if (d instanceof Date) {
        const iso = d.toISOString().slice(0, 10);
        setSelectedDate(iso);
        setDateFilter("selectDate");
        setCalendarInitial(d);
        setIsCalendarOpen(false);
        setCurrentPage(1);
      }
    } else {
      // month mode
      const payload = d as { month: number; year: number };
      setSelectedMonth(payload);
      setDateFilter("selectMonth");
      setIsCalendarOpen(false);
      setCurrentPage(1);
    }
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
                  // Re-calculate totalAmount after update
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
          // After update, filter again: If booking_amount is now > 0 OR inspection_status is confirmed and booking_amount>0, remove from this dashboard
          .filter((b) => (b.booking_amount ?? 0) === 0)
      );
    } catch (err) {
      console.error("Failed to update inspection:", err);
      // optionally: show toast / UI error
    }
  };

  const handleMoveToBookings = (bookingId: number) => {
    // Remove from current inspection list (client-side only).
    setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
    setIsEditModalOpen(false);
    setSelectedBooking(null);
    // Feedback for user
    alert("Booking moved to Bookings page successfully!");
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  /* -------------------------
     Filtering pipeline:
     1. status filter (all / pending / cancelled)
     2. date filter (booking_date)
     3. search filter (name, email, phone, id)
  ------------------------- */
  const filteredByStatus = useMemo(
    () => bookings.filter((b) => (filter === "all" ? true : b.bookingStatus === filter)),
    [bookings, filter]
  );

  const filteredByDate = useMemo(() => {
    if (dateFilter === "all") return filteredByStatus;

    const now = new Date();
    // normalize a date to midnight for comparisons (local)
    const startOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const endOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(23, 59, 59, 999);
      return x;
    };

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yStart = startOfDay(yesterday);
    const yEnd = endOfDay(yesterday);

    const last7Start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)); // last 7 days inclusive

    const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    // helper to check booking_date in range
    const inRange = (d: Date | null, s: Date, e: Date) => {
      if (!d) return false;
      return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
    };

    // custom range parse (yyyy-mm-dd)
    if (dateFilter === "custom") {
      if (!customFrom && !customTo) return filteredByStatus;
      const from = customFrom ? startOfDay(new Date(customFrom)) : new Date(-8640000000000000);
      const to = customTo ? endOfDay(new Date(customTo)) : new Date(8640000000000000);
      return filteredByStatus.filter((b) => {
        const bd = parseBookingDate(b.booking_date);
        return inRange(bd, from, to);
      });
    }

    if (dateFilter === "today") {
      return filteredByStatus.filter((b) => inRange(parseBookingDate(b.booking_date), todayStart, todayEnd));
    }

    if (dateFilter === "yesterday") {
      return filteredByStatus.filter((b) => inRange(parseBookingDate(b.booking_date), yStart, yEnd));
    }

    if (dateFilter === "last7") {
      return filteredByStatus.filter((b) => {
        const bd = parseBookingDate(b.booking_date);
        return bd ? bd.getTime() >= last7Start.getTime() && bd.getTime() <= todayEnd.getTime() : false;
      });
    }

    if (dateFilter === "thisMonth") {
      return filteredByStatus.filter((b) => inRange(parseBookingDate(b.booking_date), monthStart, monthEnd));
    }

    if (dateFilter === "selectDate") {
      if (!selectedDate) return filteredByStatus;
      const sel = startOfDay(new Date(selectedDate));
      const selEnd = endOfDay(new Date(selectedDate));
      return filteredByStatus.filter((b) => inRange(parseBookingDate(b.booking_date), sel, selEnd));
    }

    if (dateFilter === "selectMonth") {
      if (!selectedMonth) return filteredByStatus;
      const { month, year } = selectedMonth;
      const start = startOfDay(new Date(year, month, 1));
      const end = endOfDay(new Date(year, month + 1, 0));
      return filteredByStatus.filter((b) => inRange(parseBookingDate(b.booking_date), start, end));
    }

    return filteredByStatus;
  }, [filteredByStatus, dateFilter, customFrom, customTo, selectedDate, selectedMonth]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return filteredByDate;
    return filteredByDate.filter((b) => {
      return (
        (b.customer_name || "").toLowerCase().includes(term) ||
        (b.customer_email || "").toLowerCase().includes(term) ||
        (b.customer_number || "").toLowerCase().includes(term) ||
        b.booking_id.toString().includes(term)
      );
    });
  }, [filteredByDate, searchTerm]);

  // pagination derived values
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // when filtered list or filters change, ensure current page is within range and reset if necessary
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // reset to page 1 when user changes search/filter/date
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, dateFilter, customFrom, customTo, searchTerm, selectedDate, selectedMonth]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  if (loading)
    return <div className="text-center p-8 text-gray-700 font-semibold text-lg">Loading Inspection Dashboard...</div>;

  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
      <div className="min-w-[1050px]">
        <div className="px-4 py-6 space-y-6 min-h-screen bg-gray-50 text-gray-900 md:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-3xl font-bold drop-shadow-sm text-navy-700"> Inspection Management Dashboard</h1>
            <p className="text-gray-500 mt-1">Bookings awaiting site visit confirmation or final price setting.</p>
          </div>

          {/* Filters + Top Pagination Info */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 sticky top-0 z-10">


            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center w-full md:w-1/2 relative">
                <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Customer Name, Email, Phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-inner"
                />
              </div>

              <Button
  onClick={() => setIsBookingModalOpen(true)}
  className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
  + Create Booking
</Button>


              <div className="flex items-center gap-3 w-full md:w-auto">
                <select value={filter} onChange={handleFilterChange} className="px-3 py-2 rounded-lg border border-navy-400 bg-white font-semibold text-navy-600 shadow-sm">
                  <option value="all">All Bookings</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="thisMonth">This Month</option>
                 
                  <option value="custom">Custom Range</option>
                </select>

               

                {dateFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => handleCustomFromChange(e.target.value)}
                      className="px-2 py-1 border rounded-lg"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => handleCustomToChange(e.target.value)}
                      className="px-2 py-1 border rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Top pagination info and simple prev/next */}
            {filtered.length > 0 && (
              <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                <div>
                  Showing{" "}
                  <span className="font-semibold">{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
                  –
                  <span className="font-semibold">{Math.min(currentPage * pageSize, filtered.length)}</span>{" "}
                  of <span className="font-semibold">{filtered.length}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <div className="text-gray-700">
                    Page <b>{currentPage}</b> of <b>{totalPages}</b>
                  </div>
                  <Button size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        

          {/* Bookings List */}
          <div className="flex flex-col gap-3">
            {paginatedData.length === 0 ? (
              <div className="text-center p-10 text-gray-500 border-2 border-dashed rounded-xl bg-white shadow-inner">
                <X className="w-10 h-10 mx-auto mb-2" />
                <p>No inspection bookings found matching your current filter and search criteria.</p>
              </div>
            ) : (
              paginatedData.map((b) => (
                <Card key={b.booking_id} className="p-4 rounded-xl shadow-lg border-l-4 border-navy-700 bg-white relative hover:shadow-2xl transition duration-300 md:flex md:justify-between md:items-center">
                  {/* grid layout now 5 columns */}
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-5 items-center gap-3">
                    {/* Column 1: Customer & Status */}
                    <div className="flex flex-col items-start min-w-[120px]">
                      <InspectionStatusBadge status={b.inspection_status} />
                      <div className="font-bold text-lg text-navy-700 mt-1">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">Booking #{b.booking_id}</div>
                    </div>

                    {/* Column 2: Service & Date */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="font-semibold">{b.booking_service_name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <CalendarIcon className="w-3 h-3 text-navy-500" /> {formatDateForDisplay(b.booking_date)} at {b.booking_time}
                      </div>
                    </div>

                    {/* Column 3: Site Visit & Workers */}
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

                    {/* Column 4: Grand Total */}
                    <div className="text-sm text-gray-600 space-y-1 font-bold">
                      <div className="text-xs text-gray-500">Booking Grand Total</div>
                      <div className="flex items-center text-lg text-navy-700">
                        <RupeeIcon className="w-4 h-4 mr-1" />
                        {b.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    {/* Column 5: Location & Contact */}
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

          {/* Bottom Pagination (full page numbers) */}
          {filtered.length > pageSize && (
            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-4 py-2">
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 ${currentPage === i + 1 ? "bg-navy-700 text-white" : ""}`}
                >
                  {i + 1}
                </Button>
              ))}

              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-4 py-2">
                Next
              </Button>
            </div>
          )}

          {isBookingModalOpen && (
  <AdminCreateBookingModal
    onClose={() => setIsBookingModalOpen(false)}
    onCreated={() => {
      setIsBookingModalOpen(false);
      fetchInspections(); // refresh inspection list
    }}
  />
)}


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