import React, { useState, useEffect, useRef, useMemo  } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, ArrowLeft, ArrowRight, Star, Wrench, Trash2, Plus } from 'lucide-react';
import { BookingAPIService } from '../services/BookingAPIService'; // Assuming this service exists
import { useAuth } from '../contexts/AuthContext'; // Assuming this context exists
import Global_API_BASE from '../services/GlobalConstants';
 
// --- INTERFACE DEFINITIONS ---
interface BookingForm {
  serviceCategory: string;
  specificService: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  specialRequests: string;
}
 
interface CartItem {
  id: string;
  name: string;
  discountedPrice: number;
  originalPrice: number;
  quantity: number;
  tier: string;
  duration: string;
  rating: number;
  reviews: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
}
 
interface Service {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: string;
  duration: string;
  description: string;
  image: string;
  service_package?: string;
}
 
// --- CONSTANTS ---
const MAIN_CART_KEY = "kushiServicesCart";
const BOOKING_SESSION_KEY = "kushiBookingSession"; // Key for temporary booking items
const BOOKING_FORM_KEY = "kushiBookingFormData";

 
// --- Mini Services Data (Based on your description) ---
const MINI_SERVICES_DATA: Service[] = [
    {
        id: "mini-1",
        name: "Kitchen Chimney Cleaning",
        category: "Cleaning",
        subcategory: "Kitchen",
        price: 699,
        originalPrice: 699,
        rating: 4.5,
        reviews: "150",
        duration: "1 hr",
        description: "Professional chimney deep cleaning.",
         image: 'https://th.bing.com/th/id/OIP.od-xJrn3Q9c-JZTOHf5glQHaE8?w=231&h=180&c=7&r=0&o=7&pid=1.7&rm=3', 
  },
       
    {
        id: "mini-2",
        name: "Micro Oven Cleaning",
        category: "Cleaning",
        subcategory: "Kitchen",
        price: 199,
        originalPrice: 199,
        rating: 4.6,
        reviews: "95",
        duration: "30 min",
        description: "Thorough cleaning of your microwave oven.",
        image: 'https://thumbs.dreamstime.com/b/anti-grease-spray-hand-girl-who-cleaning-kitchen-microwave-oven-dirt-modern-antistatic-agent-334440744.jpg', 
  
        },
    {
        id: "mini-3",
        name: "Exhaust Fan Cleaning",
        category: "Cleaning",
        subcategory: "Kitchen",
        price: 299,
        originalPrice: 299,
        rating: 4.4,
        reviews: "78",
        duration: "45 min",
        description: "Deep cleaning of kitchen exhaust fan.",
         image: 'https://www.wikihow.com/images/thumb/e/e5/Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg/v4-460px-Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg', 
  
       },
    {
        id: "mini-4",
        name: "Fridge Cleaning (150-200ltr)",
        category: "Cleaning",
        subcategory: "Appliance",
        price: 399,
        originalPrice: 399,
        rating: 4.7,
        reviews: "120",
        duration: "1 hr",
        description: "Cleaning for small refrigerators.",
       image:'https://tse4.mm.bing.net/th/id/OIP.gBHvUlKTqQsxNndmeVyfpQHaHf?rs=1&pid=ImgDetMain&o=7&rm=3', 
   
        },
    {
        id: "mini-5",
        name: "Fridge Cleaning (200-500ltr)",
        category: "Cleaning",
        subcategory: "Appliance",
        price: 549,
        originalPrice: 549,
        rating: 4.7,
        reviews: "210",
        duration: "1.5 hr",
        description: "Cleaning for medium refrigerators.",
         image: 'https://images.airtasker.com/v7/https://airtasker-seo-assets-prod.s3.amazonaws.com/en_AU/1724116114503-fridge-cleaning.jpg',
 
        },
    {
        id: "mini-6",
        name: "Fridge Cleaning (500-1000ltr)",
        category: "Cleaning",
        subcategory: "Appliance",
        price: 799,
        originalPrice: 799,
        rating: 4.8,
        reviews: "85",
        duration: "2 hr",
        description: "Cleaning for large/side-by-side refrigerators.",
       image:'https://c8.alamy.com/comp/2GNEE46/the-man-cleaning-fridge-in-hygiene-concept-2GNEE46.jpg',
     },
];
 
