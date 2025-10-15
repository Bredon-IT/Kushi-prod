import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock, CheckCircle, Star, Search, Home, Building, Bug, Wrench, Truck, MapPin, Phone } from 'lucide-react';
import RotatingOffers from '../components/RotatingOffers';
import axios from "axios";
import { KushiTeamworkCarousel } from '../components/KushiTeamworkCarousel';



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
}
const HomePage: React.FC = () => { 
  
 
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    { type: string; name: string; subcategory?: string; service?: Service }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

 const [heroImage, setHeroImage] = useState<string | null>("/logo.png"); // default image

const handleHeroImageUpdate = (imageUrl: string | null) => {
  setHeroImage(imageUrl || "/logo.png"); // fallback to default
};

 useEffect(() => {
    // Fetch all active services
    const fetchServices = async () => {
      try {
        const res = await fetch("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/customers/all-services");
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
                : `https://bmytsqa7b3.ap-south-1.awsapprunner.com${item.service_image_url}`
              : "/placeholder.jpg",
            description: item.service_description || "",
            features: item.features ? item.features.split(",") : [],
            active: item.active,
          }));
        setAllServices(mapped);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchServices();
  }, []);
 
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
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
const API_BASE_URL = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin"; // backend URL

// 🔹 Declare state variable
const [topServices, setTopServices] = useState<any[]>([]);

