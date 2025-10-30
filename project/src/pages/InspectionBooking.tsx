import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail, CheckCircle, Trash2, Wrench, Clock9, ClipboardList, Home } from "lucide-react";

// --- Local Storage Key ---
const STORAGE_KEY = "inspectionFormDraft";

// Placeholder interfaces (use your actual imports)
interface Service {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
    rating: number;
    reviews: string;
}
interface InspectionForm {
    serviceCategory: string;
    specificService: string;
    date: string;
    time: string;
    onsiteContact: string;
    onsitePhone: string; // Stored as raw digits for validation/API, formatted for display
    email: string;
    address: string;
    city: string;
    pincode: string;
    notes: string;
}
// Placeholder functions for demonstration (replace with your actual code)
const BookingAPIService = {
    createBooking: (payload: any) => new Promise((resolve) => setTimeout(resolve, 1500)),
};

// --- MODIFIED: Removed hardcoded email ---
const useAuth = () => ({
    user: { id: "123", email: "" } // Email is now empty
});


const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
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

// --- Tab Types ---
type CurrentTab = 'contact' | 'location';

// Helper to format phone number for display (e.g., +91 99999 88888)
const formatPhoneNumber = (digits: string) => {
    if (!digits) return "";
    const cleaned = digits.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted += '+91 ';
    if (cleaned.length > 0) formatted += cleaned.substring(0, 5);
    if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 10);
    return formatted.trim();
};


