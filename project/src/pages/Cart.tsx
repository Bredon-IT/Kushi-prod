// ...existing code...
import React, { useEffect, useState , useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2,  ChevronLeft, ChevronRight,ShoppingCart, ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import Global_API_BASE from '../services/GlobalConstants';

// --- INTERFACE DEFINITIONS ---
interface CartItem {
  cartItemId: string;
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: string;
  description: string;
  category: string;
  subcategory: string;
  tier: string;
  quantity: number;
  duration: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  rating: number;
  reviews: string;
  duration: string;
  description: string;
  image: string;
  service_package?: string;
}

// --- MOCK DATA FOR MINI SERVICES ---
const mockMiniServices = [
  {
    id: "mini-1",
    name: "Kitchen Chimney Cleaning",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 699,
    rating: 4.7,
    reviews: "120",
    duration: "1-2 hours",
    description: 'With our skilled kitchen chimney cleaning services, you can restore suction power and get rid of grease buildup. To guarantee smoke-free cooking and better kitchen hygiene, we thoroughly clean filters, ducts, and hoods using non-toxic, safe techniques. Our service, which is trusted by residences and dining establishments, keeps your kitchen fresh and your chimney operating efficiently.',
    image: "https://th.bing.com/th/id/OIP.od-xJrn3Q9c-JZTOHf5glQHaE8?w=231&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
  },
  {
    id: "mini-2",
    name: "Micro Oven Cleaning",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 199,
    rating: 4.6,
    reviews: "85",
    duration: "30 mins",
    description: 'Use our expert microwave oven cleaning services to guarantee hygienic and safe cooking. We use non-toxic, food-safe products to remove food stains, grease, and smells from all interior surfaces. Our service, which is perfect for both residential and commercial kitchens, restores the cleanliness and functionality of your microwave in a single visit.',
    image: "https://thumbs.dreamstime.com/b/anti-grease-spray-hand-girl-who-cleaning-kitchen-microwave-oven-dirt-modern-antistatic-agent-334440744.jpg",
  },
  {
    id: "mini-3",
    name: "Exhaust Fan Cleaning",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 299,
    rating: 4.5,
    reviews: "60",
    duration: "45 mins",
    description: 'Use our professional exhaust fan cleaning services to maintain fresh, clean air in your kitchen or bathroom. To restore ideal airflow and lower the risk of a fire, we remove grease, dust, and grime accumulation. Our skilled experts make sure your exhaust fan operates smoothly and effectively by using safe, efficient techniques.',
    image: "https://www.wikihow.com/images/thumb/e/e5/Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg/v4-460px-Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg",
  },
  {
    id: "mini-4",
    name: "Fridge Cleaning (150-200ltr)",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 399,
    rating: 4.8,
    reviews: "150",
    duration: "1 hour",
    description: 'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image: "https://tse4.mm.bing.net/th/id/OIP.gBHvUlKTqQsxNndmeVyfpQHaHf?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "mini-5",
    name: "Fridge Cleaning (200-500ltr)",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 549,
    rating: 4.8,
    reviews: "150",
    duration: "1.5 hours",
    description: 'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image: "https://images.airtasker.com/v7/https://airtasker-seo-assets-prod.s3.amazonaws.com/en_AU/1724116114503-fridge-cleaning.jpg",
  },
  {
    id: "mini-6",
    name: "Fridge Cleaning (500-1000ltr)",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 799,
    rating: 4.8,
    reviews: "150",
    duration: "2 hours",
    description: 'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image: "https://c8.alamy.com/comp/2GNEE46/the-man-cleaning-fridge-in-hygiene-concept-2GNEE46.jpg",
  },
];




// --- LOCAL STORAGE HELPERS ---
const getCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('kushiServicesCart');
    return savedCart
      ? JSON.parse(savedCart).map((item: any) => ({
        ...item,
        cartItemId: item.cartItemId || Date.now().toString() + Math.random().toString().slice(2)
      }))
      : [];

  } catch {
    return [];
  }
};




