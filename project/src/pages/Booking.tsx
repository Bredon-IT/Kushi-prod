import React, { useState, useEffect, useRef, useMemo  } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, ArrowLeft, Star, Wrench, Trash2, Plus } from 'lucide-react';
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
        initialItems = stateCart.map(item => ({...item, quantity: 1}));
    }

    // Handle a single service coming from a "Book Now" click (e.g., from Details Page)
    if (singleService) {
        const newItem: CartItem = {
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

  const [formData, setFormData] = useState<BookingForm>({
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

  const handleRemoveItem = (id: string) => {
    setCartItems(currentCart => {
      const updatedCart = currentCart.filter(item => item.id !== id);
      
      // Update the temporary booking session storage
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
        // If the item already exists, do nothing and show alert
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
          alert(`${service.name} is already in your booking list.`);
        }, 50);
        return currentCart; 
      } else {
        // If it's new, add it
        updatedCart = [...currentCart, itemToAdd];
        
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
          alert(`${service.name} added to booking!`);
        }, 50);
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
      newErrors.name = 'Name is required';
    } else {
      // Basic validation: must start with a letter and contain only letters and spaces
      if (!/^[A-Z][a-zA-Z\s]*$/.test(fullName)) {
        newErrors.name = 'Name should start with a capital letter and only contain letters/spaces.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-z0-9]+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid. It should start with a lowercase letter or number.';
    }

    const phone = formData.phone.trim();
    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!(digitsOnly.length === 10)) { // Simplified to strictly 10 digits
      newErrors.phone = 'Enter a valid 10-digit phone number.';
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
    if (cartItems.length === 0) {
      alert("Please add at least one service to your booking.");
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
          formData.specificService || (cartItems.length ? cartItems.map(i => i.name).join(', ') : ''),
        bookingStatus: "Pending",
        bookingTime: formData.time,
        confirmationDate: "",
        createdBy: "Customer",
        createdDate: "",
        paymentStatus: "Unpaid",
        referenceDetails: "",
        referenceName: "",
        remarks: formData.specialRequests,
        updatedBy: "",
        updatedDate: "",
        workerAssign: "",
        visitList: "",
        service_id: cartItems.length ? Number(cartItems[0].id) : null,
        user: null // Placeholder for backend data structure
      };

      
      setIsSubmitted(true); 
      
      // Perform navigation after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate('/payment', { 
            state: { bookingData, cartItems, totalAmount, subtotal, tax, appliedPromo, promoDiscount }, 
            replace: true 
        });
        
        // Clear temporary booking session storage
        localStorage.removeItem(BOOKING_SESSION_KEY);
        setCartItems([]);
      }, 1000); 
      
    } catch (err) {
      console.error("Booking submission error:", err);
      setIsLoading(false);
      alert("Failed to submit booking. Please check console for details.");
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
      <div className="bg-pink-50 min-h-screen py-28 w-full flex items-center justify-center">
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
  <div className="bg-white py-2">
    <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Book Your <span className="bg-gradient-to-r from-peach-600 to-navy-900 bg-clip-text text-transparent">Service</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Schedule your professional cleaning service with our expert team.
          Choose your preferred date, time, and service type.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-peach-200 overflow-hidden">
            <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Service Booking Form</h2>
              <p className="text-peach-100">Fill in the details below to schedule your service</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {cartItems.length > 0 && (
                <div className="bg-gradient-to-r from-peach-50 to-navy-50 rounded-xl p-6 border border-peach-200">
                  <h3 className="font-bold text-navy-800 mb-4">Selected Services</h3>
                  <div className="space-y-3">
                    {cartItems.map((item: CartItem, index: number) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-peach-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-navy-500">{item.duration}</span>
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500 fill-current" />
                              <span className="text-xs font-bold text-navy-700">{item.rating}</span>
                              <span className="text-xs text-navy-500">({item.reviews})</span>
                            </div>
                          </div>
                          <h4 className="font-medium text-navy-800">{item.name}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleRemoveItem(item.id); }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📅 Date & Time Row (2 Columns) */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Preferred Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={today}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
                {/* Preferred Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a time slot</option>
                      {getAvailableTimeSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                </div>
              </div>

              {/* 🧑 Contact Info Row (3 Columns) */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="98765 43210 (10 digits)"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* 📍 Address Info Row (3 Columns: Address, City, Pincode) */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Address (Takes 2/3 space on md/lg) */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter complete address where service is required"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                {/* City & Pincode (Remains 1/3 space on md/lg, stacked on mobile) */}
                <div className="md:col-span-1 grid grid-cols-1 gap-6">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mumbai"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                  {/* Pincode */}
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="400001"
                    />
                    {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
                  </div>
                </div>
              </div>


              {/* 📝 Special Requests & Submit Button Section (New Layout) */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Special Requests (Left Column) */}
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Any specific requirements, areas of focus, or additional information..."
                  />
                </div>
                
                {/* Confirm Booking Button (Right Column) */}
                <div className="flex flex-col justify-end">
                    {errors.cart && <p className="text-center mt-4 text-lg font-bold text-red-600">{errors.cart}</p>}
                    <button
                        type="submit"
                        disabled={isLoading || cartItems.length === 0}
                        className="w-full bg-gradient-to-r from-navy-700 to-peach-300 text-black py-4 px-8 rounded-xl text-lg font-semibold hover:from-peach-300 hover:to-navy-700 transition-all shadow-xl  disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Processing Booking...
                            </>
                        ) : (
                            <>
                                <Calendar size={20} />
                                Confirm Booking (₹{totalAmount.toLocaleString('en-IN')})
                            </>
                        )}
                    </button>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        You'll be redirected to secure payment after confirming booking details
                    </p>
                </div>
              </div>

            </form>
          </div>
          
          {/* 👇 NEW LOCATION FOR BACK/BROWSE BUTTONS */}
          <div className="mt-12 flex items-center justify-center">
            {/* Back to Cart: Primary, Solid Peach Button */}
            <Link
              to="/cart"
              className="inline-flex items-center gap-2
                bg-peach-300 text-navy-700
                px-6 py-3 rounded-xl font-semibold
                hover:bg-peach-400 transition-all shadow-lg"
            >
              <ArrowLeft size={20} />
              Back to Cart
            </Link>

            {/* Browse Services: Secondary, Outline Navy Button */}
            <Link
              to="/services"
              className="inline-flex items-center gap-2
                bg-peach-300 text-navy-700
                px-6 py-3 rounded-xl font-semibold
                hover:bg-peach-400 hover:border-navy-300 transition-all
                ml-4 shadow-md"
            >
              <Wrench size={20} />
              Browse Services
            </Link>
          </div>
          
        </div>
        
        {/* Booking Summary Column (remains the same) */}
        {/* ... (Summary Code here) ... */}
        {cartItems.length > 0 && (
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-peach-200 sticky top-24">
                    <h3 className="text-xl font-bold text-navy-900 mb-6">Booking Summary</h3>
                    <div className="space-y-4 mb-6">
                        {cartItems.map((item: CartItem, index: number) => (
                            <div key={item.id} className="flex justify-between items-start p-3 bg-peach-50 rounded-lg border border-peach-200">
                                <div className="flex-1">
                                    <h4 className="font-medium text-navy-800 text-sm">{item.name}</h4>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); handleRemoveItem(item.id); }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label={`Remove ${item.name}`}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="border-t-2 border-peach-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-navy-700">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-₹{(promoDiscount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-navy-700">
                            <span>GST (18%):</span>
                            <span>₹{tax.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-navy-900 border-t pt-2">
                            <span>Total Services:</span>
                            <span>{cartItems.length}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total Payable:</span>
                            <span className="text-peach-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        {appliedPromo && (
                            <div className="text-sm text-green-600 mt-2">
                                Promo "{appliedPromo}" applied ✓
                            </div>
                        )}
                    </div>
                    <div className="mt-6 space-y-3 pt-6 border-t border-peach-200">
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                            <CheckCircle size={16} className="text-green-600" />
                            <span>100% Secure Booking</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                            <Star size={16} className="text-yellow-500" />
                            <span>4.9★ Rated Service</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                            <Phone size={16} className="text-peach-600" />
                            <span>24/7 Customer Support</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {cartItems.length === 0 && (
            <div className="lg:col-span-3 text-center py-10">
                <p className="text-xl text-gray-500 mb-4">Your cart is empty. Please select a service to continue.</p>
               
            </div>
        )}
      </div>
    </div>


    {/* --- MINI SERVICES SECTION (shows only remaining mini services not in cart) --- */}
    {/* ... (Mini Services Code here) ... */}
    {cartItems.length > 0 && filteredMiniServices.length > 0 && (
        <div className="my-16 w-full px-4 sm:px-6 lg:px-8">
            <style>{`
                /* Define the seamless marquee animation for mini services */
                @keyframes marquee-seamless-mini {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-seamless-mini {
                    animation: marquee-seamless-mini 20s linear infinite; /* Faster than similar services */
                    will-change: transform;
                }
                /* Pause the animation on hover */
                .hover-pause:hover .animate-marquee-seamless-mini {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="max-w-7xl mx-auto">
                <h4 className="text-2xl font-bold mb-6 text-navy-900 text-center">
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Mini Services
                    </span>
                </h4>
            </div>

            <div className="overflow-hidden relative py-4 hover-pause">
                <div
                    className="flex animate-marquee-seamless-mini"
                    style={{ width: '200%' }}
                >
                    {/* clone the filtered list so marquee is seamless */}
                    {[...filteredMiniServices, ...filteredMiniServices].map((service, index) => (
                        <div key={`${service.id}-${index}`} className="flex-shrink-0 w-64 mx-3">
                            <div className="bg-white rounded-2xl shadow-md overflow-hidden w-56 hover:scale-105 hover:shadow-xl transition-transform duration-300">
                                {/* --- IMAGE --- */}
                                <img
                                    src={service.image || 'https://via.placeholder.com/150'}
                                    alt={service.name}
                                    className="w-full h-32 object-cover"
                                />

                                {/* --- CONTENT --- */}
                                <div className="p-3">
                                    <h5 className="text-gray-800 text-sm font-semibold mb-1 truncate">
                                        {service.name}
                                    </h5>

                                    <div className="flex justify-between items-center">
                                        <span className="text-orange-600 font-bold text-lg">
                                            ₹{service.price.toLocaleString('en-IN')}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addSimilarServiceToCart(service);
                                            }}
                                            className="bg-green-500 text-white text-xs font-medium rounded-md px-3 py-1 flex items-center gap-1 hover:bg-green-600 transition"
                                        >
                                            <Plus size={14} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )}
    {/* --- END: MINI SERVICES SECTION --- */}

    {/* --- SIMILAR SERVICES CAROUSEL (CONDITIONAL RENDERING IS ALREADY CORRECT) --- */}
    {/* ... (Similar Services Code here) ... */}
    {similarServices.length > 0 && (
        <div className="mt-16 mb-10 w-full">
            <style>{`
                @keyframes marquee-seamless {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); } /* Changed to 50% for 2x clone if items > 4 */
                }
                .animate-marquee-seamless {
                    animation: marquee-seamless 30s linear infinite;
                    will-change: transform;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h4 className="text-2xl font-bold mb-6 text-navy-900 text-center">
                    You Might Also Like (Matching Services)
                </h4>
            </div>

            <div className="flex overflow-hidden relative py-4">
                <div
                    className="flex animate-marquee-seamless hover:pause"
                    // Keep 300% for the original similar services section for a smooth look
                    style={{ width: '300%' }}
                >
                    {[...similarServices, ...similarServices, ...similarServices].map(
                        (service, index) => (
                            <div
                                key={`${service.id}-${index}`}
                                className="flex-shrink-0 w-80 sm:w-96 mx-3 cursor-pointer"
                            >
                                <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl">
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-40 object-cover"
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


  </div>
);
};

export default Booking;