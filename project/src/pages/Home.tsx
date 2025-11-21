import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock, CheckCircle, Star, Search, Home, Building, Bug, Wrench, Truck, MapPin, Phone } from 'lucide-react';
import RotatingOffers from '../components/RotatingOffers';
import axios from "axios";
import { KushiTeamworkCarousel } from '../components/KushiTeamworkCarousel';
import FeaturesCarousel from '../components/FeaturesCarousel';
import Global_API_BASE from '../services/GlobalConstants';
import GoogleReviews from '../components/GoogleReviews';

interface Service {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  service_package: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: string;
  duration: string;
  image: string;
  description: string;
  features: string[];
  active: string;
   // additional optional fields used by ServiceDetails
  badge?: string;
  overview?: string;
  our_process?: string;
  benefits?: string;
  whats_included?: string;
  whats_not_included?: string;
  why_choose_us?: string;
  kushi_teamwork?: string;
  faq?: string;
}

const HomePage: React.FC = () => { 
  
 useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);

 


  const navigate = useNavigate();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    { type: string; name: string; subcategory?: string; service?: Service }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);


  const [isHovering, setIsHovering] = useState(false);


   // Top services state + error + loading
  const [topServices, setTopServices] = useState<any[]>([]);
  const [topServicesError, setTopServicesError] = useState<string | null>(null);
  const [topServicesLoading, setTopServicesLoading] = useState<boolean>(false);


  // portal dropdown refs / position
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ left: number; top: number; width: number } | null>(null);

  // hero image shown on the right side of the hero section (offer image or default)
  const [heroImage, setHeroImage] = useState<string>('/kushi.png');

  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return '/kushi.png';
    const s = String(url);
    if (s.startsWith('http') || s.startsWith('data:') || s.startsWith('//')) return s;
    // adjust path according to your backend; uploads folder shown as example
    return s.startsWith('/') ? `Global_API_BASE${s}` : `Global_API_BASE/uploads/${s}`;
  };


 useEffect(() => {
    // Fetch all active services
    const fetchServices = async () => {
      try {
        const res = await fetch(Global_API_BASE +"/api/customers/all-services");
        const data = await res.json();
        const mapped: Service[] = data
          .filter((item: any) => item.active === "Y")
          .map((item: any, index: number) => ({
            id: item.service_id?.toString() || index.toString(),
            name: item.service_name || "Unnamed Service",
            category: item.service_category || "General",
            subcategory: item.service_type || "",
            service_package: item.service_package || "",
            price: item.service_cost || 0,
            originalPrice: item.originalPrice || item.price || 0,
            rating: parseFloat(item.rating) || 0,
            reviews: item.rating_count ? String(item.rating_count) : "0",
            duration: item.duration || "1 hr",
            image: item.service_image_url
              ? item.service_image_url.startsWith("http")
                ? item.service_image_url
                :  `Global_API_BASE${item.service_image_url}`
              : "/placeholder.jpg",
            description: item.service_description || "",
            features: item.features ? item.features.split(",") : [],
            active: item.active,
             // extra fields used by ServiceDetails tabs
          badge: item.badge || "",
          overview: item.overview || item.service_overview || "",
          our_process: item.our_process || item.service_process || "",
          benefits: item.benefits || "",
          whats_included: item.whats_included || item.whatsIncluded || "",
          whats_not_included: item.whats_not_included || item.whatsNotIncluded || "",
          why_choose_us: item.why_choose_us || "",
          kushi_teamwork: item.kushi_teamwork || "",
          faq: item.faq || "",
        }));
        setAllServices(mapped);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchServices();
  }, []);
 
  
  // debug: log heroImage updates
  useEffect(() => {
    console.debug("Home heroImage:", heroImage);
  }, [heroImage]);


  // Update suggestions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
 
    const lowerTerm = searchTerm.toLowerCase();
    const results: typeof suggestions = [];
 
    allServices.forEach((service) => {
      // Category match
      if (service.category.toLowerCase().includes(lowerTerm)) {
        if (!results.find((r) => r.name === service.category && r.type === "Category")) {
          results.push({ type: "Category", name: service.category });
        }
      }
      // Subcategory match
      if (service.subcategory.toLowerCase().includes(lowerTerm)) {
        if (!results.find((r) => r.name === service.subcategory && r.type === "Subcategory")) {
          results.push({ type: "Subcategory", name: service.subcategory, subcategory: service.subcategory });
        }
      }
      // Service name match
      if (service.name.toLowerCase().includes(lowerTerm)) {
        results.push({ type: "Service", name: service.name, service });
      }
      // Service package match
      if (service.service_package) {
        const packages = service.service_package.split(";");
        packages.forEach((pkg) => {
          const [pkgName] = pkg.split(":");
          if (pkgName.toLowerCase().includes(lowerTerm)) {
            results.push({ type: "Package", name: pkgName, service });
          }
        });
      }
    });
 
    setSuggestions(results.slice(0, 10)); // limit to 10 suggestions
  }, [searchTerm, allServices]);
 
  // Handle click outside dropdown
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideInput = searchRef.current && !searchRef.current.contains(target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      if (clickedOutsideInput && (dropdownRef.current ? clickedOutsideDropdown : true)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // compute portal dropdown position
  const updateDropdownPosition = () => {
    const el = searchRef.current;
    if (!el) return setDropdownRect(null);
    const rect = el.getBoundingClientRect();
    setDropdownRect({ left: rect.left, top: rect.bottom, width: rect.width });
  };
 
  useEffect(() => {
    if (showDropdown) updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [showDropdown]);



  const handleSelect = (item: typeof suggestions[0]) => {
    setSearchTerm("");
    setShowDropdown(false);
 
    if (item.type === "Category") {
      navigate("/services");
    } else if (item.type === "Subcategory") {
      const urlSubcategory = item.subcategory!.toLowerCase().replace(/\s/g, "-");
      const filteredServices = allServices.filter(
        (s) => s.subcategory.toLowerCase() === item.subcategory!.toLowerCase()
      );
      navigate(`/services/${urlSubcategory}`, { state: { services: filteredServices } });
    } else if (item.type === "Service") {
      const urlSubcategory = item.service!.subcategory.toLowerCase().replace(/\s/g, "-");
      navigate(`/services/${urlSubcategory}`, { state: { services: [item.service!] } });
    } else if (item.type === "Package") {
      const urlSubcategory = item.service!.subcategory.toLowerCase().replace(/\s/g, "-");
      navigate(`/services/${urlSubcategory}`, { state: { services: [item.service!] } });
    }
  };
 

/** ---------------------------
   * Fetch Top Services from backend
   ---------------------------- */
const API_BASE_URL = Global_API_BASE +"/api/admin"; // backend URL

  const getTopServices = async () => {
    setTopServicesLoading(true);
    setTopServicesError(null);
    try {
     console.debug("Requesting top services:", `${API_BASE_URL}/top-services`);
      const response = await axios.get( `${API_BASE_URL}/top-services`, { timeout: 10000 });
      console.debug("top-services response:", response.status, response.data);
      const payload = response.data;
      const list = payload?.topServices ?? payload ?? [];
      setTopServices(Array.isArray(list) ? list : []);
      setTopServicesError(null);
    } catch (error: any) {
      console.error("Error fetching top services:", error?.response ?? error?.message ?? error);
      setTopServices([]);
      setTopServicesError(
        error?.response?.data?.message || error?.message || "Failed to fetch top services"
      );
    } finally {
      setTopServicesLoading(false);
    }
  };
useEffect(() => {
    getTopServices();
  }, []);



  

/** ---------------------------
  * New function to handle navigation from Top Booked Service card
  ---------------------------- */
const handleClickTopService = async (topItem: any | string) => {
  const top = typeof topItem === "string"
    ? { booking_service_name: topItem }
    : topItem || {};
 
  const bookingName = (top.booking_service_name || top.service_name || "").trim();
 
  // helper slug function
  const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
 
  const getRawSubcat = (obj: any) =>
    obj?.booking_service_subcategory ||
    obj?.service_type ||
    obj?.service_category ||
    obj?.subcategory ||
    obj?.category ||
    bookingName ||
    "general";
 
  const rawSubcategory = getRawSubcat(top);
 
  // ---- TRY TO FIND MATCH IN CURRENT allServices ----
  let found =
    allServices.find(
      (s) =>
        String(s.id) ===
        String(top.booking_service_id ?? top.service_id ?? top.id)
    ) ||
    allServices.find(
      (s) => s.name.trim().toLowerCase() === bookingName.toLowerCase()
    ) ||
    (bookingName
      ? allServices.find((s) =>
          s.name.trim().toLowerCase().includes(bookingName.toLowerCase())
        )
      : undefined);
 
  // ---- If not found, re-fetch ALL services ----
  if (!found) {
    try {
      const res = await fetch(Global_API_BASE + "/api/customers/all-services");
      if (res.ok) {
        const data = await res.json();
 
        const mapped: Service[] = data
          .filter((item: any) =>
            (item.active ?? "Y").toString().toUpperCase() === "Y"
          )
          .map((item: any, index: number) => ({
            id: item.service_id?.toString() || index.toString(),
            name: item.service_name || item.booking_service_name || "Unnamed",
            category: item.service_category || item.category || "",
            subcategory:
              item.service_type ||
              item.subcategory ||
              item.booking_service_subcategory ||
              "",
            service_package: item.service_package || "",
            price: Number(item.service_cost ?? item.price ?? 0),
            originalPrice: Number(item.originalPrice ?? item.price ?? 0),
            rating: parseFloat(item.rating) || 0,
            reviews: item.rating_count ? String(item.rating_count) : "0",
            duration: item.duration || "1 hr",
            image:
              item.service_image_url &&
              String(item.service_image_url).startsWith("http")
                ? item.service_image_url
                : item.service_image_url
                ? Global_API_BASE + item.service_image_url
                : "/placeholder.jpg",
            description:
              item.service_description ||
              item.booking_service_description ||
              "",
            features: item.features ? String(item.features).split(",") : [],
            active: item.active ?? "Y",
            badge: item.badge || "",
            overview: item.overview || "",
            our_process: item.our_process || "",
            benefits: item.benefits || "",
            whats_included: item.whats_included || "",
            whats_not_included: item.whats_not_included || "",
            why_choose_us: item.why_choose_us || "",
            kushi_teamwork: item.kushi_teamwork || "",
            faq: item.faq || "",
          }));
 
        setAllServices(mapped);
 
        found =
          mapped.find(
            (s) =>
              String(s.id) ===
              String(top.booking_service_id ?? top.service_id ?? top.id)
          ) ||
          mapped.find(
            (s) => s.name.trim().toLowerCase() === bookingName.toLowerCase()
          ) ||
          (bookingName
            ? mapped.find((s) =>
                s.name.trim().toLowerCase().includes(bookingName.toLowerCase())
              )
            : undefined);
      }
    } catch {}
  }
 
  // ---- If still not found → build fallback service object ----
  const selected: Service =
    found ||
    ({
      id: String(
        top.service_id ?? top.booking_service_id ?? top.id ?? Date.now()
      ),
      name: bookingName || "Service",
      category: top.service_category || top.category || "",
      subcategory: rawSubcategory,
      service_package: top.service_package || "",
      price: Number(top.price ?? 0),
      originalPrice: Number(top.originalPrice ?? 0),
      rating: Number(top.rating ?? 0),
      reviews: top.rating_count ? String(top.rating_count) : "0",
      duration: top.duration || "1 hr",
      image:
        top.service_image_url && String(top.service_image_url).startsWith("http")
          ? top.service_image_url
          : "/placeholder.jpg",
      description:
        top.booking_service_description || top.service_description || "",
      features: top.features ? String(top.features).split(",") : [],
      active: top.active ?? "Y",
      badge: "",
      overview: "",
      our_process: "",
      benefits: "",
      whats_included: "",
      whats_not_included: "",
      why_choose_us: "",
      kushi_teamwork: "",
      faq: "",
    } as Service);
 
  // ---- ALWAYS NAVIGATE DIRECTLY TO SERVICE DETAILS ----
  const subSlug = slugify(selected.subcategory || selected.category || "general");
  const serviceSlug = slugify(selected.name);
 
  navigate(`/services/${subSlug}/${serviceSlug}`, {
    state: {
      services: [selected],        // 🔥 ALWAYS a single service
      selectedServiceId: selected.id,
      openDirectly: true,
    },
  });
}; 

  /** ---------------------------
   * Service Categories
   ---------------------------- */
   // Add a function to create a URL-friendly slug
   
const createSlug = (text: string) => text.toLowerCase().replace(/\s/g, '-').replace(/&/g, 'and');



  const serviceCategories = [
    {
      icon: Home,
      title: 'Residential Cleaning Services',
      description: 'Complete home cleaning solutions with premium eco-friendly products',
      price: 'Starting ₹999',
      image: 'https://tse4.mm.bing.net/th/id/OIP.2XIebCebLJVe7iwYKSvD4wHaFD?rs=1&pid=ImgDetMain&o=7&rm=3',
      link: '/services',
      gradient: 'from-peach-300 to-navy-700',
      services: ['Full Home Deep Cleaning Services', 'Kitchen Cleaning Services', 'Bathroom Cleaning Services', 
        'Carpet Cleaning Services', 'Sofa cleaning Services', 'Mattress cleaning Services', 'Window Cleaning Services',
        'Balcony Cleaning Services', 'Hall Cleaning Services', 'Bedroom Cleaning Services', 'Exterior Cleaning', 
        'Water Sump Cleaning and Water Tank Cleaning', 'Floor Deep Cleaning Services']
    },
    {
      icon: Building,
      title: 'Commercial Cleaning Services',
      description: 'Professional office and commercial space cleaning services',
      price: 'Starting ₹4,499',
      image: 'https://rescuemytimecleaningservice.com/wp-content/uploads/2020/11/maid-service-hiring.jpg',
      link: '/services',
      gradient: 'from-navy-700 to-peach-300',
      services: ['Office Cleaning Services', 'Office Carpet Cleaning Services', 'Office Chair Cleaning Services', 'Hotel and restaurant cleaning']
    },
    {
      icon: Building,
      title: 'Industrial Cleaning Services',
      description: 'Professional office and commercial space cleaning services',
      price: 'Starting ₹4,499',
      image: 'https://rescuemytimecleaningservice.com/wp-content/uploads/2020/11/maid-service-hiring.jpg',
      link: '/services',
      gradient: 'from-navy-700 to-peach-300',
      services: ['Factory Cleaning Services', 'Warehouse Cleaning Services']
    },
    {
      icon: Bug,
      title: 'Pest Control Services',
      description: 'Comprehensive pest control solutions for all residential and commercial spaces',
      price: 'Starting ₹1,899',
      image: 'https://tse1.mm.bing.net/th/id/OIP.I6TQ2G-RhSxGDycIkxX_UAHaDt?rs=1&pid=ImgDetMain&o=7&rm=3',
      link: '/services',
      gradient: 'from-peach-300 to-navy-700',
      services: ['Cockroach Pest Control ', 'Bedbug Pest Control', 'Termite Treatment ', 'Woodborer Pest Control', 'Rodent Pest Control', 
        'Mosquito Pest Control', 'General Pest Control', 'Commercial Pest Control', 'AMC Pest Control']
    },
    {
      icon: Wrench,
      title: 'Marble Polishing Services',
      description: 'Expert cleaning and maintenance for specialized requirements',
      price: 'Starting ₹5,999',
      image: 'https://tse2.mm.bing.net/th/id/OIP.KUKqwjbh-0rEW1CB-ftarwHaDe?rs=1&pid=ImgDetMain&o=7&rm=3',
      link: '/services',
      gradient: 'from-navy-700 to-peach-300',
      services: ['Indian Marble Polishing Services', '•	Italian Marble Polishing Services', 'Mosaic Tile Polishing Services']
    },
    
    {
      icon: Truck,
      title: 'Packers And Movers',
      description: 'Professional packing and moving services with complete care',
      price: 'Starting ₹6,999',
      image: 'https://kushiservices.com/wp-content/uploads/2024/07/Blue-and-White-Illustrative-House-Cleaning-Service-Flyer-210-x-140-mm-5-1024x682.png',
      link: '/services',
      gradient: 'from-peach-300 to-navy-700',
      services: ['Home Shifting Services', 'Office Shifting Services']
    }
  ];


  
  

  const promotions = [
  {
    title: 'Get 20% Off Your First Deep Clean!',
    description: 'Experience a spotless home with our premium deep cleaning service. Limited time offer for new customers.',
    cta: 'Claim Offer Now',
    image: 'https://tse4.mm.bing.net/th/id/OIP.2XIebCebLJVe7iwYKSvD4wHaFD?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: '/services',
    gradient: 'from-peach-300/80 to-navy-700/80'
  },
  {
    title: 'Annual Pest Control Package',
    description: 'Protect your home or office year-round with our comprehensive pest control solutions. Special rates available!',
    cta: 'Learn More',
    image: 'https://tse4.mm.bing.net/th/id/OIP.2XIebCebLJVe7iwYKSvD4wHaFD?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: '/services',
    gradient: 'from-navy-700/80 to-peach-300/80'
  },
  {
    title: 'Marble Polishing Offer',
    description: 'Get a luxurious shine with our marble polishing services. Flat 15% off for this season!',
    cta: 'Book Now',
    image: 'https://tse2.mm.bing.net/th/id/OIP.KUKqwjbh-0rEW1CB-ftarwHaDe?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: '/services',
    gradient: 'from-peach-300/80 to-navy-700/80'
  },
  {
    title: 'Packers & Movers Discount',
    description: 'Shift your home or office hassle-free! Get ₹1000 off on your first move with us.',
    cta: 'Move Now',
    image: 'https://kushiservices.com/wp-content/uploads/2024/07/Blue-and-White-Illustrative-House-Cleaning-Service-Flyer-210-x-140-mm-5-1024x682.png',
    link: '/services',
    gradient: 'from-navy-700/80 to-peach-300/80'
  },
  {
    title: 'Get 20% Off Your First Deep Clean!',
    description: 'Experience a spotless home with our premium deep cleaning service. Limited time offer for new customers.',
    cta: 'Claim Offer Now',
    image: 'https://tse4.mm.bing.net/th/id/OIP.2XIebCebLJVe7iwYKSvD4wHaFD?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: '/services',
    gradient: 'from-peach-300/80 to-navy-700/80'
  },
  {
    title: 'Annual Pest Control Package',
    description: 'Protect your home or office year-round with our comprehensive pest control solutions. Special rates available!',
    cta: 'Learn More',
    image: 'https://tse4.mm.bing.net/th/id/OIP.2XIebCebLJVe7iwYKSvD4wHaFD?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: '/services',
    gradient: 'from-navy-700/80 to-peach-300/80'
  },
  {
    title: 'Marble Polishing Offer',
    description: 'Get a luxurious shine with our marble polishing services. Flat 15% off for this season!',
    cta: 'Book Now',
    image: 'https://tse2.mm.bing.net/th/id/OIP.KUKqwjbh-0rEW1CB-ftarwHaDe?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: '/services',
    gradient: 'from-peach-300/80 to-navy-700/80'
  },
  {
    title: 'Packers & Movers Discount',
    description: 'Shift your home or office hassle-free! Get ₹1000 off on your first move with us.',
    cta: 'Move Now',
    image: 'https://kushiservices.com/wp-content/uploads/2024/07/Blue-and-White-Illustrative-House-Cleaning-Service-Flyer-210-x-140-mm-5-1024x682.png',
    link: '/services',
    gradient: 'from-navy-700/80 to-peach-300/80'
  }

];




  const handleHeroImageUpdate = (newImage: string | null) => {
    // update hero image received from RotatingOffers (fall back to default)
    const normalized = normalizeImageUrl(newImage);
    setHeroImage(normalized);
  };





  return (
    <div>

   {/* Rotating Offers */}
 <RotatingOffers onHeroImageUpdate={handleHeroImageUpdate} />


{/* Hero Section with Auto Background Change and Left-Aligned Content */}

<section className="relative min-h-[4vh] flex flex-col justify-center overflow-hidden bg-gradient-to-r from-peach-300 to-navy-700">

  {/* --- Main Content (Left-Aligned) --- */}

  <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 text-left z-10 flex flex-col justify-center items-start">

    {/* Certification Badge */}
    <div className="inline-flex items-center gap-2 bg-peach-300/20 backdrop-blur-sm px-3 py-1 rounded-full border border-peach-300 mb-2 text-xs font-semibold text-black shadow-xl">

      <Star className="text-yellow-400 fill-current" size={12} />
      IAS Accredited Management System Certified Company
    </div>

    {/* Hero Headline */}
    <h1 className="text-lg sm:text-xl lg:text-3xl font-black leading-tight mb-3">
      <span className="text-black drop-shadow-1xl">
        Redefining Cleanliness <span className="text-black">Elevating Happiness</span>
    </span>

    </h1>
     {/* Subheading */}
    <p className="text-sm sm:text-lg text-black/90 max-w-l mb-3 font-light drop-shadow-md">
      Professional, reliable, and trusted maintenance solutions for a spotless home and vibrant business.
    </p>
    {/* --- Search Bar (Unchanged Logic) --- */}

     <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
    <div className="max-w-xs w-full relative order-1 md:order-1" ref={searchRef}>
    <div className="relative bg-white backdrop-blur-sm rounded-full p-1 shadow-2xl border-4 border-peach-300/0 hover:border-peach-300 transition-all duration-300">
          <input
          type="text"
          placeholder="Search Services..."
           className="w-full p-2.5 pr-12 rounded-full border-2 border-transparent focus:outline-none focus:border-peach-300 bg-transparent text-sm text-black placeholder-black/80"
           value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        <button
          onClick={() => {
            alert(`Searching for: ${searchTerm}`);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-peach-300 p-2 rounded-full hover:bg-navy-700 transition shadow-xl"
        >
          <Search className="text-black" size={18} />
        </button>
      </div>

    {showDropdown && dropdownRect &&
                ReactDOM.createPortal(
                  <div
                    ref={dropdownRef}
                    style={{
                      position: 'fixed',
                      left: dropdownRect.left,
                      top: dropdownRect.top,
                      width: dropdownRect.width,
                      zIndex: 9999,
                    }}
                  >
                    <ul className="bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto text-left">
                      {suggestions.length > 0 ? (
                        suggestions.map((item, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-peach-100 cursor-pointer flex justify-between text-navy-700 text-sm"
                            onClick={() => handleSelect(item)}
                          >
                            <span>{item.name}</span>
                            <ArrowRight size={14} className="text-peach-300" />
                          </li>
                        ))
                      ) : (
            searchTerm && (
                          <li className="p-4 text-gray-500 text-sm">No services found for "{searchTerm}".</li>
                        )
                      )}
                    </ul>
                  </div>,
                  document.body
                )
              }
            </div>

    {/* Right-side hero image (does not increase hero height) */}
 <div className="hidden md:block absolute right-6 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
              <div className="w-56 md:w-72 lg:w-80 max-h-[220px] overflow-hidden rounded-3xl shadow-2xl bg-white/0">
                <img
                  src={normalizeImageUrl(heroImage)}
                  alt="Hero visual"
                  className="w-full h-full object-contain"
                  aria-hidden
                  onError={(e) => {
                    e.currentTarget.src = '/kushi.png';
                    setHeroImage('/kushi.png');
                  }}
                />
              </div>
            </div>

    {/* --- Action Buttons --- */}
    <div className="flex flex-row flex-wrap justify-start gap-3 order-2 md:order-2">
      <Link
        to="/contact"
         className="bg-navy-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-navy-600 transition-colors flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 whitespace-nowrap"
         >
        <Phone size={16} />
        Get Free Quote
      </Link>
     <Link
        to="/services"
         className="bg-transparent border-2 border-peach-300 text-black px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-peach-300 hover:text-navy-900 transition-colors flex items-center justify-center gap-2 transform hover:scale-105 whitespace-nowrap"
           >
        Explore All Services
        <ArrowRight size={16} />
      </Link>
    </div>
  </div>
</div>
  {/* --- Trust Bar (Unchanged) --- */}
  <div className="relative w-full bg-white/10 backdrop-blur-md border-t border-b border-peach-300/50 py-1.5 z-10 mt-3">
    <div className="max-w-10xl mx-auto px-3 lg:px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center space-x-2 text-black justify-center">
        <Shield size={18} className="text-peach-300" />
        <span className="text-xs font-semibold">100% Insured & Bonded</span>
      </div>
      <div className="flex items-center space-x-2 text-black justify-center">
        <Star size={20} className="text-peach-300 fill-peach-300" />
        <span className="text-xs font-semibold">500+ Verified Reviews</span>
      </div>
      <div className="flex items-center space-x-2 text-black justify-center">
        <Clock size={20} className="text-peach-300" />
        <span className="text-xs font-semibold">Same-Day Availability</span>
      </div>
      <div className="flex items-center space-x-2 text-black justify-center">
        <CheckCircle size={20} className="text-peach-300" />
        <span className="text-xs font-semibold">Satisfaction Guaranteed</span>
      </div>
    </div>
  </div>
</section>

{/* Glow Utility Class */}
<style>
{`
  .shadow-peachGlow {
    box-shadow: 0 0 20px rgba(255, 183, 134, 0.7),
                0 0 30px rgba(255, 150, 100, 0.5);
  }
`}
</style>

{/* Service Categories Section */}
<section className="py-3 bg-white overflow-hidden">
  <div className="w-full px-2 sm:px-3 lg:px-4">

    {/* Section Header */}
    <div className="text-center mb-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
        Our{" "}
        <span className="bg-gradient-to-r from-navy-600 to-navy-700 bg-clip-text text-transparent">
          Premium Services
        </span>
      </h2>
      <p className="text-base text-navy-600 max-w-2xl mx-auto">
        Choose from our professional cleaning and maintenance services.
      </p>
    </div>

    {/* Looping Scroll Container */}
    <div
      className="flex w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >

      {/* Outer wrapper for scroll animation */}
      <div className={`flex space-x-6 ${isHovering ? '' : 'animate-marquee-scroll'}`}>

        {/* Duplicate for infinite loop */}
        {[...serviceCategories, ...serviceCategories].map((service, index) => {
          const categorySlug = createSlug(service.title);

          return (
            <div
              key={index}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
               onClick={() =>
        navigate(`/services/category/${categorySlug}`, { // <<-- Change /services to /services/category/:categorySlug
          state: { selectedCategory: service.title }
        })
      }
              className="
                group min-w-[200px] max-w-[200px] flex-shrink-0 rounded-2xl overflow-hidden 
                shadow-lg border-4 border-peach-300 cursor-pointer bg-white
               
              "
            >

              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>

              {/* Title */}
              <div className="p-1 text-center bg-white">
                <h3 className="text-sm font-semi-bold text-navy-700 group-hover:text-peach-300 transition-colors duration-300">
                  {service.title}
                </h3>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  </div>
</section>



{/* 🔹 Top Booked Services Section */}
<section className="py-2 bg-white w-full">
  <div className="w-full max-w-[100vw] overflow-hidden">
    <div className="text-center mb-8 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
        Top{" "}
        <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">
          5 Services
        </span>
      </h2>
      <p className="text-base text-navy-600 max-w-xl mx-auto">
        Our customers love these services the most!
      </p>
    </div>

    {topServicesLoading ? (
      <p className="text-center text-navy-600">Loading top booked services...</p>
    ) : topServicesError ? (
      <p className="text-center text-red-600">Error: {topServicesError}</p>
    ) : topServices.length === 0 ? (
      <p className="text-center text-navy-600">No top booked services found.</p>
    ) : (
      <div className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 py-1 no-scrollbar w-full">
        {topServices.map((service, index) => (
     <div
  key={index}
  onClick={() => handleClickTopService(service)}
  className="
    group relative flex-shrink-0 snap-start cursor-pointer
    min-w-[250px] max-w-[250px] sm:min-w-[280px] sm:max-w-[280px]
    transition-transform duration-500
  "
>
  {/* Hover Ring Wrapper */}
  <div
    className="
      bg-white rounded-2xl shadow-md p-[4px]
      
    "
  >
    {/* Image Wrapper */}
    <div className="relative h-[180px] overflow-hidden rounded-t-xl flex justify-center items-center bg-white">
      <img
        src={service.service_image_url || service.booking_service_image_url || '/logo.png'}
        alt={service.booking_service_name || service.service_name}
        className="
          w-full h-full object-cover object-center
          transition-transform duration-700 ease-out
          group-hover:scale-150
        "
      />

      {/* Arrow */}
      <div
        className="
          absolute bottom-2 right-2 opacity-0 translate-y-3
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-500 z-20
        "
      >
        <span className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow">
          ➜
        </span>
      </div>
    </div>

    {/* Title */}
    <div className="py-1 text-center bg-white rounded-b-xl">
      <h3
        className="
          text-sm font-bold text-navy-700
          group-hover:text-peach-600 group-hover:-translate-y-1
          transition-transform duration-500
        "
      >
        {service.booking_service_name || service.service_name}
      </h3>
    </div>
  </div>
</div>



        ))}
      </div>
    )}
  </div>
</section>



{/* Promotions Section (Scrollable Cards) */}
<section className="py-4 bg-white">
  <div className="w-full px-4 sm:px-6 lg:px-8 max-w-10xl mx-auto">
    <div className="text-center mb-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
        Special{" "}
        <span className="bg-gradient-to-r from-navy-600 to-navy-700 bg-clip-text text-transparent">
          Promotions & Offers
        </span>
      </h2>
      <p className="text-base text-navy-600 max-w-2xl mx-auto">
        Take advantage of our limited-time offers and packages for premium services.
      </p>
    </div>

    {/* REVISED CONTAINER: Switched from grid to flex for horizontal scrolling */}
    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"> {/* Added space-x-6 for gap and overflow-x-auto for scrolling */}
      {promotions.map((promo, index) => (
        <Link
          key={index}
          to={promo.link}
          // ADDED CLASSES: min-w-72 ensures a fixed width, flex-shrink-0 stops shrinking
          className="group relative rounded-2xl overflow-hidden shadow-xl hover:scale-[1.02] transform transition-transform duration-300 min-w-72 flex-shrink-0"
        >
          {/* Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={promo.image}
              alt={promo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`}></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            <h3 className="text-xl font-bold mb-2 leading-snug">{promo.title}</h3>
            <p className="text-sm mb-4 opacity-90 line-clamp-2">{promo.description}</p>
            <div className="inline-flex items-center gap-2 bg-white text-navy-700 font-bold px-4 py-2 rounded-lg text-sm self-start group-hover:bg-peach-300 transition-colors">
              {promo.cta}
              {/* Assuming ArrowRight is an imported component */}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>




      {/* Features Section - Why Choose Kushi Services Section */}
 
  <FeaturesCarousel />

 





{/* --- Kushi Teamwork Carousel Section --- */}
<section className="py-2 bg-white">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8">
    
    </div>

    <div className="mt-6">
      <KushiTeamworkCarousel />
    </div>
  </div>
</section>


{/* ✅ Add Google Reviews Section Above Footer */}
<GoogleReviews />

    </div>
  );
};

export default HomePage;