const hasMultiplePackages = (service: Service) => {
  if (!service.service_package) return false;
  return service.service_package.split(";").length > 1;
};


const saveCartToStorage = (cart: CartItem[]) => {
  const serializableCart = cart.map(item => ({
    cartItemId: item.cartItemId,
    id: item.id,
    name: item.name,
    price: item.price,
    rating: item.rating,
    reviews: item.reviews,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    tier: item.tier,
    quantity: item.quantity,
    duration: item.duration,
  }));
  localStorage.setItem('kushiServicesCart', JSON.stringify(serializableCart));
};

// --- CART COMPONENT ---
const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(getCartFromStorage);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const miniRef = useRef<HTMLDivElement>(null);
const similarRef = useRef<HTMLDivElement>(null);
const otherRef = useRef<HTMLDivElement>(null);


  // Read More / Read Less state per cart item
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  // Fetch all services (include service_package)
  useEffect(() => {
    fetch(Global_API_BASE + "/api/customers/all-services")
      .then(res => res.json())
      .then(data => {
        const mapped: Service[] = data.map((item: any, index: number) => ({
          id: item.service_id?.toString() || index.toString(),
          name: item.service_name || "Unnamed Service",
          category: item.service_category || "General",
          subcategory: item.service_type || "",
          price: item.service_cost || 0,
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
        setAllServices(mapped);
        console.log("Mini Services Count:",
          data.filter((d: any) => d.service_name?.toLowerCase() === "mini services").length
        );

      })
      .catch(err => console.error("Error fetching all services:", err));
  }, []);


  const removeItem = (cartItemId: string) => {
    const newCart = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  // Add directly to cart (kept for other uses)
  const addSimilarServiceToCart = (service: Service) => {
    const existingItem = cart.find(ci => ci.id === service.id);
    const serviceAsCartItem: CartItem = {
      cartItemId: Date.now().toString() + Math.random().toString().slice(2),
      id: service.id,
      name: service.name,
      price: service.price,
      rating: service.rating,
      reviews: service.reviews,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory,
      tier: '',
      quantity: 1,
      duration: service.duration,
    };


    const isMiniService = service.id.startsWith('mini-');

    if (service.service_package && !isMiniService) {
      // Navigate to service details if there are packages AND it's a regular service
      handleViewDetails(service);
    } else {
      // Add to cart if no packages OR if it is a mini-service (direct add for quick use)
      const updatedCart = existingItem
        ? cart.map(ci => ci.id === service.id ? { ...ci, quantity: ci.quantity + 1 } : ci)
        : [...cart, serviceAsCartItem];
      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    }
  };

  const handleProceedToBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking', {
        state: {
          cartItems: cart,
          totalAmount: total,
          subtotal: subtotal,
          tax: tax
        }
      });
    }, 1500);
  };

  // Navigate to Service Details and pass full service (including packages) so ServiceDetails can show packages
  const handleViewDetails = (service: Service) => {
    const slug = (service.subcategory && service.subcategory.trim().length > 0)
      ? service.subcategory.toLowerCase().replace(/\s/g, "-")
      : "general";
    navigate(`/services/${slug}`, { state: { services: [service], openDirectly: true, } });
  };

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const totalServiceCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubcategories = Array.from(new Set(cart.map(item => item.subcategory)));
  const cartCategories = Array.from(new Set(cart.map(item => item.category)));

  // 1. Attempt 1: Filter for Same Subcategory
  let similarServices = allServices
    .filter(service =>
      cartSubcategories.includes(service.subcategory) &&
      !cart.some(item => item.id === service.id)
    );

  // 2. Fallback 1: If no same-subcategory services, find Same Main Category services
  if (similarServices.length === 0) {
    similarServices = allServices
      .filter(service =>
        // Check if the service's main category is in the cart's main categories
        cartCategories.includes(service.category) &&
        // Exclude services already in the cart
        !cart.some(item => item.id === service.id)
      );
  }

  // 3. Fallback 2: If still empty, show the top 5 highest-rated services overall.
  if (similarServices.length === 0) {
    similarServices = allServices
      // Exclude services already in the cart
      .filter(service => !cart.some(item => item.id === service.id))
      // Sort by rating (descending)
      .sort((a, b) => b.rating - a.rating)
  }

  // 4. Limit the final list (applies to all three attempts)
  similarServices = similarServices.slice(0, 5);

  // Dynamic Title Determination for the Carousel
  const carouselTitle = similarServices.length > 0
    ? (cartSubcategories.some(sub => similarServices.some(s => s.subcategory === sub))
      ? 'Similar Services in Your Subcategory'
      : (cartCategories.some(cat => similarServices.some(s => s.category === cat))
        ? 'More Services in the Same Category'
        : 'Top-Rated Services You Might Need' // Fallback 2 Title
      ))
    : 'You Might Also Like'; // Should only show if similarServices.length is 0 after all attempts



  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [id]: !prev[id] }));
  };


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);


  useEffect(() => {
  if (miniRef.current && mockMiniServices.length > 0) {
    initScrollPosition(miniRef);
  }
}, [mockMiniServices.length]);