// --- FloatingInput component (As provided and modified) ---
const FloatingInput = ({ label, name, icon: Icon, error, ...props }: any) => {
    const isPhoneNumber = name === "onsitePhone";
    const formattedValue = isPhoneNumber
        ? formatPhoneNumber(props.value)
        : props.value;

    const [isFocused, setIsFocused] = useState(false);

    // Determines if the label should be visibly "floating" at the top
    const shouldFloat = isFocused || !!formattedValue;

    return (
        <div className="relative pt-4">
            {/* Icon remains static, aligned with the input's text position */}
            {/* Adjusted vertical position (top-[21px]) for better alignment */}
            <Icon className="absolute left-3 bottom-[10px] transform -translate-y-1/2 text-gray-400" size={16} />

            {/* Label - TRANSITION LOGIC SIMPLIFIED */}
            <label
                htmlFor={name}
                className={`absolute left-8 transition-all duration-200 pointer-events-none bg-white px-1 ml-[-4px]
                    ${shouldFloat
                        ? 'top-1 text-xs font-medium text-blue-600'
                        : 'top-[17px] text-sm text-gray-500' // Default position, adjusted to align with input text visually
                    }
                    ${isFocused && 'text-blue-600'}
                `}
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm transition-shadow focus:ring-1
                    ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : isFocused ? 'border-blue-500 focus:ring-blue-500' : 'border-gray-300'
                    }`}
                onChange={props.onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                value={formattedValue} // Use formatted value for display
                {...props}
            />
            {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
    );
};
// --- END FloatingInput Component ---


const InspectionBooking: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const initialService = location.state?.selectedService as Service | undefined;

    const [currentService, setCurrentService] = useState<Service | null>(initialService || null);
    const [form, setForm] = useState<InspectionForm>(getInitialFormState(initialService || null, user?.email));
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState<CurrentTab>('contact'); // State for the active tab

    const today = new Date().toISOString().split("T")[0];
    const contactTabRef = useRef<HTMLDivElement>(null);
    const locationTabRef = useRef<HTMLDivElement>(null);

    // Flag to track if a draft was loaded
    const draftLoadedRef = useRef(false);

    // --- Effect 1: Load from Local Storage on Mount ---
    useEffect(() => {
        const storedDraft = localStorage.getItem(STORAGE_KEY);
        if (storedDraft) {
            draftLoadedRef.current = true; // Mark that a draft was loaded
            const savedForm = JSON.parse(storedDraft);
            setForm(prevForm => ({
                ...getInitialFormState(null, user?.email),
                ...savedForm,
                // These should be updated if a new service is selected or user email changes
                serviceCategory: currentService?.category || savedForm.serviceCategory || "",
                specificService: currentService?.name || savedForm.specificService || "Site Inspection",
                email: user?.email || savedForm.email || "",
            }));
        } else if (currentService) {
            setForm(getInitialFormState(currentService, user?.email));
        }
    }, [currentService, user?.email]);

    // --- Effect 2: Save to Local Storage on Form Change ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, [form]);

    // --- Handlers ---

    const handleRemoveService = () => {
        setCurrentService(null);
        setForm((f) => {
            const newForm = {
                ...f,
                serviceCategory: "",
                specificService: "General Site Inspection Request",
            };
            // Keep the rest of the draft data, only update service fields and save
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newForm));
            return newForm;
        });
        navigate(location.pathname, { replace: true });
    };

    /**
     * @NEW_HANDLER
     * Clears the current form state to the initial state and removes the draft from Local Storage.
     * This is the manual "Remove Draft" action.
     */
    const handleRemoveDraft = () => {
        if (window.confirm("Are you sure you want to clear the form and delete the saved draft?")) {
            localStorage.removeItem(STORAGE_KEY);
            // Reset to initial state, keeping the current service selection
            setForm(getInitialFormState(currentService, user?.email));
            setErrors({});
            setActiveTab('contact');
            draftLoadedRef.current = false; // Reset the flag
        }
    };


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        // Special handling for phone number formatting
        if (name === "onsitePhone") {
            const digitsOnly = value.replace(/\D/g, "");
            // Store raw digits, but the input's value prop will format it
            setForm((p) => ({ ...p, [name]: digitsOnly }));
        } else {
            setForm((p) => ({ ...p, [name]: value }));
        }

        // Clear error for the field being edited
        if (errors[name]) setErrors((p: any) => ({ ...p, [name]: "" }));
    };

    // Validation Helper
    const validate = (fields: (keyof InspectionForm)[]): boolean => {
        const newErrors: any = {};
        const phoneDigits = (form.onsitePhone || "").replace(/\D/g, ""); // Ensure digits for validation

        if (fields.includes('onsiteContact') && !form.onsiteContact) newErrors.onsiteContact = "Contact name is required";
        if (fields.includes('onsitePhone') && (!phoneDigits || phoneDigits.length < 10)) newErrors.onsitePhone = "Enter valid 10-digit phone number";
        if (fields.includes('email') && (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) newErrors.email = "Valid email is required";
        if (fields.includes('date') && !form.date) newErrors.date = "Select a preferred date";
        if (fields.includes('time') && !form.time) newErrors.time = "Select a preferred time slot";

        if (fields.includes('address') && !form.address) newErrors.address = "Site address is required";
        if (fields.includes('city') && !form.city) newErrors.city = "City is required";
        if (fields.includes('pincode') && !/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Pincode must be 6 digits";

        // Only update errors relevant to the tab being validated, but keep all previous errors
        setErrors((prev: any) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    // Tab Navigation Handler
    const handleTabNext = () => {
        if (activeTab === 'contact') {
            const contactFields: (keyof InspectionForm)[] = ['onsiteContact', 'onsitePhone', 'email', 'date', 'time'];
            if (validate(contactFields)) {
                setActiveTab('location');
            }
        }
    };

    const toISODateTime = (dateStr: string, slot: string) => {
        if (!dateStr || !slot) return null;
        const [t, period] = slot.split(" ");
        let [h, m] = t.split(":").map(Number);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return `${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate all required fields
        const allFields: (keyof InspectionForm)[] = ['onsiteContact', 'onsitePhone', 'email', 'date', 'time', 'address', 'city', 'pincode'];
        const isValid = validate(allFields);

        // Capture the latest errors set by the validate function
        const newErrors = { ...errors, ...Object.fromEntries(allFields.map(f => [f, errors[f] || (validate([f]) ? "" : "Error")])) };
        setErrors(newErrors); // Ensure errors are up to date immediately before checking them

        if (!isValid) {
            // If validation fails, navigate to the first tab with an error
            const contactFields = ['onsiteContact', 'onsitePhone', 'email', 'date', 'time'];
            const locationFields = ['address', 'city', 'pincode'];

            const hasContactErrors = contactFields.some(key => newErrors[key]);
            const hasLocationErrors = locationFields.some(key => newErrors[key]);

            if (hasContactErrors) {
                setActiveTab('contact');
            } else if (hasLocationErrors) {
                setActiveTab('location');
            }
            return;
        }

        setIsLoading(true);

        const bookingPayload = {
            customerId: user?.id || null,
            customerName: form.onsiteContact,
            customerEmail: form.email,
            customerNumber: form.onsitePhone, // Send raw digits to API
            addressLine1: form.address,
            city: form.city,
            zipCode: form.pincode,
            bookingType: "Site Inspection",
            bookingServiceName: form.specificService,
            bookingDate: toISODateTime(form.date, form.time),
            bookingTime: form.time,
            remarks: form.notes,
            service_id: currentService ? Number(currentService.id) : null,
        };

        try {
            await BookingAPIService.createBooking(bookingPayload);
            localStorage.removeItem(STORAGE_KEY); // Clear draft on successful submission
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            alert("Failed to submit inspection request. Please try again.");
        }
    };

    // Helper to check if a tab has errors (for visual indicators)
    const tabHasError = (tab: CurrentTab) => {
        if (tab === 'contact') {
            return errors.onsiteContact || errors.onsitePhone || errors.email || errors.date || errors.time;
        }
        if (tab === 'location') {
            return errors.address || errors.city || errors.pincode;
        }
        return false;
    }

    // --- Confirmation View ---
    if (isSubmitted) {
        return (
            <div className="bg-gray-50 min-h-[75vh] flex items-center justify-center p-4">
                <div className="max-w-xl mx-auto text-center bg-white rounded-xl shadow-2xl p-8 border-t-4 border-green-500">
                    <CheckCircle size={64} className="text-green-600 mx-auto mb-5 animate-bounce" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Inspection Request Confirmed!</h1>
                    <p className="text-lg text-gray-600">
                        Reference for {form.specificService} has been successfully logged.
                    </p>
                    <div className="my-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-left">
                        <p className="text-sm font-semibold text-blue-800">Details Summary:</p>
                        <p className="text-sm text-gray-700">Date: {form.date} at {form.time}</p>
                        <p className="text-sm text-gray-700">Contact: {form.onsiteContact} ({formatPhoneNumber(form.onsitePhone)})</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        A formal confirmation email has been dispatched to {form.email}. Our scheduling team will be in touch shortly to finalize all details.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                        <Link to="/services" className="w-full sm:w-auto px-6 py-2 border border-blue-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition">
                            <ArrowLeft size={16} className="inline mr-1" /> Browse Services
                        </Link>
                       
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Form View ---
    return (
        <div className="bg-gray-50 py-4 w-full"> {/* Reduced py-6 to py-4 */}
            <div className="max-w-7xl mx-auto px-4"> {/* Increased max-width for full-width form */}

                {/* Header Section */}
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <Link to="/services" className="inline-flex items-center gap-1 text-gray-700 hover:text-blue-500 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Services
                    </Link>
                    <h1 className="text-2xl font-extrabold text-navy-700">
                        Site Inspection Booking
                    </h1>
                    {/* NEW: Clear Draft Button */}
                    <button
                        type="button"
                        onClick={handleRemoveDraft}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition ${
                            draftLoadedRef.current || localStorage.getItem(STORAGE_KEY)
                                ? 'text-red-600 border border-red-300 hover:bg-red-50'
                                : 'text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                        disabled={!(draftLoadedRef.current || localStorage.getItem(STORAGE_KEY))} // Disable if no draft exists
                        title="Clear all saved draft data from this browser."
                    >
                        <Trash2 size={14} /> Clear Draft
                    </button>

                </div>

                {/* Main Content Grid: NOW A SINGLE COLUMN */}
                <div className="grid lg:grid-cols-1 gap-6 items-stretch">

                    {/* Full-Width Column: The Form with Tabs */}
                    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 h-full flex flex-col">
                        {/* Service Alert/Summary (Moved to the top of the form) */}
                        <div className={`p-3 rounded-lg border mb-4 flex items-center justify-between ${currentService ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex items-start gap-3">
                                <Wrench size={20} className={currentService ? "text-blue-600" : "text-yellow-600"} />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">
                                        Inspection Type: <span className={currentService ? "text-blue-700" : "text-gray-700"}>{form.specificService}</span>
                                    </h3>
                                    {currentService && (
                                        <p className="text-xs text-gray-600">Category: {currentService.category}</p>
                                    )}
                                    {!currentService && (
                                        <p className="text-xs text-gray-600 font-medium">Note: Proceeding with a general site inspection request.</p>
                                    )}
                                </div>
                            </div>
                            {/* The "Change Service" button is correctly implemented as a "remove" button for the service link */}
                            <button
                                onClick={handleRemoveService}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition min-w-[120px]"
                            >
                                <Trash2 size={14} /> Change Service
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3 flex flex-col h-full justify-between">

                            {/* Tab Navigation & Content */}
                            <div>
                                {/* Tab Navigation */}
                                <div className="flex border-b border-gray-200 mb-4">
                                    {/* Tab 1 Button */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('contact')}
                                        className={`py-2 px-4 text-sm font-semibold transition duration-150 ease-in-out flex items-center gap-2 ${
                                            activeTab === 'contact'
                                                ? 'text-navy-700 border-b-2 border-blue-500'
                                                : 'text-gray-500 hover:text-navy-600'
                                            }`}
                                    >
                                        <ClipboardList size={18} />
                                        Contact & Schedule
                                        {tabHasError('contact') && (
                                            <span className="text-red-500 ml-1 font-bold">!</span>
                                        )}
                                    </button>
                                    {/* Tab 2 Button */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('location')}
                                        className={`py-2 px-4 text-sm font-semibold transition duration-150 ease-in-out flex items-center gap-2 ${
                                            activeTab === 'location'
                                                ? 'text-navy-700 border-b-2 border-blue-500'
                                                : 'text-gray-500 hover:text-navy-600'
                                            }`}
                                    >
                                        <Home size={18} />
                                        Location & Details
                                        {tabHasError('location') && (
                                            <span className="text-red-500 ml-1 font-bold">!</span>
                                        )}
                                    </button>
                                </div>

                                {/* Tab Content 1: Contact & Schedule */}
                                {activeTab === 'contact' && (
                                    <div className="space-y-4" ref={contactTabRef}>
                                        <div className="border border-blue-100 p-4 rounded-lg bg-blue-50/50">
                                            <h3 className="text-md font-bold text-navy-700 mb-3 border-b pb-2">Primary Contact & Service Request</h3>
                                            <div className="grid md:grid-cols-3 gap-4">

                                                <div className="md:col-span-3 mb-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Inspection Service Name</label>
                                                    <input type="text" value={form.specificService} readOnly className="w-full px-3 py-1.5 border rounded-md bg-gray-100 text-sm font-semibold" />
                                                </div>

                                                <FloatingInput label="Onsite Contact Name *" name="onsiteContact" value={form.onsiteContact} icon={User} error={errors.onsiteContact} type="text" onChange={handleChange} />
                                                <FloatingInput label="Phone Number *" name="onsitePhone" value={form.onsitePhone} icon={Phone} error={errors.onsitePhone} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} onChange={handleChange} />
                                                <FloatingInput label="Email Address *" name="email" value={form.email} icon={Mail} error={errors.email} type="email" onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="border border-blue-100 p-4 rounded-lg bg-blue-50/50">
                                            <h3 className="text-md font-bold text-navy-700 mb-3 border-b pb-2">Preferred Inspection Schedule</h3>
                                            <div className="grid md:grid-cols-2 gap-4">

                                                {/* Date Input - MODIFIED to use the FloatingInput style pattern */}
                                                <div className="relative pt-4">
                                                   <Calendar className="absolute left-3 bottom-[10px] text-gray-400" size={18} />
                                                    <label
                                                         htmlFor="date"
                                                         className={`absolute left-8 transition-all duration-200 pointer-events-none bg-white px-1 ml-[-4px]
                                                             ${form.date ? 'top-1 text-xs text-blue-600 font-medium' : 'top-[17px] text-sm text-gray-500'}
                                                           `}
                                                     >
                                                        
                                                     </label>
                                                     <input
                                                         id="date"
                                                         type="date"
                                                         name="date"
                                                         value={form.date}
                                                         onChange={handleChange}
                                                         min={today}
                                                         className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm transition-shadow focus:ring-1 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                     />
                                                    {errors.date && <p className="text-xs text-red-600 mt-0.5">{errors.date}</p>}
                                                </div>

                                                {/* Time Select - MODIFIED to use the FloatingInput style pattern */}
                                                <div className="relative pt-4">
                                                   <Clock9 className="absolute left-3 bottom-[10px] text-gray-400" size={18} />
                                                    <label
                                                         htmlFor="time"
                                                         className={`absolute left-8 transition-all duration-200 pointer-events-none bg-white px-1 ml-[-4px]
                                                             ${form.time ? 'top-1 text-xs text-blue-600 font-medium' : 'top-[17px] text-sm text-gray-500'}
                                                           `}
                                                     >
                                                        
                                                     </label>
                                                     <select
                                                         id="time"
                                                         name="time"
                                                         value={form.time}
                                                         onChange={handleChange}
                                                         className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm appearance-none transition-shadow focus:ring-1 ${errors.time ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                     >
                                                         <option value="">-- Select Time Slot --</option>
                                                         {timeSlots.map((s) => (<option key={s} value={s}>{s}</option>))}
                                                     </select>
                                                    {errors.time && <p className="text-xs text-red-600 mt-0.5">{errors.time}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-3">
                                            <button
                                                type="button"
                                                onClick={handleTabNext}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition"
                                            >
                                                Next: Location Details <ArrowLeft size={16} className="inline rotate-180 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Content 2: Location & Notes */}
                                {activeTab === 'location' && (
                                    <div className="space-y-4" ref={locationTabRef}>
                                        <div className="border border-blue-100 p-4 rounded-lg bg-blue-50/50">
                                            <h3 className="text-md font-bold text-blue-700 mb-3 border-b pb-2">Site Location & Project Details</h3>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {/* Address - MODIFIED icon position to match FloatingInput */}
                                                <div className="md:col-span-3 relative pt-4">
                                                    <MapPin className="absolute left-3 top-[32px] text-gray-400" size={16} /> {/* Adjusted for textarea height */}
                                                    <label
                                                        htmlFor="address"
                                                        className={`absolute left-8 transition-all duration-200 pointer-events-none bg-white px-1 ml-[-4px]
                                                                ${form.address ? 'top-1 text-xs text-blue-600 font-medium' : 'top-[17px] text-sm text-gray-500'}
                                                            `}
                                                    >
                                                        Site Address * (Detailed location)
                                                    </label>
                                                    <textarea
                                                        id="address"
                                                        name="address"
                                                        value={form.address}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm transition-shadow focus:ring-1 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                    />
                                                    {errors.address && <p className="text-xs text-red-600 mt-0.5">{errors.address}</p>}
                                                </div>

                                                <FloatingInput label="City/District *" name="city" value={form.city} icon={MapPin} error={errors.city} type="text" onChange={handleChange} />
                                                <FloatingInput label="Pincode *" name="pincode" value={form.pincode} icon={Home} error={errors.pincode} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} onChange={handleChange} />
                                                <div className="relative pt-4 md:col-span-1">
                                                    {/* This is a placeholder to align the grid layout, but it can be used for extra info or a Notes field. */}
                                                </div>

                                                {/* Notes/Remarks */}
                                                <div className="md:col-span-3 relative pt-4">
                                                    <ClipboardList className="absolute left-3 top-[32px] text-gray-400" size={16} /> {/* Adjusted for textarea height */}
                                                    <label
                                                        htmlFor="notes"
                                                        className={`absolute left-8 transition-all duration-200 pointer-events-none bg-white px-1 ml-[-4px]
                                                                ${form.notes ? 'top-1 text-xs text-blue-600 font-medium' : 'top-[17px] text-sm text-gray-500'}
                                                            `}
                                                    >
                                                        Additional Notes/Remarks (e.g., specific issues, gate code, nearest landmark)
                                                    </label>
                                                    <textarea
                                                        id="notes"
                                                        name="notes"
                                                        value={form.notes}
                                                        onChange={handleChange}
                                                        rows={3}
                                                        className="w-full pl-8 pr-3 py-2 border rounded-md text-sm transition-shadow focus:ring-1 border-gray-300 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('contact')}
                                                className="inline-flex items-center text-gray-600 hover:text-blue-600 text-sm font-semibold transition"
                                            >
                                                <ArrowLeft size={16} className="mr-1" /> Back to Contact & Schedule
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className={`px-8 py-2 rounded-lg font-bold text-sm shadow-xl transition flex items-center gap-2 ${
                                                    isLoading 
                                                        ? 'bg-blue-400 text-white cursor-not-allowed' 
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-t-white border-blue-200 rounded-full"></span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={18} /> Confirm Booking
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectionBooking;