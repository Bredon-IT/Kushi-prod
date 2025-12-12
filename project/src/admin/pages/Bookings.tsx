// File: src/pages/Bookings.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import BookingsAPIService from "../services/BookingAPIService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import Global_API_BASE from "../services/GlobalConstants";
import { useLocation } from "react-router-dom";
import AdminCreateBookingModal from "../components/bookings/AdminCreateBookingModal";


import {
  Edit,
  Search,
  Mail,
  IndianRupee as RupeeIcon,
  MapPin,
  X,
  UserCheck,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

/* ------------------------- Utilities / Types ------------------------- */


// convert "20:00" -> "08:00 PM"
const convert24To12 = (time24?: string) => {
  if (!time24) return "";
  // Accept "HH:mm" or "HH:mm:ss"
  const [hms] = time24.split(" ");
  const [hhStr, mmStr] = hms.split(":");
  if (hhStr == null || mmStr == null) return time24;
  let hh = Number(hhStr);
  const mm = mmStr.padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  const hhOut = String(hh).padStart(2, "0");
  return `${hhOut}:${mm} ${ampm}`;
};

// Safe parse booking_date to Date (returns null if invalid)
const parseBookingDate = (raw?: string | null) => {
  if (!raw) return null;
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

/* ------------------------- Edit Modal ------------------------- */

interface EditModalProps {
  booking: Booking;
  onClose: () => void;
  onCombinedUpdate: (
    booking: Booking,
    status: string,
    canceledBy?: "customer" | "admin",
    cancellationReason?: string,
    workers?: string[],
    discount?: number,
    paymentStatus?: string,
    paymentMethod?: string
  ) => Promise<void>;
  onAssignWorkerImmediate: (bookingId: number, workerName: string) => Promise<void>;
  onRemoveWorker: (bookingId: number, workerName: string) => Promise<void>;
}


const EditBookingModal: React.FC<EditModalProps> = ({
  booking,
  onClose,
  onCombinedUpdate,
  onAssignWorkerImmediate,
  onRemoveWorker,
}) => {


   /* ------------------ Local States ------------------ */

  const [statusSelection, setStatusSelection] = useState(
    booking.bookingStatus || "pending"
  );

  const [cancelReason, setCancelReason] = useState(
    booking.statusReason || booking.cancellation_reason || ""
  );

  const [statusReasonLabel, setStatusReasonLabel] = useState("Reason");


  const [discount, setDiscount] = useState<string>(
    booking.discount && booking.discount !== 0 ? String(booking.discount) : ""
  );

  const [workerNames, setWorkerNames] = useState<string>(
    booking.worker_assign?.join(", ") || ""
  );

  const [localWorkers, setLocalWorkers] = useState<string[]>(
    booking.worker_assign ? [...booking.worker_assign] : []
  );
  
  const [saving, setSaving] = useState(false);

  const [paymentStatusSelection, setPaymentStatusSelection] = useState(
    booking.paymentStatus || "Pending"
  );

  const [paymentMethodSelection, setPaymentMethodSelection] = useState(
    booking.paymentMethod || "Pay on Service"
  );

  const basePrice = booking.booking_amount ?? 0;
  const parsedDiscount = discount === "" ? 0 : Number(discount || 0);
  const newTotalAmount = Math.max(0, basePrice - (isNaN(parsedDiscount) ? 0 : parsedDiscount));

  const fullAddress = [
    booking.address_line_1,
    booking.address_line_2,
    booking.address_line_3,
    booking.city,
    booking.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // Assign workers locally and optionally call immediate assign API per worker
  const handleAssignWorkersImmediate = async () => {
    const trimmed = workerNames
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);
    if (trimmed.length === 0) return;

    setSaving(true);
    try {
      for (const worker of trimmed) {
        await onAssignWorkerImmediate(booking.booking_id, worker);
      }
      setLocalWorkers((prev) => [...prev, ...trimmed]);
      setWorkerNames("");
    } catch (err) {
      console.error("Failed to assign worker(s):", err);
      alert("Failed to assign some workers. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  // Remove local worker (calls API to remove permanently)
  const handleRemoveLocalWorker = async (idx: number) => {
    const workerToRemove = localWorkers[idx];
    if (!workerToRemove) return;

    setSaving(true);
    try {
      await onRemoveWorker(booking.booking_id, workerToRemove);
      setLocalWorkers(prev => prev.filter((_, i) => i !== idx));
    } catch (err) {
      console.error("Failed to remove worker within modal:", err);
      alert("Failed to remove worker. See console.");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------ SAVE STATUS ------------------ */

  const handleSaveStatus = async () => {
    const s = statusSelection.toLowerCase();

    if (s === "cancelled" && !cancelReason.trim()) {
      alert("Cancellation reason is required.");
      return;
    }

    const workersToSave = [
      ...new Set(localWorkers.map(w => w.trim()).filter(Boolean)),
    ];

    setSaving(true);
    try {
      await onCombinedUpdate(
        booking,
        statusSelection,
        s === "cancelled" ? "admin" : undefined,
        cancelReason.trim(),
        workersToSave,
        parsedDiscount,
        paymentStatusSelection,
        paymentMethodSelection
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update booking");
    } finally {
      setSaving(false);
    }
  };


  /* ------------------ Dynamic Status Reason Label ------------------ */

  useEffect(() => {
    const s = statusSelection.toLowerCase();
    if (s === "pending") setStatusReasonLabel("Reason (optional)");
    else if (s === "confirmed") setStatusReasonLabel("Confirmation Reason");
    else if (s === "completed") setStatusReasonLabel("Completion Reason");
    else if (s === "cancelled") setStatusReasonLabel("Cancellation Reason");
  }, [statusSelection]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-700">
              Update Booking #{booking.booking_id}
            </h2>
            <div className="text-sm text-gray-500">
              {booking.customer_name} · {booking.customer_number}
            </div>
          </div>

          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="close">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 border-b md:border-b-0 md:border-r pr-6">
            {/* Status */}
            <div>
              <label className="block text-sm">Booking Status</label>
              <select
                value={statusSelection}
                onChange={(e) => setStatusSelection(e.target.value)}
                className="border w-full px-3 py-2 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Dynamic Reason */}
           <div>
              <label className="text-sm">{statusReasonLabel}</label>
              <textarea
                className="border rounded-lg px-3 py-2 w-full"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Assign Workers (comma separated)</label>
              <input
                value={workerNames}
                onChange={(e) => setWorkerNames(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
                placeholder="e.g. Ravi, Meena"
              />
              <div className="mt-2 flex gap-2 items-center">
                <Button size="sm" onClick={handleAssignWorkersImmediate} disabled={saving}>
                  Assign Workers
                </Button>
                <div className="text-xs text-gray-500">{localWorkers.length} assigned</div>
              </div>

              {localWorkers.length > 0 && (
                <div className="mt-3 space-y-2">
                  {localWorkers.map((w, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded-md text-sm">
                      <div>{w}</div>
                      <button onClick={() => handleRemoveLocalWorker(i)} className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-semibold">Pricing & Payment</h3>

            <div>
              <label className="block text-sm mb-1">Base Amount</label>
              <div className="text-lg font-semibold text-navy-700">₹{booking.booking_amount}</div>
            </div>

            <div>
              <label className="block text-sm mb-1">Discount (₹)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder=""
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">New total: ₹{newTotalAmount.toFixed(2)}</div>
            </div>

           {/* Payment Method */}
            <div>
              <label className="text-sm">Payment Method</label>
              <select
                value={paymentMethodSelection}
                onChange={(e) => setPaymentMethodSelection(e.target.value)}
                className="border w-full px-3 py-2 rounded-lg"
              >
                <option value="Pay on Service">Pay on Service</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
               
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Payment Status</label>
              <select
                value={paymentStatusSelection}
                onChange={(e) => setPaymentStatusSelection(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              <div className="text-xs text-gray-400 mt-1">Payment status saved when you click "Save Status".</div>
            </div>

            <div className="text-sm text-gray-600">
              <MapPin className="inline w-4 h-4 mr-1" />
              {fullAddress}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Close
              </Button>
              <Button onClick={handleSaveStatus} disabled={saving}>
                {saving ? "Saving..." : "Save Status"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
   CalendarPopup component
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
   Main Bookings Page
------------------------- */

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const location = useLocation();
  const autoBookingId = location.state?.bookingId || null;
  const autoOpenEdit = location.state?.openEdit || false;
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

 


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Date filter state
  type DateFilterOption = "all" | "today" | "yesterday" | "last7" | "thisMonth" | "custom" | "selectDate" | "selectMonth";
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // calendar popup control
  const singleDateAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"single" | "month">("single");
  const [calendarInitial, setCalendarInitial] = useState<Date | null>(null);

   const [prefillData, setPrefillData] = useState<any>(null);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const openCreate = params.get("openCreate");

  const saved = localStorage.getItem("prefillBookingData");

  if (openCreate && saved) {
    setPrefillData(JSON.parse(saved));
    setIsCreateModalOpen(true);
    localStorage.removeItem("prefillBookingData");
  }
}, [location]);







  const fetchBookings = useCallback(() => {
    setLoading(true);

    BookingsAPIService.getAllBookings()
      .then((res: any) => {
        const valid = (res.data || []).filter((b: any) => b && b.booking_id);

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
          booking_time: (b.booking_time && b.booking_time.includes(":") && !b.booking_time.toLowerCase().includes("am") && !b.booking_time.toLowerCase().includes("pm"))
            ? convert24To12(b.booking_time)
            : (b.booking_time || ""),
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
              ? b.worker_assign.split(",").map((w: string) => w.trim()).filter(Boolean)
              : b.worker_assign || [],
          inspection_status: (b.inspection_status || b.inspectionStatus || "pending").toLowerCase(),
          site_visit: (b.site_visit || "pending").toLowerCase(),
          paymentMethod: b.paymentMethod || "N/A",
          paymentStatus: b.paymentStatus || "Pending",
        }));

        setBookings(normalized.sort((a, b) => b.booking_id - a.booking_id));
      })
      .catch((err) => console.error("Failed to fetch bookings:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auto open edit modal after navigating from Dashboard
  useEffect(() => {
    if (hasAutoOpened) return;
    if (!autoOpenEdit || !autoBookingId) return;
    if (bookings.length === 0) return;

    const found = bookings.find(b => b.booking_id === autoBookingId);

    if (found) {
      setSelectedBooking(found);
      setIsEditModalOpen(true);
      setHasAutoOpened(true);
    }
  }, [autoOpenEdit, autoBookingId, bookings, hasAutoOpened]);

  /* ------------------------- Existing API wrappers used by Save Status ------------------------- */

  // Update status endpoint
  const updateStatusApi = async (bookingId: number, payload: any) => {
    return axios.put(`${Global_API_BASE}/api/bookings/${bookingId}/status`, payload);
  };

  // Update discount endpoint
  const updateDiscountApi = async (bookingId: number, payload: any) => {
    return axios.put(`${Global_API_BASE}/api/bookings/${bookingId}/discount`, payload);
  };

  // Update payment status endpoint
  const updatePaymentStatusApi = async (bookingId: number, payload: any) => {
    return axios.put(`${Global_API_BASE}/api/bookings/${bookingId}/payment-status`, payload);
  };

  // Assign worker endpoint
  const assignWorkerApi = async (bookingId: number, workerName: string) => {
    return axios.put(`${Global_API_BASE}/api/admin/${bookingId}/assign-worker`, {
      workername: workerName,
    });
  };

  // REMOVE worker endpoint
  const removeWorkerApi = async (bookingId: number, workerName: string) => {
    return axios.put(`${Global_API_BASE}/api/admin/${bookingId}/remove-worker`, {
      workername: workerName,
    });
  };

  // Remove worker handler (calls service which uses correct admin path)
  const handleRemoveWorker = async (bookingId: number, workerName: string) => {
    try {
      await BookingsAPIService.removeWorker(bookingId, workerName);

      // Update UI list
      setBookings(prev =>
        prev.map(b =>
          b.booking_id === bookingId
            ? { ...b, worker_assign: b.worker_assign.filter(w => w !== workerName) }
            : b
        )
      );

      // Update selected booking if modal is open
      if (selectedBooking?.booking_id === bookingId) {
        setSelectedBooking(prev =>
          prev
            ? {
                ...prev,
                worker_assign: prev.worker_assign.filter(w => w !== workerName),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to remove worker:", err);
      alert("Failed to remove worker. See console.");
    }
  };

  /* ------------------------- Combined update called by Save Status ------------------------- */
  const handleCombinedUpdate = async (
  booking: Booking,
  status: string,
  canceledBy?: "customer" | "admin",
  cancellationReason?: string,
  workers?: string[],
  discount?: number,
  paymentStatus?: string,
   paymentMethod?: string
) => {
    // 1) status
   
  try {
    if (status.toLowerCase() === "cancelled" && !cancellationReason?.trim()) {
      alert("Cancellation reason is required.");
      return;
    }

    await updateStatusApi(booking.booking_id, {
      status,
      canceledBy: canceledBy || null,
      reason: cancellationReason || ""    // <-- Backend uses `reason`
    });

  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Failed to update booking");
    throw err;
  }


   /* ---------------------- 2) UPDATE DISCOUNT ---------------------- */
 try {
    await updateDiscountApi(booking.booking_id, {
      discount: typeof discount === "number" ? discount : 0,
    });
  } catch (err) {
    console.error("Failed to update discount:", err);
    throw err;
  }


   /* ---------------------- 3) UPDATE PAYMENT STATUS ---------------------- */
  try {
    if (paymentStatus) {
      await updatePaymentStatusApi(booking.booking_id, { paymentStatus });
    }
  } catch (err) {
    console.error("Failed to update payment status:", err);
    throw err;
  }

  /* ---------------------- 4) UPDATE PAYMENT METHOD ---------------------- */
  try {
    if (paymentMethod) {
      await axios.put(`${Global_API_BASE}/api/bookings/${booking.booking_id}/payment-method`, {
        paymentMethod,
      });
    }
  } catch (err) {
    console.error("Failed to update payment method:", err);
    throw err;
  }
    /* ---------------------- 4) ASSIGN WORKERS ---------------------- */
  if (workers && workers.length > 0) {
    try {
      for (const w of workers) {
        await assignWorkerApi(booking.booking_id, w);
      }
    } catch (err) {
      console.error("Failed to assign workers:", err);
      throw err;
    }
  }
    /* ---------------------- 5) UPDATE UI ---------------------- */
  setBookings((prev) =>
    prev.map((b) =>
      b.booking_id === booking.booking_id
        ? {
            ...b,
             bookingStatus: status,
            canceledBy: canceledBy || b.canceledBy,
            cancellation_reason: cancellationReason || b.cancellation_reason,
            statusReason: cancellationReason || b.statusReason,     // <-- ADDED
            worker_assign: workers && workers.length ? workers : b.worker_assign,
            discount: typeof discount === "number" ? discount : b.discount,
            totalAmount:
              typeof discount === "number"
                ? Math.max(0, b.booking_amount - discount)
                : b.totalAmount,
             paymentStatus: paymentStatus || b.paymentStatus,
            paymentMethod: paymentMethod || b.paymentMethod,
          }
        : b
    )
  );

  if (selectedBooking?.booking_id === booking.booking_id) {
    setSelectedBooking((prev) =>
      prev
        ? {
            ...prev,
            bookingStatus: status,
            canceledBy: canceledBy || prev.canceledBy,
            cancellation_reason: cancellationReason || prev.cancellation_reason,
            statusReason: cancellationReason || prev.statusReason,   // <-- ADDED
            worker_assign: workers && workers.length ? workers : prev.worker_assign,
            discount: typeof discount === "number" ? discount : prev.discount,
            totalAmount:
              typeof discount === "number"
                ? Math.max(0, prev.booking_amount - discount)
                : prev.totalAmount,
            paymentStatus: paymentStatus || prev.paymentStatus,
            paymentMethod: paymentMethod || prev.paymentMethod,
          }
        : prev
    );
  }
};

  /* ------------------------- Immediate assign worker handler ------------------------- */
  const handleAssignWorkerImmediate = async (bookingId: number, workerName: string) => {
    try {
      await assignWorkerApi(bookingId, workerName);

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
    } catch (err) {
      console.error("Failed assign worker:", err);
      throw err;
    }
  };

  /* -------------------------
     Filtering pipeline
  ------------------------- */

  const filteredByStatus = useMemo(
    () => bookings.filter((b) => (filter === "all" ? true : b.bookingStatus === filter)),
    [bookings, filter]
  );

  const filteredByDate = useMemo(() => {
    if (dateFilter === "all") return filteredByStatus;

    const now = new Date();
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

    const inRange = (d: Date | null, s: Date, e: Date) => {
      if (!d) return false;
      return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
    };

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

  // ensure page within range when filters change
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, dateFilter, customFrom, customTo, searchTerm, selectedDate, selectedMonth]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as any);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (val: DateFilterOption) => {
    setDateFilter(val);
    setCurrentPage(1);
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
      const payload = d as { month: number; year: number };
      setSelectedMonth(payload);
      setDateFilter("selectMonth");
      setIsCalendarOpen(false);
      setCurrentPage(1);
    }
  };

  if (loading)
    return (
      <div className="text-center p-8 text-gray-700 font-semibold text-lg">
        Loading Booking Dashboard...
      </div>
    );




    
  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
      <div className="min-w-[950px]">
        <div className="px-4 py-6 space-y-6 min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy-700">Booking Dashboard</h1>
            <p className="text-gray-500 mt-1">All bookings with quick actions (status, workers, discount, payment)</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-md border sticky top-0 z-10">
            <div className="flex justify-end">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 mb-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Create Booking
              </Button>
            </div>

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

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select value={filter} onChange={handleFilterChange} className="px-4 py-2 border rounded-lg">
                  <option value="all">Show All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
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
                  –<span className="font-semibold">{Math.min(currentPage * pageSize, filtered.length)}</span>{" "}
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
                <p>No bookings found.</p>
              </div>
            ) : (
              paginatedData.map((b) => (
                <Card
                  key={b.booking_id}
                  className="p-4 rounded-xl shadow-lg border-l-4 border-navy-700 bg-white md:flex md:justify-between md:items-center hover:shadow-2xl transition"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 flex-grow">
                    <div>
                      <StatusBadge status={b.bookingStatus} canceledBy={b.canceledBy} />
                      <div className="font-bold text-lg">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">#{b.booking_id}</div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="font-semibold">{b.booking_service_name}</div>
                      <div className="text-xs">
                        <CalendarIcon className="inline w-3 h-3 mr-1" />
                        {formatDateForDisplay(b.booking_date)} at{" "}
                        <Clock className="inline w-3 h-3 mr-1 ml-1" />
                        {b.booking_time}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <UserCheck className="inline w-3 h-3 mr-1 text-green-600" />
                      {b.worker_assign.length ? b.worker_assign.join(", ") : "No workers"}
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

                  <div className="flex items-center gap-2">
                    <Button className="mt-3 sm:mt-0 sm:ml-4 bg-navy-600 hover:bg-navy-700 text-sm py-2 px-4" onClick={() => { setSelectedBooking(b); setIsEditModalOpen(true); }}>
                      <Edit className="w-4 h-4 mr-2" /> Update
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

         {isCreateModalOpen && (
  <AdminCreateBookingModal
    prefillData={prefillData}
    onClose={() => setIsCreateModalOpen(false)}
    onCreated={() => {
      setIsCreateModalOpen(false);
      fetchBookings();
    }}
  />
)}

          {/* Edit Modal */}
          {isEditModalOpen && selectedBooking && (
            <EditBookingModal
              booking={selectedBooking}
              onClose={() => setIsEditModalOpen(false)}
              onCombinedUpdate={handleCombinedUpdate}
              onAssignWorkerImmediate={handleAssignWorkerImmediate}
              onRemoveWorker={handleRemoveWorker}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Bookings;