useEffect(() => {
  if (similarRef.current && similarServices.length > 0) {
    initScrollPosition(similarRef);
  }
}, [similarServices.length]);

useEffect(() => {
  if (otherRef.current && allServices.length > 0) {
    initScrollPosition(otherRef);
  }
}, [allServices.length]);





  const handleEditCartItem = (cartItem: CartItem, service: Service) => {
    const slug = service.subcategory.toLowerCase().replace(/\s/g, "-");

    const match = cartItem.name.match(/\(([^)]+)\)/);
    const selectedPackageName = match ? match[1] : null;

    navigate(`/services/${slug}`, {
      state: {
        openDirectly: true,
        selectedServiceId: service.id,
        selectedPackageName,
        services: [service],

        fromCartEdit: true,
        editCartItemId: cartItem.cartItemId,
      },
    });
  };



  // --- EMPTY CART VIEW ---
  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(80vh-4rem)] bg-white py-2 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl p-6 shadow-xl border-2 border-peach-200">
            <div className="bg-gradient-to-r from-peach-100 to-navy-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart size={38} className="text-navy-600" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 mb-6">Your Cart is Empty</h1>
            <p className="text-3m text-navy-600 mb-8 max-w-2xl mx-auto">
              Discover our professional cleaning services and add them to your cart.
            </p>
            <div className="flex justify-center">
              <Link
                to="/services"
                className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-peach-300 hover:to-navy-700 transition-all shadow-lg inline-flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const initScrollPosition = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref.current) return;

  // ✅ move scroll to middle so left & right both work
  ref.current.scrollLeft = ref.current.scrollWidth / 3;
};



const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollBy({ left: -300, behavior: "smooth" });
};