// Helper to get items from the temporary booking session storage
const getBookingSessionItems = (): CartItem[] => {
    try {
        const stored = localStorage.getItem(BOOKING_SESSION_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error retrieving booking session:", error);
        return [];
    }
};
 
// Helper function to initialize cart state
const initializeCartState = (stateCart: CartItem[], singleService: Service | null): CartItem[] => {
    
    let initialItems: CartItem[] = getBookingSessionItems();
    
    // If receiving fresh cart items (from Cart page) AND session is empty, start with them
    if (stateCart.length > 0 && initialItems.length === 0) {
        initialItems = stateCart.map(item => ({...item, quantity: 1,
        cartItemId: item.cartItemId || Date.now().toString() + Math.random().toString().slice(2)
        }));

    }

    // Handle a single service coming from a "Book Now" click (e.g., from Details Page)
    if (singleService) {
        const newItem: CartItem = {
            cartItemId: Date.now().toString() + Math.random().toString().slice(2),
            id: singleService.id,
            name: singleService.name,
            discountedPrice: singleService.price,
            originalPrice: singleService.originalPrice || singleService.price,
            price: singleService.price,
            quantity: 1, 
            tier: singleService.service_package || "Standard",
            duration: singleService.duration || "",
            rating: singleService.rating,
            reviews: singleService.reviews,
            description: singleService.description,
            category: singleService.category,
            subcategory: singleService.subcategory,
        };

        const existingItemIndex = initialItems.findIndex(item => item.id === newItem.id);

        if (existingItemIndex === -1) {
            initialItems = [...initialItems, newItem]; 
        } 
    }
    
    localStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(initialItems));
    
    return initialItems;
};

 
 
const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Assuming useAuth provides user data
 
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
  // We read the navigation state once for initialization
  const stateCartItems: CartItem[] = location.state?.cartItems || [];
  const selectedService: Service | null = location.state?.selectedService || null;
 
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    initializeCartState(stateCartItems, selectedService)
  );
 
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [similarServices, setSimilarServices] = useState<Service[]>([]);
 
 
const filteredMiniServices = useMemo(() => {
  const cartIds = new Set(cartItems.map(ci => String(ci.id)));
  return MINI_SERVICES_DATA.filter(mini => !cartIds.has(String(mini.id)));
}, [cartItems]);
 
 
 const [popupMessage, setPopupMessage] = useState<string>("");
const [showPopup, setShowPopup] = useState<boolean>(false);




  const appliedPromo = location.state?.appliedPromo || '';
  const promoDiscount = location.state?.promoDiscount || 0;
 
  // Total calculation remains the same, but quantity will always be 1
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.price || item.discountedPrice) || 0;
    const qty = 1;
    return sum + price * qty;
  }, 0);
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + tax - promoDiscount;
 
  const [formData, setFormData] = useState<BookingForm>(() => {
  const stored = localStorage.getItem(BOOKING_FORM_KEY);
  if (stored) return JSON.parse(stored);

  return {
    serviceCategory: cartItems.length ? cartItems[0].category : selectedService?.category || '',
    specificService: cartItems.length ? cartItems.map(i => i.name).join(', ') : selectedService?.name || '',
    date: '',
    time: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    specialRequests: ''
  };
});

  const [errors, setErrors] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];
 
  // --- Lifecycle and Service Fetching ---