const getTopServices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/top-services`);
    setTopServices(response.data.topServices || response.data); // adjust if needed
  } catch (error) {
    console.error("Error fetching top services:", error);
  }
};

useEffect(() => {
  getTopServices(); // fetch when page loads
}, []);



  

 

  /** ---------------------------
   * Features Section Data
   ---------------------------- */
  const features = [
    {
      icon: Shield,
      title: 'Trusted & Certified',
      description: 'Fully licensed, bonded, and insured with industry certifications for your complete peace of mind.'
    },
    {
      icon: Sparkles,
      title: 'Premium Solutions',
      description: 'Advanced eco-friendly products and cutting-edge technology that deliver superior results.'
    },
    {
      icon: Clock,
      title: 'Reliable Service',
      description: 'Punctual and dependable service with guaranteed scheduling that respects your valuable time.'
    },
    {
      icon: CheckCircle,
      title: '100% Satisfaction',
      description: 'We guarantee exceptional results with our comprehensive quality assurance program.'
    }
  ];
  /** ---------------------------
   * Service Categories
   ---------------------------- */

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
      icon: Home,
      title: 'Other Services',
      description: 'Complete home cleaning solutions with premium eco-friendly products',
      price: 'Starting ₹999',
      image: 'https://tse4.mm.bing.net/th/id/OIP.2XIebCebLJVe7iwYKSvD4wHaFD?rs=1&pid=ImgDetMain&o=7&rm=3',
      link: '/services',
      gradient: 'from-peach-300 to-navy-700',
      services: ['Swimming Pool Cleaning', 'Paver Laying and Maintenance Services', 'Layout Development and Maintenance ', 'Borewell Motor Repair Services']
    },
    {
      icon: Truck,
      title: 'Packers & Movers',
      description: 'Professional packing and moving services with complete care',
      price: 'Starting ₹6,999',
      image: 'https://kushiservices.com/wp-content/uploads/2024/07/Blue-and-White-Illustrative-House-Cleaning-Service-Flyer-210-x-140-mm-5-1024x682.png',
      link: '/services',
      gradient: 'from-peach-300 to-navy-700',
      services: ['Home Shifting Services', 'Office Shifting Services']
    }
  ];


  {/* Add these at the top of your component */}
const scrollRef = React.useRef(null);

React.useEffect(() => {
  const scrollContainer = scrollRef.current;
  let scrollAmount = 0;
  const scrollStep = 1; // pixels per interval
  const interval = setInterval(() => {
    if (scrollContainer) {
      scrollAmount += scrollStep;
      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0; // reset scroll to start
      }
      scrollContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  }, 20); // adjust speed (ms)
  return () => clearInterval(interval);
}, []);
  

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
  }
];

/** ---------------------------
   * herosection background images
   ---------------------------- */


const heroImages = [
 
  "/slider_4.png",
  "/slider_5.png",
  "/slider_6.png",
  "/slider_7.png",
  "/slider_8.png",
  
];

const [currentImageIndex, setCurrentImageIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  }, 2000); // 2 seconds per image
  return () => clearInterval(interval);
}, []);

  /** ---------------------------
   * Testimonials
   ---------------------------- */

const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

 


   const testimonials = [
    {
      name: "Vinodh",
      text: "Kushi Services transformed my home completely! Their attention to detail and professional approach is unmatched. Highly recommended!",
    },
    {
      name: "Sharan Kumar",
      text: "Outstanding commercial cleaning service. They maintain our office space perfectly and their team is always punctual and professional.",
    },
    {
      name: "Priyanka",
      text: "Reliable, efficient, and thorough. Kushi Services has been our go-to cleaning partner for over 2 years. Excellent service quality!",
    },
    {
      name: "Divya",
      text: "Amazing deep cleaning service! My kitchen looks brand new. I appreciate their dedication and time management.",
    },
    {
      name: "Ravi Teja",
      text: "I’ve tried many services before, but Kushi stands out with their professionalism and affordability.",
    },
    {
      name: "Sowmya",
      text: "Their pest control service worked wonders! No issues since last treatment.",
    },
    {
      name: "Arjun",
      text: "Very friendly and efficient team. Quick response time and affordable rates.",
    },
    {
      name: "Meena",
      text: "Highly trustworthy staff. I was nervous at first, but their work exceeded expectations.",
    },
    {
      name: "Sandeep",
      text: "We use their services regularly for our office. Always punctual and reliable!",
    },
    {
      name: "Harika",
      text: "Loved the sofa shampooing service — it looks as good as new!",
    },
    {
      name: "Ramesh",
      text: "Affordable and professional. They even followed up after the job. Highly recommended.",
    },
    {
      name: "Kiran",
      text: "Prompt and polite staff. Booking was easy, and the results were excellent.",
    },
    {
      name: "Srilatha",
      text: "Kushi Services never disappoints. Always on time and deliver clean results.",
    },
    {
      name: "Prakash",
      text: "They did a great job cleaning my apartment before moving in. Highly satisfied!",
    },
    {
      name: "Nisha",
      text: "Exceptional service. I’ll definitely continue using their services regularly.",
    },
  ];



  

  return (
    <div>
      
{/* Rotating Offers */}
<RotatingOffers onHeroImageUpdate={handleHeroImageUpdate} />


{/* Hero Section with Auto Background Change and Left-Aligned Content */}
<section className="relative min-h-[6vh] flex flex-col justify-center overflow-hidden bg-navy-900">

  {/* --- Background Images (Auto Changing) --- */}
  <div className="absolute inset-0">
    <img
      src={heroImages[currentImageIndex]}
      alt="Professional cleaning and maintenance services background"
      className="w-full h-full object-cover object-center transition-opacity duration-1000"
    />
    {/* Overlay */}
    <div className="absolute inset-0 bg-navy-900/50"></div>
  </div>

  {/* --- Main Content (Left-Aligned) --- */}
  <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 text-left z-10 flex flex-col justify-center items-start">
    
    {/* Certification Badge */}
    <div className="inline-flex items-center gap-2 bg-peach-300/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-peach-300 mb-4 text-xs font-semibold text-white shadow-xl">
      <Star className="text-yellow-400 fill-current" size={14} />
      IAS Accredited Management System Certified Company
    </div>

    {/* Hero Headline */}
    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-3">
      <span className="text-white drop-shadow-2xl">
        Redefining Cleanliness <span className="text-peach-300">Elevating</span>
      </span>
      <br />
      <span className="bg-gradient-to-r from-peach-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
        Happiness
      </span>
    </h1>

    {/* Subheading */}
    <p className="text-base sm:text-lg text-white/90 max-w-xl mb-5 font-light drop-shadow-md">
      Professional, reliable, and trusted maintenance solutions for a spotless home and vibrant business.
    </p>

    {/* --- Search Bar (Unchanged Logic) --- */}
    <div className="max-w-xl w-full relative" ref={searchRef}>
      <div className="relative bg-white/30 backdrop-blur-sm rounded-full p-1.5 shadow-2xl border-4 border-peach-500/0 hover:border-peach-500 transition-all duration-300">
        <input
          type="text"
          placeholder="Search for Deep Cleaning, Plumbing, etc."
          className="w-full p-3 pr-14 rounded-full border-2 border-transparent focus:outline-none focus:border-peach-500 bg-transparent text-base text-white placeholder-white/80"
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
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-peach-500 p-2.5 rounded-full hover:bg-navy-700 transition shadow-xl"
        >
          <Search className="text-white" size={20} />
        </button>
      </div>

      {showDropdown && (
        <ul className="absolute bottom-full mb-2 z-30 w-full bg-white border border-gray-300 rounded-t-xl rounded-b-none shadow-2xl max-h-64 overflow-y-auto text-left">
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <li
                key={index}
                className="px-4 py-3 hover:bg-peach-100 cursor-pointer flex justify-between text-navy-700"
                onClick={() => handleSelect(item)}
              >
                <span>{item.name}</span>
                <ArrowRight size={16} className="text-peach-500" />
              </li>
            ))
          ) : (
            searchTerm && (
              <li className="p-4 text-gray-500">
                No services found for "{searchTerm}".
              </li>
            )
          )}
        </ul>
      )}
    </div>

    {/* --- Action Buttons --- */}
    <div className="flex flex-col sm:flex-row justify-start gap-4 pt-4">
      <Link
        to="/contact"
        className="bg-navy-700 text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-navy-600 transition-colors flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
      >
        <Phone size={18} />
        Get Free Quote
      </Link>

      <Link
        to="/services"
        className="bg-transparent border-2 border-peach-300 text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-peach-300 hover:text-navy-900 transition-colors flex items-center justify-center gap-2 transform hover:scale-105"
      >
        Explore All Services
        <ArrowRight size={18} />
      </Link>
    </div>
  </div>

  {/* --- Trust Bar (Unchanged) --- */}
  <div className="relative w-full bg-white/10 backdrop-blur-md border-t border-b border-peach-300/50 py-2 z-10 mt-4">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center space-x-2 text-white justify-center">
        <Shield size={20} className="text-peach-300" />
        <span className="text-xs sm:text-sm font-semibold">100% Insured & Bonded</span>
      </div>
      <div className="flex items-center space-x-2 text-white justify-center">
        <Star size={20} className="text-peach-300 fill-peach-300" />
        <span className="text-xs sm:text-sm font-semibold">500+ Verified Reviews</span>
      </div>
      <div className="flex items-center space-x-2 text-white justify-center">
        <Clock size={20} className="text-peach-300" />
        <span className="text-xs sm:text-sm font-semibold">Same-Day Availability</span>
      </div>
      <div className="flex items-center space-x-2 text-white justify-center">
        <CheckCircle size={20} className="text-peach-300" />
        <span className="text-xs sm:text-sm font-semibold">Satisfaction Guaranteed</span>
      </div>
    </div>
  </div>
</section>




{/* Service Categories Section */}
<section className="py-12 bg-white">
  <div className="w-full px-2 sm:px-3 lg:px-4">
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

    {/* Horizontal Scroll */}
    <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2 no-scrollbar">
      {serviceCategories.map((service, index) => (
        <Link
          key={index}
          to={service.link}
          className="group min-w-[200px] max-w-[200px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-peach-300 snap-start hover:scale-105 transform transition-transform"
        >
          {/* Image */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Service Name */}
          <div className="p-3 text-center bg-white">
            <h3 className="text-lg font-bold text-navy-700 group-hover:text-peach-300 transition-colors">
              {service.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>


{/* --- Kushi Teamwork Carousel Section --- */}
<section className="py-4 bg-white">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8">
    
    </div>

    <div className="mt-6">
      <KushiTeamworkCarousel />
    </div>
  </div>
</section>


{/* 🔹 Top Booked Services Section */}
{/* 🔹 Top Booked Services Section */}
<section className="py-12 bg-white w-full">
  <div className="w-full max-w-[100vw] overflow-hidden">
    {/* Heading */}
    <div className="text-center mb-8 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
        Top{" "}
        <span className="bg-gradient-to-r from-peach-400 to-peach-600 bg-clip-text text-transparent">
          Booked Services
        </span>
      </h2>
      <p className="text-base text-navy-600 max-w-2xl mx-auto">
        Our customers love these services the most!
      </p>
    </div>

    {/* Horizontal Scroll Section */}
    {topServices.length === 0 ? (
      <p className="text-center text-navy-600">Loading top booked services...</p>
    ) : (
      <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 py-4 no-scrollbar w-full">
        {topServices.map((service, index) => (
          <div
            key={index}
            className="group min-w-[250px] max-w-[250px] sm:min-w-[280px] sm:max-w-[280px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-peach-300 snap-start bg-white hover:scale-105 transform transition-transform duration-300"
          >
            {/* Service Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={service.service_image_url || "/logo.png"}
                alt={service.booking_service_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Service Details */}
            <div className="p-3 text-center bg-white">
              <h3 className="text-lg font-bold text-navy-700 group-hover:text-peach-500 transition-colors">
                {service.booking_service_name}
              </h3>
              <p className="text-navy-600 text-sm mt-1 line-clamp-2">
                {service.service_description || "No description available"}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</section>



    
{/* Promotions Section (Scrollable Cards) */}
<section className="py-12 bg-white">
  <div className="w-full px-4 sm:px-6 lg:px-8">
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

    {/* Horizontal Scroll Promotions */}
    <div
      className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2 no-scrollbar"
      ref={scrollRef}
    >
      {promotions.map((promo, index) => (
        <Link
          key={index}
          to={promo.link}
          className="group relative min-w-[400px] flex-shrink-0 rounded-2xl overflow-hidden shadow-xl snap-start hover:scale-105 transform transition-transform duration-300"
        >
          {/* Image */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={promo.image}
              alt={promo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient}`}></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
            <h3 className="text-3xl font-bold mb-3 leading-tight">{promo.title}</h3>
            <p className="text-lg mb-6 opacity-90">{promo.description}</p>
            <div className="inline-flex items-center gap-2 bg-white text-navy-700 font-bold px-6 py-3 rounded-lg self-start group-hover:bg-peach-300 transition-colors">
              {promo.cta}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>







      {/* Features Section */}
     {/* 🌟 Why Choose Kushi Services Section */}