const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollBy({ left: 300, behavior: "smooth" });
};


  // --- MAIN CART VIEW ---
  return (
    <div className="bg-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-peach-600 hover:text-peach-700 font-medium mb-6 bg-white px-4 py-2 rounded-lg shadow-md border border-peach-200"
        >
          <ArrowLeft size={20} />
          Continue Booking
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-3xl font-semibold text-navy-900 mb-4">
            Your <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Service Cart</span>
          </h1>
          <p className="text-xl text-navy-600">
            {cart.length} professional cleaning service{cart.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid lg:grid-cols-3 gap-8">



          {/* Cart Items (lg:col-span-2) */}
          <div className="lg:col-span-3 space-y-2"> {/* tightened spacing */}
            {cart.map(item => {
              const isExpanded = !!expandedDescriptions[item.cartItemId];
              const maxLen = 160;
              const needsToggle = item.description && item.description.length > maxLen;
              const displayDesc = needsToggle && !isExpanded
                ? `${item.description.slice(0, maxLen)}...`
                : item.description;

              return (
                <div
                  key={item.cartItemId}
                  onClick={() => {
                    const service = allServices.find(s => s.id === item.id);
                    if (service && hasMultiplePackages(service)) {
                      handleEditCartItem(item, service);
                    }
                  }}
                  className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 transition-all duration-300 
  ${allServices.find(s => s.id === item.id && hasMultiplePackages(s))
                      ? "cursor-pointer hover:shadow-xl hover:border-peach-400"
                      : ""}`}

                >


                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 text-sm text-navy-500">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500" />
                          <span className="font-medium text-navy-700 truncate">{item.rating} ({item.reviews})</span>
                        </div>

                      </div>

                      <h3 className="text-md font-semibold text-navy-900 mb-1 truncate">{item.name}</h3>

                      <p className="text-navy-600 text-sm mb-1 leading-snug">
                        {displayDesc}
                        {needsToggle && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();   // 🚫 prevent opening service details
                              toggleDescription(item.cartItemId);
                            }}
                            className="ml-1 text-blue-600 hover:underline text-xs"
                          >
                            {isExpanded ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </p>
                    </div>

                    {/* compact right column: static price and delete button (quantity removed) */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="text-peach-600 font-bold text-lg">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();   // 🚫 Prevent opening details page
                          removeItem(item.cartItemId);
                        }}
                        className="mt-2 text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Order Summary (Single Row Totals) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">

              {/* Heading */}
              <h3 className="text-2xl font-semibold text-navy-900 mb-4 text-center border-b pb-3 border-peach-100">
                Order Summary
              </h3>

              {/* MAIN ROW FOR TOTALS AND BUTTON */}
              <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-peach-50 p-4 rounded-xl border border-peach-200">

                {/* LEFT SIDE: All Amounts in a single responsive row (flex-wrap for safety, but primarily a row) */}
                <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4 text-sm text-navy-700">

                  {/* Total Services */}
                  <div className="flex flex-col items-center min-w-[50px] text-center">
                    <span className="font-medium text-xs sm:text-sm">Services</span>
                    <span className="text-black font-bold text-lg sm:text-1xl">{totalServiceCount}</span>
                  </div>

                  <div className="w-px h-10 bg-peach-300"></div> {/* Separator */}

                  {/* Subtotal */}
                  <div className="flex flex-col items-center min-w-[70px] text-center">
                    <span className="font-medium text-xs sm:text-sm">Subtotal</span>
                    <span className="text-black font-bold text-lg sm:text-1xl">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="w-px h-10 bg-peach-300"></div> {/* Separator */}

                  {/* GST */}
                  <div className="flex flex-col items-center min-w-[60px] text-center">
                    <span className="font-medium text-xs sm:text-sm">GST (18%)</span>
                    <span className="text-black font-bold text-lg sm:text-1xl">
                      ₹{tax.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="w-px h-10 bg-peach-300"></div> {/* Separator */}

                  {/* Grand Total - Larger and most prominent */}
                  <div className="flex flex-col items-center min-w-[70px] text-center">
                    <span className="font-medium text-xs sm:text-sm text-navy-700">Grand Total</span>
                    <span className="text-black font-bold text-lg sm:text-1xl">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>

                {/* Right Side: Proceed Button - Full width on small screens, fixed width on desktop */}
                <button
                  onClick={handleProceedToBooking}
                  disabled={isProcessing}
                  className="w-full md:w-auto bg-gradient-to-r from-peach-300 to-navy-700 text-white px-6 py-2 rounded-xl text-lg font-bold 
                   hover:from-peach-600 hover:to-navy-800 transition-all shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Proceed to Book"
                  )}
                </button>
              </div>

              {/* Add More Services */}
              <div className="text-center mt-3">
                <Link to="/services" className="text-navy-700 hover:text-peach-700 text-sm font-medium transition-colors">
                  <span className="border-b border-dashed border-navy-700 pb-0.5">Add More Services</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
        {/* --- END MAIN GRID LAYOUT --- */}
      </div>



      {/* --- Filtering Mini Services: Only show services NOT currently in the cart --- */}
      {/* This ensures the service disappears when 'Add' is clicked. */}
      {/* It uses the simplified Price Left / Button Right layout. */}
      {(() => {
        const availableMiniServices = mockMiniServices.filter(service =>
          !cart.some(item => item.id === service.id)
        );

        if (availableMiniServices.length === 0) return null;

        return (
          <div className="mt-6 mb-1 w-full">
            {/* Embedded CSS for the marquee effect is already present later, but we include it again here for clarity/readability. */}
            <style>{`
            @keyframes marquee-seamless {
              0% { transform: translateX(0); }
              100% { transform: translateX(-66.666%); }
            }
            .animate-marquee-seamless {
              animation: marquee-seamless 20s linear infinite;
              will-change: transform;
            }
              .marquee-container:hover .animate-marquee-seamless {
                animation-play-state: paused;
            }

          `}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-6 text-navy-900 text-center">
                <span className="text-peach-600">Mini Services</span>
              </h2>
            </div>

            {/* Carousel track container */}
            <div className="relative">

  <button
    onClick={() => scrollLeft(miniRef)}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-20
               bg-white/90 backdrop-blur rounded-full p-3 shadow-lg
               hover:bg-peach-200 transition"
  >
    <ChevronLeft size={22} />
  </button>

  <button
    onClick={() => scrollRight(miniRef)}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-20
               bg-white/90 backdrop-blur rounded-full p-3 shadow-lg
               hover:bg-peach-200 transition"
  >
    <ChevronRight size={22} />
  </button>

  <div
    ref={miniRef}
    className="marquee-container flex overflow-hidden relative py-4"
  >

              {/* Inner container: 300% width for seamless loop */}
              <div className="flex animate-marquee-seamless" style={{ width: '300%' }}>

                {/* Triple loop of available mini services */}
                {[...availableMiniServices, ...availableMiniServices, ...availableMiniServices].map((service, index) => {
                  // isAdded check is technically redundant here due to the filter,
                  // but keeping the 'Add' button consistent is simpler.
                  const cartItem = cart.find(item => item.id === service.id);
                  const isAdded = !!cartItem;

                  return (
                    <div
                      key={`${service.id}-mini-${index}`}
                      className="flex-shrink-0 w-60 sm:w-72 mx-3 cursor-pointer"
                    >
                      <div
                        className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl flex flex-col"
                      >
                        {/* Image */}
                        <div className="relative h-28 w-full overflow-hidden">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content area: Price Left, Button Right */}
                        <div className="px-3 pt-3 pb-2 flex flex-col flex-grow justify-between">
                          <div>
                            {/* Service Name */}
                            <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-snug">
                              {service.name}
                            </h3>

                            {/* --- SIMPLIFIED LAYOUT: Price Left, Button Right --- */}
                            <div className="flex items-center text-xs text-gray-600">

                              {/* Price (Left) */}
                              <div className="text-xl font-bold text-peach-600">
                                ₹{service.price.toLocaleString('en-IN')}
                              </div>

                              {/* Add Button (Right) */}
                              <button
                                onClick={() => addSimilarServiceToCart(service)}
                                // Simplified style since it will always be the 'Add' state here
                                className={`ml-auto text-sm font-bold py-1 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 bg-green-500 text-white hover:bg-green-600`}
                                aria-label={`Add ${service.name} to cart`}
                              >
                                <ShoppingCart size={14} /> Add
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        );
      })()}
      {/* --- END NEW MINI SERVICES SECTION --- */}

      {/* --- SIMILAR SERVICES CAROUSEL (FULL WIDTH) --- */}
      {similarServices.length >= 0 && (
        <div className="mt-6 mb-1 w-full">

          {/* Embedded CSS for the marquee effect */}
          <style>{`
            @keyframes marquee-seamless {
              0% { transform: translateX(0); }
              100% { transform: translateX(-66.666%); }
            }
            .animate-marquee-seamless {
              animation: marquee-seamless 30s linear infinite;
              will-change: transform;
            }

            .marquee-container:hover .animate-marquee-seamless {
              animation-play-state: paused;
      }
          `}</style>

          {/* Title container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h4 className="text-2xl font-bold mb-6 text-navy-900 text-center">
              You Might Also Like
            </h4>
          </div>

          {/* Carousel track container */}
          <div className="relative">

  <button
    onClick={() => scrollLeft(similarRef)}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-20
               bg-white/90 backdrop-blur rounded-full p-3 shadow-lg
               hover:bg-peach-200 transition"
  >
    <ChevronLeft size={22} />
  </button>

  <button
    onClick={() => scrollRight(similarRef)}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-20
               bg-white/90 backdrop-blur rounded-full p-3 shadow-lg
               hover:bg-peach-200 transition"
  >
    <ChevronRight size={22} />
  </button>

  <div
    ref={similarRef}
    className="marquee-container flex overflow-hidden relative py-4"
  >



            {/* Inner container: 300% width for seamless loop */}
            <div className="flex animate-marquee-seamless" style={{ width: '300%' }}>

              {/* Triple loop of similar services */}
              {[...similarServices, ...similarServices, ...similarServices].map((service, index) => (
                <div
                  key={`${service.id}-${index}`}
                  className="flex-shrink-0 w-60 sm:w-72 mx-3 cursor-pointer"
                >
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl">

                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-40 object-cover"
                      onClick={() => handleViewDetails(service)}
                    />

                    <div className="p-3">
                      <h3
                        className="text-lg font-bold text-gray-800 mb-1 truncate hover:text-peach-600 transition-colors"
                        onClick={() => handleViewDetails(service)}
                      >
                        {service.name}
                      </h3>

                      {/* reviews + add button inline (no extra below space) */}
                      <div className="flex items-center text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                          <span>{service.rating} ({service.reviews} reviews)</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addSimilarServiceToCart(service);
                          }}
                          className="ml-auto flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition"
                        >
                          <ShoppingCart size={14} /> Add
                        </button>
                      </div>

                      {/* reduced bottom padding to remove extra space */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      )}
      {/* --- END SIMILAR SERVICES CAROUSEL --- */}
      {/* OTHER SERVICES */}
      {(() => {
        const cartCategoriesSet = new Set(cart.map(item => item.category));

        const otherServicesRaw = allServices.filter(service =>
          !cartCategoriesSet.has(service.category)
        );

        if (otherServicesRaw.length === 0) return null;

        // Instead of grouping → show each service as card in the carousel
        const uniqueServices = otherServicesRaw.slice(0, 20); // Limit max to avoid heavy sliding

        return (
          <div className="mt-6 mb-1 w-full">

            {/* Title */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-navy-900 text-center mb-6">
                Other Services
              </h2>
            </div>

            {/* Sliding CSS */}
            <style>{`
        @keyframes other-services-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .other-services-track {
          animation: other-services-slide 40s linear infinite;
          will-change: transform;
        }
        .other-services-container:hover .other-services-track {
          animation-play-state: paused;
        }
      `}</style>

            {/* Marquee Container */}
            <div className="relative">

  <button
    onClick={() => scrollLeft(otherRef)}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-20
               bg-white/90 backdrop-blur rounded-full p-3 shadow-lg
               hover:bg-peach-200 transition"
  >
    <ChevronLeft size={22} />
  </button>

  <button
    onClick={() => scrollRight(otherRef)}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-20
               bg-white/90 backdrop-blur rounded-full p-3 shadow-lg
               hover:bg-peach-200 transition"
  >
    <ChevronRight size={22} />
  </button>

  <div
    ref={otherRef}
    className="other-services-container overflow-hidden py-4"
  >


              <div className="flex other-services-track" style={{ width: "220%" }}>

                {[...uniqueServices, ...uniqueServices].map((service, idx) => (
                  <div
                    key={idx}
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

                      {/* ALWAYS ADD BUTTON */}
                      <button
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
                        <ShoppingCart size={14} /> Add
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
          </div>
        );
      })()}
      {/*  END OTHER SERVICES SECTION  */}
    </div>
  );
};

export default Cart;