useEffect(() => {
  localStorage.setItem(BOOKING_FORM_KEY, JSON.stringify(formData));
}, [formData]);
useEffect(() => {
  localStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(cartItems));
}, [cartItems]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
 
  useEffect(() => {
    // 1. Fetch ALL services immediately on mount (including fetching images)
    const fetchAllServices = async () => {
      try {
        // NOTE: Replace with your actual API endpoint for all services
        const res = await fetch(Global_API_BASE + "/api/customers/all-services");
        const data = await res.json();
        const mappedServices: Service[] = data.map((item: any, index: number) => ({
          id: item.service_id?.toString() || index.toString(),
          name: item.service_name || "Unnamed Service",
          category: item.service_category || "General",
          subcategory: item.service_type || "",
          price: item.service_cost || 0,
          originalPrice: item.original_cost || item.service_cost || 0,
          rating: parseFloat(item.rating) || 4.8,
          reviews: item.rating_count ? String(item.rating_count) : "0",
          duration: item.duration || "4-6 hours",
          description: item.service_description || "",
          image: item.service_image_url
            ? item.service_image_url.startsWith("http")
              ? item.service_image_url
              : `Global_API_BASE${item.service_image_url}`
            : "/placeholder.jpg",
          service_package: item.service_package || "",
        }));
        // Combine fetched services with MINI_SERVICES_DATA for a complete list
        const combinedServices = [...mappedServices, ...MINI_SERVICES_DATA];
        setAllServices(combinedServices);
      } catch (err) {
        console.error("Error fetching services:", err);
        // Fallback to only Mini Services if fetch fails
        setAllServices(MINI_SERVICES_DATA);
      }
    };
 
    fetchAllServices();
   
    // Cleanup for timeout ref
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
}, []);
 