<section className="py-10 bg-gradient-to-b from-white to-peach-50">
  <div className="w-full px-6 lg:px-12 mx-auto max-w-7xl">

    {/* Heading */}
    <div className="text-center mb-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-3">
        Why Choose{" "}
        <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">
          Kushi Services
        </span>
        ?
      </h2>
      <p className="text-base sm:text-lg text-navy-700 max-w-2xl mx-auto leading-relaxed">
        We bring excellence, trust, and innovation to every cleaning task — making your spaces shine with perfection.
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div
            key={index}
            className="group flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-peach-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            {/* Icon */}
            <div className="w-14 h-14 mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-peach-300 to-navy-700 text-white shadow-md group-hover:scale-110 transition-transform">
              <IconComponent size={22} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-navy-700 group-hover:text-peach-300 transition-colors mb-1">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-navy-600 leading-snug">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>

  </div>
</section>


  {/* Testimonials Section */}
{/* Testimonials Section */}
<section className="py-12 bg-white">
  <div className="w-full px-2 sm:px-3 lg:px-4">
    <div className="text-center mb-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-2">
        What Our{" "}
        <span className="bg-gradient-to-r from-peach-700 to-navy-700 bg-clip-text text-transparent">
          Customers Say
        </span>
      </h2>
      <p className="text-lg text-navy-700 max-w-3xl mx-auto">
        Don't just take our word for it - hear from our satisfied customers who trust Kushi Services.
      </p>
    </div>

    {/* Horizontal Scroll */}
    <div className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 py-2 no-scrollbar">
      {testimonials.map((testimonial, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            className="group relative min-w-[220px] max-w-[220px] flex-shrink-0 snap-start rounded-xl p-3 bg-white border-2 border-peach-300 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col"
          >
            {/* Name */}
            <h4 className="font-semibold text-navy-700 text-base mb-1">
              {testimonial.name}
            </h4>

            {/* Ratings */}
            <div className="flex mb-1">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="text-yellow-500 fill-current"
                />
              ))}
            </div>

            {/* Text (Expandable) */}
            <p className="text-navy-700 italic text-sm mb-2 transition-all duration-300 ease-in-out">
              {isExpanded
                ? testimonial.text
                : testimonial.text.length > 80
                ? testimonial.text.slice(0, 80) + "..."
                : testimonial.text}
            </p>

            {/* Read More / Show Less */}
            {testimonial.text.length > 80 && (
              <button
                onClick={() =>
                  setExpandedIndex(isExpanded ? null : index)
                }
                className="text-peach-500 text-sm font-semibold hover:underline mt-auto self-start"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  </div>
</section>



      {/* Call to Action Section */}
      
     <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-6">
            Ready for <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Premium Service</span>?
          </h2>
          <p className="text-xl text-navy-700 mb-8">
            Experience the Kushi Services difference today. Get instant quotes, schedule services, 
            or speak with our experts for a personalized cleaning solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-peach-300 hover:to-navy-700 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
            >
              <Phone size={20} />
              Get Free Quote
            </Link>
            <Link
              to="/services"
              className="border-2 border-navy-600 text-navy-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-navy-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              View All Services
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-peach-300">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-navy-700">
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-peach-300" />
                <span className="font-semibold">9606999081/82/83/84/85</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-peach-300" />
                <span>No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-peach-300" />
                <span>24/7 Emergency Service</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;