// ...existing code...
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import Global_API_BASE from '../services/GlobalConstants';
 
// --- INTERFACE DEFINITIONS ---
interface CartItem {
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
 
 
// --- MOCK DATA FOR MINI SERVICES (Based on the screenshot) ---
const mockMiniServices: Service[] = [
  {
    id: 'mini-1',
    name: 'Kitchen Chimney Cleaning',
    category: 'Home Cleaning',
    subcategory: 'Kitchen Chimney Cleaning',
    price: 699,
    rating: 4.7,
    reviews: '120',
    duration: '1-2 hours',
    description: 'With our skilled kitchen chimney cleaning services, you can restore suction power and get rid of grease buildup. To guarantee smoke-free cooking and better kitchen hygiene, we thoroughly clean filters, ducts, and hoods using non-toxic, safe techniques. Our service, which is trusted by residences and dining establishments, keeps your kitchen fresh and your chimney operating efficiently.',
    image: 'https://th.bing.com/th/id/OIP.od-xJrn3Q9c-JZTOHf5glQHaE8?w=231&h=180&c=7&r=0&o=7&am…',
  },
  {
    id: 'mini-2',
    name: 'Micro oven Cleaning',
    category: 'Appliance Cleaning',
    subcategory: 'Micro Oven Cleaning',
    price: 199,
    rating: 4.6,
    reviews: '85',
    duration: '30 mins',
    description: 'Use our expert microwave oven cleaning services to guarantee hygienic and safe cooking. We use non-toxic, food-safe products to remove food stains, grease, and smells from all interior surfaces. Our service, which is perfect for both residential and commercial kitchens, restores the cleanliness and functionality of your microwave in a single visit.',
    image: 'https://thumbs.dreamstime.com/b/anti-grease-spray-hand-girl-who-cleaning-kitchen-microwave-oven-dirt-modern-antistatic-agent-334440744.jpg',
  },
 
  {
    id: 'mini-3',
    name: 'Exhaust fan cleaning',
    category: 'Home Cleaning',
    subcategory: 'Exhaust Fan Cleaning',
    price: 299,
    rating: 4.5,
    reviews: '60',
    duration: '45 mins',
    description: 'Use our professional exhaust fan cleaning services to maintain fresh, clean air in your kitchen or bathroom. To restore ideal airflow and lower the risk of a fire, we remove grease, dust, and grime accumulation. Our skilled experts make sure your exhaust fan operates smoothly and effectively by using safe, efficient techniques.',
    image: 'https://www.wikihow.com/images/thumb/e/e5/Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg/v4-460px-Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg',
  },
  {
    id: 'mini-4',
    name: 'Fridge Cleaning (150-200ltr)',
    category: 'Appliance Cleaning',
    subcategory: 'Fridge Cleaning',
    price: 399,
    rating: 4.8,
    reviews: '150',
    duration: '1 hour',
    description: 'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image: 'https://tse4.mm.bing.net/th/id/OIP.gBHvUlKTqQsxNndmeVyfpQHaHf?rs=1&pid=ImgDetMain&o=7&rm=3%27',
    service_package: '150-200ltr',
  },
  {
    id: 'mini-5',
    name: 'Fridge Cleaning (200-500ltr)',
    category: 'Appliance Cleaning',
    subcategory: 'Fridge Cleaning',
    price: 549,
    rating: 4.8,
    reviews: '150',
    duration: '1-2 hours',
    description: 'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image: 'https://c8.alamy.com/comp/2GNEE46/the-man-cleaning-fridge-in-hygiene-concept-2GNEE46.jpg',
  service_package: '200-500ltr',
  },
  {
    id: 'mini-6',
    name: 'Fridge Cleaning (500-1000ltr)',
    category: 'Appliance Cleaning',
    subcategory: 'Fridge Cleaning',
    price: 799,
    rating: 4.8,
    reviews: '150',
    duration: '2-3 hours',
    description: 'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image: 'https://images.airtasker.com/v7/https://airtasker-seo-assets-prod.s3.amazonaws.com/en_AU/1724116114503-fridge-cleaning.jpg',
    service_package: '500-1000ltr',
  },
];
 
 
 
 
// --- LOCAL STORAGE HELPERS ---
const getCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('kushiServicesCart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};
 
const saveCartToStorage = (cart: CartItem[]) => {
  const serializableCart = cart.map(item => ({
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
              :  `Global_API_BASE${item.service_image_url}`
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
 
 
  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    saveCartToStorage(newCart);
  };
 
  // Add directly to cart (kept for other uses)
  const addSimilarServiceToCart = (service: Service) => {
    const existingItem = cart.find(ci => ci.id === service.id);
    const serviceAsCartItem: CartItem = {
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
   
   // Check if the service is a "mini" service by looking at the ID prefix
    // This is the **key change** to override the package check for the carousel.
    const isMiniService = service.id.startsWith('mini-');
 
    if (service.service_package && !isMiniService) {
      // Navigate to service details if there are packages AND it's a regular service
      handleViewDetails(service);
    } else {
      // Add to cart if no packages OR if it is a mini-service (direct add for quick use)
      const updatedCart = existingItem
        ? cart.map(ci => ci.id === service.id ? {...ci, quantity: ci.quantity + 1} : ci)
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
    navigate(`/services/${slug}`, { state: { services: [service], openDirectly: true } });
  };
 
  // --- CALCULATIONS ---
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
 
 
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
 
  // --- EMPTY CART VIEW ---
  if (cart.length === 0) {
    return (
      <div className="bg-white py-10 w-full">
        <div className="max-w-4xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="text-center bg-white rounded-3xl p-12 shadow-xl border-2 border-peach-200">
           
            <h1 className="text-4xl font-bold text-navy-900 mb-6">Your Cart is Empty</h1>
            <p className="text-xl text-navy-600 mb-4 max-w-1xl mx-auto">
              Discover our professional cleaning services and add them to your cart.
            </p>
            <div className="flex justify-center">
              <Link
                to="/services"
                className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-peach-200 hover:to-navy-800 transition-all shadow-lg inline-flex items-center justify-center gap-2"
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
 
  // --- MAIN CART VIEW ---
  return (
    <div className="bg-white py-10 w-full">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
       
 
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-4">
            Your <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Service Cart</span>
          </h1>
          <p className="text-xl text-navy-600">
            {cart.length} professional cleaning service{cart.length !== 1 ? 's' : ''} selected
          </p>
        </div>
 
        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid lg:grid-cols-3 gap-8">
         
         
         
          {/* Cart Items (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-2"> {/* tightened spacing */}
            {cart.map(item => {
              const isExpanded = !!expandedDescriptions[item.id];
              const maxLen = 160;
              const needsToggle = item.description && item.description.length > maxLen;
              const displayDesc = needsToggle && !isExpanded
                ? `${item.description.slice(0, maxLen)}...`
                : item.description;
 
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-3 shadow-sm border border-peach-200 hover:shadow-md transition-all"
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
                            onClick={() => toggleDescription(item.id)}
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
                        onClick={() => removeItem(item.id)}
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
 
 
 
 
          {/* Order Summary (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-peach-200 ">
              <h3 className="text-2xl font-bold text-navy-900 mb-6 text-center">Order Summary</h3>
 
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-navy-700">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-navy-700">
                  <span>GST (18%)</span>
                  <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t-2 border-peach-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-navy-900">
                    <span>Total Amount</span>
                    <span className="text-peach-600">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
 
              <button
                onClick={handleProceedToBooking}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-peach-300 to-navy-700 text-white py-4 rounded-xl text-lg font-bold hover:from-peach-300 hover:to-navy-700 transition-all shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Calendar size={20} />
                    Proceed to Booking
                  </>
                )}
              </button>
 
              <div className="text-center mb-6">
                <Link to="/services" className="text-peach-300 hover:text-peach-700 font-medium text-sm">
                  Add More Services
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
            <div className="mt-16 mb-4 w-full">
                {/* Embedded CSS for the marquee effect is already present later, but we include it again here for clarity/readability. */}
                <style>{`
            @keyframes marquee-seamless {
              0% { transform: translateX(0); }
              100% { transform: translateX(-66.666%); }
            }
            .animate-marquee-seamless {
              animation: marquee-seamless 80s linear infinite;
              will-change: transform;
            }
          `}</style>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-6 text-navy-900 text-center">
                  <span className="text-peach-600">Mini Services</span>
                </h2>
              </div>
             
              {/* Carousel track container */}
              <div className="flex overflow-hidden relative py-4">
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
        );
    })()}
    {/* --- END NEW MINI SERVICES SECTION --- */}
 
      {/* --- SIMILAR SERVICES CAROUSEL (FULL WIDTH) --- */}
      {similarServices.length >= 0 && (
         <div className="mt-16 mb-4 w-full">
         
          {/* Embedded CSS for the marquee effect */}
          <style>{`
            @keyframes marquee-seamless {
              0% { transform: translateX(0); }
              100% { transform: translateX(-66.666%); }
            }
            .animate-marquee-seamless {
              animation: marquee-seamless 50s linear infinite;
              will-change: transform;
            }
          `}</style>
         
          {/* Title container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h4 className="text-2xl font-bold mb-6 text-navy-900 text-center">
              You Might Also Like
            </h4>
          </div>
 
          {/* Carousel track container */}
          <div className="flex overflow-hidden relative py-4">
           
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
      )}
      {/* --- END SIMILAR SERVICES CAROUSEL --- */}
    </div>
  );
};
 
export default Cart;
 
 