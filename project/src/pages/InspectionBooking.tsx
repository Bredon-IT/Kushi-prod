// src/components/InspectionBooking.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  Clock9,
  ClipboardList,
  Home,
  Check,
  Zap,
  ChevronRight,
  X,
} from "lucide-react";
import Global_API_BASE from "../services/GlobalConstants";

// --- Local Storage Key ---
const STORAGE_KEY = "inspectionFormDraft";

// Placeholder interfaces (replace with your actual imports/types)
interface Service {
  id: string;
  name: string;
  category: string;
  price?: number;
  image?: string;
  description?: string;
  rating?: number;
  reviews?: string;
}
interface InspectionForm {
  serviceCategory: string;
  specificService: string;
  date: string;
  time: string;
  onsiteContact: string;
  onsitePhone: string; // raw digits
  email: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

// --- Robust BookingAPIService using fetch with tolerant response handling ---
const BookingAPIService = {
  createBooking: async (payload: any) => {
    const res = await fetch(`${Global_API_BASE}/api/bookings/newbookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify(payload),
    });

    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    // If not OK, extract text or json for better error message
    if (!res.ok) {
      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        throw new Error(json ? JSON.stringify(json) : `HTTP ${res.status} ${res.statusText}`);
      } else {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
      }
    }

    // On success, return parsed JSON when available, otherwise return text
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  },
};

// --- Auth hook placeholder (replace with your auth provider) ---
const useAuth = () => ({
  user: { id: 123, email: "" }, // adjust as needed in your app
});

const ALL_TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

// --- Initial Form State for Reset ---
const getInitialFormState = (service: Service | null, userEmail: string | undefined): InspectionForm => ({
  serviceCategory: service?.category || "",
  specificService: service?.name || "Site Inspection",
  date: "",
  time: "",
  onsiteContact: "",
  onsitePhone: "",
  email: userEmail || "",
  address: "",
  city: "",
  pincode: "",
  notes: "",
});

// Helper to format phone number for display (e.g., +91 99999 88888)
const formatPhoneNumber = (digits: string) => {
  if (!digits) return "";
  const cleaned = digits.replace(/\D/g, "");
  let formatted = "";
  if (cleaned.length > 0) formatted += "+91 ";
  if (cleaned.length > 0) formatted += cleaned.substring(0, 5);
  if (cleaned.length > 5) formatted += " " + cleaned.substring(5, 10);
  return formatted.trim();
};

// --- ModernInput component (Kept clean look, slightly smaller padding) ---
const ModernInput = ({ label, name, icon: Icon, error, ...props }: any) => {
  const isPhoneNumber = name === "onsitePhone";
  const formattedValue = isPhoneNumber ? formatPhoneNumber(props.value) : props.value;

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <Icon size={14} className="text-navy-700" />
        {label}
        {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        // Reduced py from 2 to 1.5 for a slightly shorter input box
        className={`w-full px-3 py-1.5 border rounded-md text-sm transition-shadow focus:border-navy-700 focus:ring-1 focus:ring-navy-700
          ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
        onChange={props.onChange}
        value={formattedValue}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-0.5" role="alert">{error}</p>}
    </div>
  );
};

// --- ModernSelect component (Kept clean look, slightly smaller padding) ---
const ModernSelect = ({ label, name, icon: Icon, error, options, ...props }: any) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <Icon size={14} className="text-navy-700" />
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
           // Reduced py from 2 to 1.5 for a slightly shorter input box
          className={`w-full px-3 py-1.5 border rounded-md text-sm appearance-none transition-shadow focus:border-navy-700 focus:ring-1 focus:ring-navy-700
            ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
          onChange={props.onChange}
          value={props.value}
          {...props}
        >
          <option value="" disabled>-- Select {label} --</option>
          {options.map((s: string) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <ChevronRight size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-600 mt-0.5" role="alert">{error}</p>}
    </div>
  );
};
// --- END New Input/Select Components ---


const InspectionBooking: React.FC = () => {


  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);  


  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const initialService = (location.state as any)?.selectedService as Service | undefined;

  const [currentService, setCurrentService] = useState<Service | null>(initialService || null);
  const [form, setForm] = useState<InspectionForm>(getInitialFormState(initialService || null, user?.email));
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(10); 
  const today = new Date().toISOString().split("T")[0];
  const contactRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLDivElement>(null);
  const draftLoadedRef = useRef(false);

  // --- Filter Time Slots based on Date and Current Time ---
  const timeSlots = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toISOString().split("T")[0];

    // If the selected date is today, filter out past slots
    if (form.date === currentDate) {
      return ALL_TIME_SLOTS.filter(slot => {
        const [timePart, period] = slot.split(" ");
        let [h] = timePart.split(":").map(Number);
        
        // Convert to 24-hour format for comparison
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        
        // Allow slots that are at least one hour in the future
        // For example, if it's 3:30 PM (15:30), 4:00 PM (16:00) is the first available slot.
        // If it's 3:00 PM (15:00), 4:00 PM (16:00) is the first available slot.
        return h > currentHour; 
      });
    }

    // For any future date, all slots are available
    return ALL_TIME_SLOTS;

  }, [form.date]);

  // --- Load draft / initialize
  useEffect(() => {
    const storedDraft = localStorage.getItem(STORAGE_KEY);
    if (storedDraft) {
      draftLoadedRef.current = true;
      const savedForm = JSON.parse(storedDraft);
      setForm((prevForm) => ({
        ...getInitialFormState(null, user?.email),
        ...savedForm,
        serviceCategory: currentService?.category || savedForm.serviceCategory || "",
        specificService: currentService?.name || savedForm.specificService || "Site Inspection",
        email: user?.email || savedForm.email || "",
      }));
    } else if (currentService) {
      setForm(getInitialFormState(currentService, user?.email));
    }
  }, [currentService, user?.email]);

  // --- save draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);


  // NOTE: handleRemoveService and handleRemoveDraft have been removed from the component logic
  // as requested to minimize UI elements.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "onsitePhone") {
      const digitsOnly = value.replace(/\D/g, "");
      setForm((p) => ({ ...p, [name]: digitsOnly }));
      newValue = digitsOnly;
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }

    // Clear error for the field being changed
    if (errors[name]) setErrors((p: any) => ({ ...p, [name]: "" }));
    
    // Additional validation/reset for time slot if date changes
    if (name === "date") {
        const newDate = value;
        const now = new Date();
        const currentHour = now.getHours();
        const currentDate = now.toISOString().split("T")[0];

        // If the date is changed to today or a previous day (shouldn't happen with min={today}, but for robustness)
        // AND the current time slot is now in the past, reset the time slot.
        if (newDate === currentDate) {
             const [timePart, period] = form.time.split(" ");
             let [h] = timePart.split(":").map(Number);
             if (period === "PM" && h !== 12) h += 12;
             if (period === "AM" && h === 12) h = 0;
             
             if (h <= currentHour) {
                setForm(p => ({ ...p, time: "" }));
             }
        }
        
        // If the date is changed to a future date, the time can stay if it was selected.
    }
  };

  // validation
  const getValidationErrors = (fields: (keyof InspectionForm)[]): any => {
    const newErrors: any = {};
    const phoneDigits = (form.onsitePhone || "").replace(/\D/g, "");

    if (fields.includes("onsiteContact") && !form.onsiteContact) newErrors.onsiteContact = "Contact name is required";
    if (fields.includes("onsitePhone") && (!phoneDigits || phoneDigits.length !== 10)) newErrors.onsitePhone = "Enter valid 10-digit phone number";
    if (fields.includes("email") && (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) newErrors.email = "Valid email is required";
    if (fields.includes("date") && !form.date) newErrors.date = "Select a preferred date";
    // Check if time is selected AND if it's one of the currently available slots
    if (fields.includes("time") && (!form.time || !timeSlots.includes(form.time))) {
      newErrors.time = form.date === today && form.time && !timeSlots.includes(form.time) ? "Selected time is in the past, please choose a new slot" : "Select a preferred time slot";
    }
    if (fields.includes("address") && !form.address) newErrors.address = "Site address is required";
    if (fields.includes("city") && !form.city) newErrors.city = "City is required";
    if (fields.includes("pincode") && !/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Pincode must be 6 digits";

    return newErrors;
  };

  const toISODateTime = (dateStr: string, slot: string) => {
    if (!dateStr || !slot) return "";
    const [t, period] = slot.split(" ");
    let [h, m] = t.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allFields: (keyof InspectionForm)[] = ["onsiteContact", "onsitePhone", "email", "date", "time", "address", "city", "pincode"];
    const newErrors = getValidationErrors(allFields);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to the first section with an error
      if (newErrors.onsiteContact || newErrors.onsitePhone || newErrors.email || newErrors.date || newErrors.time) {
        contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (newErrors.address || newErrors.city || newErrors.pincode) {
        locationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    setIsLoading(true);

    const bookingPayload = {
      customerId: user?.id ?? null,
      customerName: form.onsiteContact,
      customerEmail: form.email,
      customerNumber: form.onsitePhone, // raw digits
      addressLine1: form.address,
      addressLine2: "",
      addressLine3: "",
      city: form.city,
      zipCode: form.pincode,
      bookingAmount: currentService?.price ?? 0.0,
      totalAmount: currentService?.price ?? 0.0,
      discount: 0.0,
      grand_total: 0.0,
      bookingDate: toISODateTime(form.date, form.time), // "yyyy-MM-dd'T'HH:mm:ss"
      bookingServiceName: form.specificService,
      bookingStatus: "Pending",
      bookingTime: form.time,
      confirmationDate: "",
      createdBy: "Customer",
      createdDate: new Date().toISOString(),
      paymentStatus: "Unpaid",
      referenceDetails: "",
      referenceName: "",
      remarks: form.notes,
      updatedBy: "",
      updatedDate: "",
      workerAssign: "",
      site_visit: "Pending",
      service_id: currentService ? Number(currentService.id) : null,
      cancellation_reason: "",
      inspection_status: "",
      payment_method: "",
    };

    try {
      const resp = await BookingAPIService.createBooking(bookingPayload);
      console.log("Create booking response:", resp);
      localStorage.removeItem(STORAGE_KEY);
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Booking create failed:", err);
      setIsLoading(false);
      // Show server message if available
      alert("Failed to submit inspection request: " + (err.message || "Unknown error"));
    }
  };

  // Helper for status checks
  const sectionHasErrors = useMemo(() => {
    return (section: "contact" | "location"): boolean => {
      const allErrors = getValidationErrors([
        "onsiteContact", "onsitePhone", "email", "date", "time", "address", "city", "pincode"
      ]);

      if (section === "contact") {
        return !!allErrors.onsiteContact || !!allErrors.onsitePhone || !!allErrors.email || !!allErrors.date || !!allErrors.time;
      }
      if (section === "location") {
        return !!allErrors.address || !!allErrors.city || !!allErrors.pincode;
      }
      return false;
    };
  }, [form, timeSlots]); // Re-calculate when form or available time slots change

  const isContactComplete = !sectionHasErrors("contact");
  const isLocationComplete = !sectionHasErrors("location");
  const isFormValid = isContactComplete && isLocationComplete;



   // --- NEW: Countdown Timer and Auto-Redirect useEffect ---
  useEffect(() => {
    if (isSubmitted) {
      // 1. Initial scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' }); 

      // 2. Set up the countdown interval
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // 3. Auto-redirect after countdown reaches 0
            navigate("/services"); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 4. Cleanup function to clear the interval if the component unmounts or isSubmitted changes
      return () => clearInterval(interval);
    }
  }, [isSubmitted, navigate]); 
   // -----------------------------------------------------

 if (isSubmitted) {
    // --- UPDATED Confirmation Screen JSX ---
    const formattedDate = form.date ? new Date(form.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    
    
   return (
      <div className="bg-gray-50 min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-xl mx-auto text-center bg-white rounded-xl shadow-2xl p-8 border-t-4 border-green-500">
          {/* Animated icon (Keep as is) */}
          <CheckCircle size={64} className="text-green-600 mx-auto mb-5 animate-bounce" />
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Inspection Request Confirmed!</h1>
          
          {/* UPDATED: Display Service Name prominently */}
          <p className="text-lg text-gray-600">
            Your booking for <strong className="text-navy-700">{form.specificService}</strong> has been successfully logged.
          </p>
          
          {/* UPDATED: Details Summary (Service and Formatted Date) */}
          <div className="my-4 p-4 bg-green-50 border-l-4 border-green-600 rounded text-left"> 
            <p className="text-sm font-semibold text-green-800 mb-1">Booking Summary:</p>
            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
              <ClipboardList size={16} className="text-green-600"/> 
              Service: <strong className="text-gray-800">{form.specificService}</strong>
            </p>
            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
              <Calendar size={16} className="text-green-600"/> 
              Date: <strong className="text-gray-800">{formattedDate}</strong> at <strong className="text-gray-800">{form.time}</strong>
            </p>
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <User size={16} className="text-green-600"/> 
              Contact: {form.onsiteContact} ({formatPhoneNumber(form.onsitePhone)})
            </p>
          </div>
          
          {/* UPDATED: Auto-Redirect Message with Countdown */}
          <p className="text-sm text-gray-700 mt-4">
            A formal confirmation email has been dispatched to <strong className="text-navy-700">{form.email}</strong>. Our scheduling team will be in touch shortly.
          </p>
          <p className="text-sm font-bold text-red-500 mt-2 flex items-center justify-center gap-1">
            <Clock9 size={14} className="animate-pulse" />
            Auto-redirecting to Services in <span className="text-xl mx-1">{countdown}</span> seconds...
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            {/* The Link should now immediately redirect to services, effectively canceling the timer */}
            <Link 
              to="/services" 
              className="w-full sm:w-auto px-6 py-2 border border-navy-600 rounded-lg text-navy-600 font-semibold hover:bg-navy-50 transition"
              // Optional: Add a key to force re-render if you want the countdown to stop immediately on click, 
              // but the main useEffect cleanup handles the redirect logic already.
            >
              <ArrowLeft size={16} className="inline mr-1" /> Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-4"> {/* Removed pb-20 */}
      {/* Top Bar for Back Navigation only */}
      <div className="max-w-4xl mx-auto px-4 mb-3 flex items-center justify-between"> {/* Increased max-w */}
        <Link to="/services" className="inline-flex items-center gap-1 text-gray-700 hover:text-navy-600 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Services
        </Link>
      </div>

      {/* MAIN REDESIGNED FORM CARD - Increased Width to max-w-4xl */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto px-4 pb-8"> {/* Added pb-8 for bottom space before viewport end */}
          <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-navy-500">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-4">Site Inspection Booking</h1> {/* Reduced mb */}

            {/* SERVICE SUMMARY (Compact) */}
            <div className={`p-3 rounded-lg mb-4 border-l-4 ${currentService ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}`}> {/* Reduced padding/margin */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Service: <span className="text-navy-700">{form.specificService}</span>
                  </h3>
                  {currentService && <p className="text-xs text-gray-600">Category: {currentService.category}</p>}
                  {!currentService && <p className="text-xs text-gray-600 font-medium">Proceeding with a general site inspection request.</p>}
                </div>
              </div>
            </div>

            {/* SECTION 1: CONTACT & SCHEDULE */}
            <div ref={contactRef} className="space-y-4 pb-4 border-b border-gray-200"> {/* Reduced space-y and padding */}
                <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${isContactComplete ? 'bg-green-500' : 'bg-navy-500'}`}>
                        {isContactComplete ? <Check size={14} /> : 1}
                    </span>
                    <h2 className="text-lg font-bold text-gray-800">Contact & Schedule</h2> {/* Reduced heading size */}
                </div>
                
                {/* Contact Inputs (3 columns for Name, Phone, Email) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3"> {/* 3 columns on medium/large screens */}
                    <ModernInput label="Onsite Contact Name" name="onsiteContact" value={form.onsiteContact} icon={User} error={errors.onsiteContact} type="text" onChange={handleChange} required />
                    <ModernInput label="Phone Number" name="onsitePhone" value={form.onsitePhone} icon={Phone} error={errors.onsitePhone} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} onChange={handleChange} required />
                    <ModernInput label="Email Address" name="email" value={form.email} icon={Mail} error={errors.email} type="email" onChange={handleChange} required />
                </div>