// --- Filtering similar services (UPDATED with 3-Tier Fallback) ---
useEffect(() => {
    if (allServices.length === 0 || cartItems.length === 0) {
        setSimilarServices([]);
        return;
    }
 
    const bookingSubcategories = Array.from(new Set(cartItems.map(item => item.subcategory).filter(s => s)));
    const bookingCategories = Array.from(new Set(cartItems.map(item => item.category).filter(c => c)));
    const cartItemIds = new Set(cartItems.map(i => i.id));
 
    // Filter out services already in the cart AND the mini-services (to prevent duplicates with the dedicated mini-section)
    const availableServices = allServices.filter(service =>
        !cartItemIds.has(service.id) && !MINI_SERVICES_DATA.some(mini => mini.id === service.id)
    );
   
    // 1. Tier 1: Find services in the Same Subcategory
    let filteredServices = availableServices
      .filter(service => bookingSubcategories.includes(service.subcategory));
 
    // 2. Tier 2 (NEW RULE): If no subcategory match, find all services in the Same Main Category (across ALL subcategories)
    if (filteredServices.length === 0) {
        filteredServices = availableServices
            .filter(service => bookingCategories.includes(service.category));
    }
 
    // 3. Tier 3: Global Fallback - If still empty, show the top 8 highest-rated services overall.
    if (filteredServices.length === 0) {
        filteredServices = availableServices
            .sort((a, b) => b.rating - a.rating)
    }
 
    // 4. Limit the final list (ensures fast loading and clean display)
    filteredServices = filteredServices.slice(0, 8);
 
    setSimilarServices(filteredServices);
 
}, [allServices, cartItems]);
// --- END: Filtering similar services (UPDATED with 3-Tier Fallback) ---
 
  useEffect(() => {
    // This ensures specificService reflects the current cart state
    setFormData(prev => ({
      ...prev,
      specificService: cartItems.length ? cartItems.map(i => i.name).join(', ') : '',
      serviceCategory: cartItems.length ? (prev.serviceCategory || cartItems[0].category) : ''
    }));
  }, [cartItems]);
 
  // --- END: Lifecycle and Service Fetching ---
 
 const handleRemoveItem = (cartItemId: string) => {
  setCartItems(currentCart => {
    const updatedCart = currentCart.filter(item => item.cartItemId !== cartItemId);

    localStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(updatedCart));

    setFormData(prev => ({
      ...prev,
      specificService: updatedCart.map(i => i.name).join(', ')
    }));

    return updatedCart;
  });
};
 
  // --- Core Logic: addSimilarServiceToCart (used for Mini Services and Similar Services) ---
  const addSimilarServiceToCart = (service: Service) => {
    if (service.service_package && service.service_package.trim().length > 0) {
      // If it has a package, navigate to details page for selection
      handleViewDetails(service);
      return;
    }
 
    setCartItems(currentCart => {

      const itemToAdd: CartItem = {

        cartItemId: Date.now().toString() + Math.random().toString().slice(2),

        id: service.id,
        name: service.name,
        discountedPrice: service.price,
        originalPrice: service.originalPrice || service.price,
        price: service.price,
        quantity: 1,
        tier: service.service_package || "Standard",
        duration: service.duration || "",
        rating: service.rating,
        reviews: service.reviews,
        description: service.description,
        category: service.category,
        subcategory: service.subcategory,
      };
 
      const existingItem = currentCart.find((item: CartItem) => item.id === itemToAdd.id);
      let updatedCart: CartItem[];
 
      if (existingItem) {
       
        return currentCart;
      } else {
        // If it's new, add it
        updatedCart = [...currentCart, itemToAdd];
       
       
      }
 
      // Update the temporary BOOKING SESSION STORAGE
      localStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(updatedCart));
     
      setFormData(prev => ({
        ...prev,
        specificService: updatedCart.map(i => i.name).join(', ')
      }));
 
      return updatedCart;
    });
  };
 
  const handleViewDetails = (service: Service) => {
    // Save the CURRENT booking session items before navigating.
    localStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(cartItems));
 
    const subcategorySlug = service.subcategory ? service.subcategory.toLowerCase().replace(/\s/g, "-") : "general";
   
    // Navigate to service details.
    navigate(`/services/${subcategorySlug}`, {
      state: { services: [service], openDirectly: true },
    });
  };
 
  const validateForm = () => {
    const newErrors: any = {};
    if (cartItems.length === 0) newErrors.cart = 'Please add a service to book.';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
 
   const fullName = formData.name.trim();

if (!fullName) {
  newErrors.name = "Full name is required";
} else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
  newErrors.name = "Name must contain only letters and spaces";
}
 
   const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;

  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!emailPattern.test(formData.email.trim())) {
    newErrors.email = "Enter a valid email address";
  }
 
   const digits = formData.phone.replace(/\D/g, "");
  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(digits)) {
    newErrors.phone = "Phone number must be exactly 10 digits";
  }

 
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
 
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
 
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  // 🚫 NEW RULE: Only allow bookings above 1500
  if (totalAmount <= 1500) {
    setPopupMessage("Minimum booking amount should be more than ₹1500 to proceed.");
    setShowPopup(true);
    setIsLoading(false);
    return;
  }

  if (cartItems.length === 0) {
    setPopupMessage("Please add at least one service to your booking.");
    setShowPopup(true);
    return;
  }

  setIsLoading(true);

  try {
    const bookingData = {
      customerId: user?.id || null,
      customerName: formData.name,
      customerEmail: formData.email,
      customerNumber: formData.phone,
      addressLine1: formData.address,
      addressLine2: '',
      addressLine3: '',
      city: formData.city,
      zipCode: formData.pincode,
      bookingAmount: subtotal,
      totalAmount: totalAmount,
      bookingDate: toISODateTime(formData.date, formData.time),
      bookingServiceName:
        formData.specificService ||
        (cartItems.length ? cartItems.map(i => i.name).join(', ') : ''),
      bookingStatus: "Pending",
      bookingTime: formData.time,
      confirmationDate: "",
      createdBy: "Customer",
      createdDate: "",
      paymentMethod: "",
      paymentStatus: "Unpaid",
      referenceDetails: "",
      referenceName: "",
      remarks: formData.specialRequests,
      updatedBy: "",
      updatedDate: "",
      workerAssign: "",
      visitList: "",
      service_id: cartItems.length ? Number(cartItems[0].id) : null,
      user: null
    };

    setIsLoading(false);

    navigate("/payment", {
      state: {
        bookingData,
        cartItems,
        totalAmount,
        subtotal,
        tax,
        appliedPromo,
        promoDiscount
      }
    });

  } catch (err) {
    console.error("Booking submission error:", err);
    setIsLoading(false);

    setPopupMessage("Failed to proceed. Please try again.");
    setShowPopup(true);
  }
};



 
  const getAvailableTimeSlots = () => {
    if (!formData.date) return timeSlots;
    const selected = new Date(formData.date);
    const now = new Date();
    const isToday =
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate();
    if (!isToday) return timeSlots;
 
    const ch = now.getHours(), cm = now.getMinutes();
    return timeSlots.filter(slot => {
      const [time, period] = slot.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const slotHour = h + (m / 60);
      const currentHour = ch + (cm / 60);
      // Only show slots that are at least 30 minutes in the future
      return slotHour > currentHour + 0.5;
    });
  };
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((p: any) => ({ ...p, [name]: '' }));
  };
 
  const today = new Date().toISOString().split('T')[0];
  const toISODateTime = (dateStr: string, slot: string) => {
    if (!dateStr || !slot) return null;
    const [t, period] = slot.split(' ');
    let [h, m] = t.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${dateStr}T${hh}:${mm}:00`;
  };
 
 
 
  if (isSubmitted) {
    return (
      <div className="bg-white py-2 w-full flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white rounded-3xl p-12 shadow-2xl border-4 border-green-200">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-navy-900 mb-4">Booking Placing</h1>
          <p className="text-xl text-navy-600 mb-8">
            Your booking has been initiated. You will be redirected to the payment page shortly.
          </p>
          <p className="text-sm text-gray-500">
            If redirection fails, click the button below.
          </p>
          <Link
            to="/payment"
            state={{ /* State passed to payment */ }}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 transition"
          >
            Go to Payment
          </Link>
        </div>
      </div>
    );
  }
 
 
return (
  <div className="bg-white py-2 w-full">
    <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
 
      {/* --- HEADER --- */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Book Your{" "}
          <span className="bg-gradient-to-r from-peach-600 to-navy-900 bg-clip-text text-transparent">
            Service
          </span>
        </h1>
      </div>
 
     {/* --- FLEX LAYOUT (EQUAL WIDTH + HEIGHT) --- */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4 w-full">

        {/* --- BOOKING FORM CARD --- */}
        <div className="flex-1 bg-white rounded-2xl shadow-md border border-peach-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-4 py-1">
            <p className="text-peach-100 text-base">
              Fill in your details to confirm your booking.
            </p>
          </div>
 
           <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-3">

            
            {/* Selected Services */}
            {cartItems.length > 0 && (
              <div className="bg-peach-50 rounded-xl p-1 border border-peach-200">
                <h4 className="font-semibold text-navy-800 mb-2 text-base">
                  Selected Services
                </h4>
                {cartItems.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-white p-1.5 rounded-md border border-peach-200 mb-1"
                  >
                    <div>
                      <p className="font-medium text-navy-800 text-base">{item.name}</p>
                      <div className="flex items-center text-[14px] gap-1">
                        <Star size={10} className="text-yellow-400" />
                        <span>{item.rating}</span>
                        <span className="text-gray-500">({item.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-peach-600 font-semibold text-base">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="text-red-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Date & Time */}
            <div className="flex justify-between gap-3">
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Time *</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                >
                  <option value="">Select</option>
                  {getAvailableTimeSlots().map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
              </div>             
            </div>

            {/* Name & Phone */}
            <div className="flex justify-between gap-3">
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                 {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>

            {/* Email & Address */}
            <div className="flex justify-between gap-3">
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Email Address*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Address *</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                 {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
            </div>

            {/* City, Pincode, State */}
            <div className="flex justify-between gap-3">
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-base font-semibold text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
              </div>
              
            </div>

            {/* Special Request & Confirm */}
            <div className="flex justify-between items-end gap-3">
              <div className="flex flex-col flex-1">
                <label className="text-base font-semibold text-gray-700 mb-1">Special Requests</label>
                <textarea
                  name="specialRequests"
                  rows={2}
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-base focus:ring-1 focus:ring-peach-400"
                />
              </div>
 
              <button
                type="submit"
                disabled={isLoading || cartItems.length === 0}
                className="w-[200px] bg-gradient-to-r from-navy-700 to-peach-300 text-black py-2.5 rounded-md text-xs font-semibold hover:from-peach-300 hover:to-navy-700 transition-all shadow-sm"
              >
                {isLoading
                  ? "Processing..."
                  : `Confirm Booking (₹${totalAmount.toLocaleString("en-IN")})`}
              </button>
            </div>
          </form>
        </div>

        {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-2xl shadow-xl w-80 text-center border border-peach-300">
      <p className="text-gray-800 font-medium mb-4">{popupMessage}</p>

      <button
        onClick={() => setShowPopup(false)}
        className="px-4 py-2 bg-peach-500 text-white rounded-lg hover:bg-peach-600 transition"
      >
        OK
      </button>
    </div>
  </div>
)}

 
       {/* --- BOOKING SUMMARY (No “Selected Services” Heading, Matches Booking Form Height) --- */}
<div className="flex-1 bg-white rounded-2xl shadow-md border border-peach-200 overflow-hidden flex flex-col">
  {/* Gradient Header (same as form) */}
  <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-4 py-1">
    <p className="text-peach-100 text-base">Booking Summery</p>
  </div>

  {/* Body */}
  <div className="flex-1 p-2 flex flex-col justify-between">

    {/* Services List (no “Selected Services” title) */}
    <div className="bg-peach-50 rounded-xl p-1 border border-peach-200 mb-3 flex-1">
      {/* Show heading ONLY if items exist */}
  {cartItems.length > 0 && (
    <h3 className="font-semibold text-navy-800 mb-2 text-base">
      Selected Services
    </h3>
  )}
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-1">No services selected yet.</p>
      ) : (
        cartItems.map((item: CartItem) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white p-2 rounded-md border border-peach-200 mb-2"
          >
            <div className="flex-1 pr-2">
              <p className="text-[16px] font-semibold text-navy-800 leading-tight">{item.name}</p>
              <div className="flex items-center text-[14px] text-yellow-600 mt-[2px]">
                <Star size={12} className="fill-yellow-400 mr-1" /> {item.rating} ({item.reviews})
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[16px] font-bold text-peach-700">₹{item.price.toLocaleString("en-IN")}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.cartItemId)}
                className="text-red-500 hover:text-red-600 transition"
                title="Remove service"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Booking Info */}
    <div className="bg-peach-50 border border-peach-200 rounded-lg p-3 mb-3 text-[16px] text-gray-800 space-y-1">
      <div className="flex justify-between">
        <span className="font-medium">Date:</span>
        <span>{formData.date || "—"}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Time:</span>
        <span>{formData.time || "—"}</span>
      </div>
    </div>

    {/* Totals Section */}
    <div className="bg-white border border-peach-200 rounded-xl p-3 mb-3 shadow-inner text-base font-medium text-gray-800 space-y-[3px]">
      <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
      <div className="flex justify-between text-green-700"><span>Discount</span><span>-₹{promoDiscount.toLocaleString("en-IN")}</span></div>
      <div className="flex justify-between"><span>GST (18%)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
      <div className="flex justify-between font-semibold border-t border-gray-300 pt-2 text-lg text-navy-900">
        <span>Total</span>
        <span className="text-peach-600 font-extrabold">₹{totalAmount.toLocaleString("en-IN")}</span>
      </div>
    </div>

    {/* Trust Icons */}
    <div className="border-t border-peach-200 pt-2 grid grid-cols-2 gap-y-2 text-[15px] text-gray-700">
      <div className="flex items-center gap-1"><CheckCircle size={13} className="text-green-600" /> Secure Booking</div>
      <div className="flex items-center gap-1"><Star size={13} className="text-yellow-500" /> 4.9★ Rated</div>
      <div className="flex items-center gap-1"><Phone size={13} className="text-peach-600" /> 24/7 Support</div>
      <div className="flex items-center gap-1"><Wrench size={13} className="text-blue-600" /> Trained Staff</div>
                  </div>
                    </div>
                </div>
              </div>
           </div>
 
 
 
    {/* --- MINI SERVICES SECTION (shows only remaining mini services not in cart) --- */}
   {/* --- MINI SERVICES SECTION (Updated to New Card Design) --- */}
{cartItems.length > 0 && filteredMiniServices.length > 0 && (
  <div className="mt-2 mb-8 w-full">
 
    <style>{`
      @keyframes marquee-mini-smooth {
        0% { transform: translateX(0); }
        100% { transform: translateX(-66.666%); }
      }
      .mini-marquee-track {
        animation: marquee-mini-smooth 40s linear infinite;
        will-change: transform;
      }
      .mini-marquee-container:hover .mini-marquee-track {
        animation-play-state: paused;
      }
    `}</style>
 
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-navy-900 text-center">
        <span className="text-peach-500">Mini Services</span>
      </h2>
    </div>
 
    {/* Sliding Container */}
    <div className="mini-marquee-container flex overflow-hidden relative py-1">
      <div className="flex mini-marquee-track" style={{ width: "300%" }}>
       
        {[...filteredMiniServices, ...filteredMiniServices, ...filteredMiniServices].map(
          (service, index) => (
            <div
              key={`${service.id}-${index}`}
              className="flex-shrink-0 w-60 sm:w-72 mx-3 cursor-pointer"
            >
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-3
                              hover:shadow-xl transition-all duration-300 flex flex-col">
 
                {/* Image */}
                <div className="relative h-28 w-full overflow-hidden rounded-lg mb-2">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
 
                {/* Service Name */}
                <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-snug truncate">
                  {service.name}
                </h3>
 
                {/* Price Left + Add Right */}
                <div className="flex items-center justify-between">
                 
                  <div className="text-xl font-bold text-peach-600">
                    ₹{service.price.toLocaleString("en-IN")}
                  </div>
 
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addSimilarServiceToCart(service);
                    }}
                    className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1
                               rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus size={14} /> Book Now
                  </button>
 
                </div>
              </div>
            </div>
          )
        )}
 
      </div>
    </div>
  </div>
)}
{/* --- END MINI SERVICES SECTION --- */}
 
 
   
    {/* Similar Services */}
    {similarServices.length > 0 && (
        <div className="mt-2 w-full">
            <style>{`
                @keyframes marquee-seamless {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); } /* Changed to 50% for 2x clone if items > 4 */
                }
                .animate-marquee-seamless {
                    animation: marquee-seamless 30s linear infinite;
                    will-change: transform;
                }
                  .marquee-container:hover .animate-marquee-seamless {
                      animation-play-state: paused;
                  }
 
            `}</style>
 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h4 className="text-2xl font-bold mb-6 text-navy-900 text-center">
                    You Might Also Like 
                </h4>
            </div>
 
            <div className="marquee-container flex overflow-hidden relative py-1">
                <div
                    className="flex animate-marquee-seamless hover:pause"
                    // Keep 300% for the original similar services section for a smooth look
                    style={{ width: '300%' }}
                >
                    {[...similarServices, ...similarServices, ...similarServices].map(
                        (service, index) => (
                            <div
                                key={`${service.id}-${index}`}
                                className="flex-shrink-0 w-60 sm:w-72 mx-3 cursor-pointer"
                            >
                                <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl">
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-28 object-cover rounded-lg mb-2"
                                        onClick={() => handleViewDetails(service)}
                                    />
 
                                    <div className="p-4">
                                        <h3
                                            className="text-lg font-bold text-gray-800 mb-1 truncate hover:text-peach-600 transition-colors"
                                            onClick={() => handleViewDetails(service)}
                                        >
                                            {service.name}
                                        </h3>
 
                                        <div className="flex justify-between items-center mt-0">
                                            {/* Reviews/Rating Section (Left side) */}
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                                                <span>
                                                    {service.rating} ({service.reviews} reviews)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addSimilarServiceToCart(service);
                                                }}
                                                className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )}
    {/* --- END SIMILAR SERVICES --- */}
 
    {/*  OTHER SERVICES  */}
{(() => {
 
  if (allServices.length === 0 || cartItems.length === 0) return null;
 
  const cartCategories = new Set(cartItems.map(ci => ci.category));
  const cartIds = new Set(cartItems.map(ci => ci.id));
 
  // Other Services = services NOT matching cart category AND not in cart
  const otherServices = allServices.filter(
    s => !cartCategories.has(s.category) && !cartIds.has(s.id)
  );
 
  if (otherServices.length === 0) return null;
 
  const limitedList = otherServices.slice(0, 20); // safety limit
 
  return (
    <div className="mt-2 w-full">
     
      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h4 className="text-2xl font-bold mb-6 text-navy-900 text-center">
          Other Services
        </h4>
      </div>
 
      {/* Sliding CSS */}
      <style>{`
        @keyframes other-services-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .other-services-track {
          animation: other-services-slide 35s linear infinite;
          will-change: transform;
        }
        .other-services-container:hover .other-services-track {
          animation-play-state: paused;
        }
      `}</style>
 
      {/* Sliding Container */}
      <div className="other-services-container overflow-hidden py-1">
        <div className="flex other-services-track" style={{ width: "220%" }}>
 
          {[...limitedList, ...limitedList].map((service, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-60 sm:w-72 mx-3 bg-white rounded-xl shadow-md
                         border border-gray-200 p-3 cursor-pointer hover:shadow-xl
                         transition-all duration-300"
            >
             
              {/* Image */}
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-28 object-cover rounded-lg mb-2"
              />
 
              {/* Title */}
              <h3 className="text-sm font-bold text-gray-800 truncate mb-1">
                {service.name}
              </h3>
 
             {/* Rating + Add button on same line */}
                <div className="flex items-center justify-between mb-1">
              {/* Rating */}
              <div className="flex items-center text-[13px] text-gray-600">
                <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                <span>{service.rating} ({service.reviews})</span>
              </div>
 
              {/* Add button */}
              <button
                type="button"
                onClick={() => {
                   if (service.category === "Commercial Cleaning Services" || service.category === "Industrial Cleaning Services") {
                      navigate("/inspection-booking", { state: { selectedService: service } });
                         return;
                   }
                 addSimilarServiceToCart(service);
              }}
 
                className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1
               rounded-full hover:bg-green-600 transition"
              >
                <Plus size={14} /> Book Now
              </button>
             </div>
            </div>
          ))}
        </div>
      </div>
 
    </div>
  );
})()}
{/*  END OTHER SERVICES SECTION  */}
 
 

    
           
         
          <div className="mt-2 flex items-center justify-center">
           
            <Link
              to="/cart"
               onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2
                bg-peach-300 text-black-700
                px-4 py-2 rounded-xl font-bold
                hover:bg-gradient-to-r from-peach-300 to-navy-700 transition-all shadow-lg"
            >
              <ArrowLeft size={18} />
              Back to Cart
            </Link>
 
            {/* Browse Services: Secondary, Outline Navy Button */}
            <Link
              to="/services"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2
                bg-peach-300 text-black-700
                px-4 py-2 rounded-xl font-bold
                hover:bg-gradient-to-r from-navy-700 to-peach-300 hover:border-navy-300 transition-all
                ml-4 shadow-md"
            >
              Browse Services
 
               <ArrowRight size={18} />
            </Link>
          </div>
           
  </div>
);
};
 
export default Booking;
 