                <div className="pt-2">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 border-t pt-2">Preferred Inspection Schedule</h3> {/* Reduced heading size and margin/padding */}
                    {/* Schedule Inputs (2 columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col space-y-1">
                            <label htmlFor="date" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Calendar size={14} className="text-navy-700" />
                                Preferred Date
                                <span className="text-red-500">*</span>
                            </label>
                            {/* Reduced py from 2 to 1.5 for a slightly shorter input box */}
                            <input id="date" type="date" name="date" value={form.date} onChange={handleChange} min={today} className={`w-full px-3 py-1.5 border rounded-md text-sm transition-shadow focus:border-navy-700 focus:ring-1 focus:ring-navy-700 ${errors.date ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`} />
                            {errors.date && <p className="text-xs text-red-600 mt-0.5">{errors.date}</p>}
                        </div>
                        <ModernSelect label="Time Slot" name="time" value={form.time} icon={Clock9} error={errors.time} options={timeSlots} onChange={handleChange} required />
                        {/* Empty column for alignment on large screens */}
                        <div className="hidden lg:block"></div> 
                    </div>
                </div>
            </div>


            {/* SECTION 2: LOCATION & DETAILS */}
            <div ref={locationRef} className="space-y-4 pt-4"> {/* Reduced space-y and padding */}
                <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${isLocationComplete ? 'bg-green-500' : 'bg-navy-600'}`}>
                        {isLocationComplete ? <Check size={14} /> : 2}
                    </span>
                    <h2 className="text-lg font-bold text-gray-800">Site Location & Details</h2> {/* Reduced heading size */}
                </div>

                {/* Grid for Address and City/District */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                    {/* Site Address (Full width on mobile, 2/3 width on desktop) */}
                    <div className="col-span-1 md:col-span-2 flex flex-col space-y-1">
                        <label htmlFor="address" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <MapPin size={14} className="text-navy-700" />
                            Site Address (Detailed location) <span className="text-red-500">*</span>
                        </label>
                        {/* Reduced rows from 3 to 2 for compactness */}
                        <textarea id="address" name="address" value={form.address} onChange={handleChange} rows={2} className={`w-full px-3 py-1.5 border rounded-md text-sm transition-shadow focus:border-navy-600 focus:ring-1 focus:ring-navy-600 ${errors.address ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`} />
                        {errors.address && <p className="text-xs text-red-600 mt-0.5">{errors.address}</p>}
                    </div>

                    {/* City/District (1/3 width on desktop) */}
                    <ModernInput label="City/District" name="city" value={form.city} icon={MapPin} error={errors.city} type="text" onChange={handleChange} required />
                </div>
                
                {/* ROW FOR PINCODE AND NOTES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    
                    {/* Pincode - Takes 1 column */}
                    <ModernInput label="Pincode" name="pincode" value={form.pincode} icon={Home} error={errors.pincode} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} onChange={handleChange} required />
                    
                    {/* Additional Notes - Takes 1 column */}
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="notes" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <ClipboardList size={14} className="text-navy-600" />
                            Additional Notes/Remarks
                        </label>
                        {/* Reduced rows from 3 to 2 for compactness */}
                        <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full px-3 py-1.5 border rounded-md text-sm transition-shadow focus:border-navy-700 focus:ring-1 focus:ring-navy-700 border-gray-300 bg-white" />
                    </div>
                </div>

            </div>
            
            {/* SUBMIT SECTION: MOVED INSIDE FORM CARD */}
            <div ref={submitRef} className="pt-6 mt-6 border-t border-gray-200"> {/* Added top border/padding/margin for separation */}
                <div className="flex justify-between items-center">
                    
                    {/* Status Indicator */}
                    <div className="flex flex-col">
                        <p className="text-xs font-semibold text-gray-500">
                            {isFormValid ? "Ready to book" : "Review details"}
                        </p>
                        <p className={`text-sm font-bold ${isFormValid ? 'text-green-600' : 'text-red-500'}`}>
                            <Zap size={14} className="inline mr-1" />
                            {isFormValid ? 'All details complete' : 'Missing required fields'}
                        </p>
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading || !isFormValid} 
                        className={`px-8 py-3 rounded-lg font-bold text-base transition flex items-center gap-2 ${
                            isLoading || !isFormValid 
                                ? "bg-gray-400 text-white cursor-not-allowed" 
                                : "bg-navy-600 text-white hover:bg-navy-700 shadow-lg"
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-t-white border-navy-400 rounded-full"></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                Confirm Booking <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InspectionBooking;