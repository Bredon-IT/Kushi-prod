import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock, CheckCircle, Star, Search, Home, Building, Bug, Wrench, Truck, MapPin, Phone } from 'lucide-react';
import RotatingOffers from '../components/RotatingOffers';


const HomePage: React.FC = () => {
  
 
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null); // A ref to detect clicks outside the search bar

 const [heroImage, setHeroImage] = useState<string | null>("/logo.png"); // default image

const handleHeroImageUpdate = (imageUrl: string | null) => {
  setHeroImage(imageUrl || "/logo.png"); // fallback to default
};


   /** ---------------------------
   * Search Suggestions
   ---------------------------- */
  const searchSuggestions = [
   'Residential cleaning services',
	'Home Deep Cleaning Services',
  'Kitchen Cleaning Services',
  'Fridge Cleaning Services',
  'Bathroom Cleaning Services', 
  'Carpet Cleaning Services',
  'Sofa Cleaning Services',
  'Mattress cleaning Services',
  'Window Cleaning Services',
  'Balcony Cleaning Services',
  'Hall Cleaning Services',
  'Bedroom Cleaning Services',
  'Exterior Cleaning',
  'Water Sump Cleaning and Water Tank Cleaning',
  'Floor Deep Cleaning Services',
  'Commercial Cleaning Services',
  'Office Cleaning Services',
  'Office Carpet Cleaning Services',
  'Office Chair Cleaning Services',
  'Hotel and restaurant cleaning',
  'Factory Cleaning Services',
  'Warehouse Cleaning Services',
  'Pest Control Services',
  'Cockroach Pest Control',
  'Bedbug Pest Control',
  'Termite Treatment',
  'Woodborer Pest Control',
  'Rodent Pest Control',
  'Mosquito Pest Control',
  'General Pest Control',
  'Commercial Pest Control',
  'AMC Pest Control',

  'Marble Polishing Services',
  'Indian Marble Polishing Services',
  'Italian Marble Polishing Services',
  'Mosaic Tile Polishing Services',

  'Packers And Movers',
  'Home Shifting Services',
  'Office Shifting Services',

  'Other Services',
  'Borewell Motor Repair Services',
  'Swimming Pool Cleaning Services',
  'Paver Laying and Maintenance Services',
  'Layout Development and Maintenance Services'


  ];

  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchDropdown(false);
    navigate(`/services?search=${encodeURIComponent(suggestion)}`);
  };

  // Effect to handle clicks outside the search bar and dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarRef]);

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
   * Testimonials
   ---------------------------- */


  const testimonials = [
    {
      name: 'Vinodh',
      role: 'Homeowner',
      rating: 5,
      text: 'Kushi Services transformed my home completely! Their attention to detail and professional approach is unmatched. Highly recommended!'
    },
    {
      name: 'Sharan Kumar',
      role: 'Business Owner',
      rating: 5,
      text: 'Outstanding commercial cleaning service. They maintain our office space perfectly and their team is always punctual and professional.'
    },
    {
      name: 'Priyanka',
      role: 'Property Manager',
      rating: 5,
      text: 'Reliable, efficient, and thorough. Kushi Services has been our go-to cleaning partner for over 2 years. Excellent service quality!'
    }
  ];


  return (
    <div>
      
      {/* Rotating Offers */}
  <RotatingOffers onHeroImageUpdate={handleHeroImageUpdate} />

      {/* Hero Section */}
<section className="min-h-[80vh] flex items-center relative overflow-hidden bg-pink-50 pt-4 lg:pt-8">
 {/* Optional subtle background shapes */}

 
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    <div className="absolute top-16 left-16 w-60 h-60 bg-peach-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
    <div className="absolute top-32 right-16 w-60 h-60 bg-navy-700 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
    <div className="absolute bottom-16 left-1/2 w-60 h-60 bg-peach-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
  </div>

  <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      
      {/* Left Content */}
      <div className="space-y-6 lg:space-y-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-peach-300 to-navy-500 px-4 py-1.5 rounded-full border border-peach-300 text-sm font-semibold text-navy-700">
          <Star className="text-yellow-500 fill-current" size={16} />
          IAS Accredited Management System Certified Company
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-navy-700 to-navy-600 bg-clip-text text-transparent">
            Redefining Cleanliness
          </span>
          <br />
          <span className="bg-gradient-to-r from-navy-700 to-navy-600 bg-clip-text text-transparent">
            Elevating 
          </span>
          <br />
           <span className="bg-gradient-to-r from-navy-700 to-navy-600 bg-clip-text text-transparent">
            Happiness
          </span>
        </h1>

        {/* Search Bar */}
        <div ref={searchBarRef} className="relative max-w-md">
          <div className="bg-white p-3 rounded-full shadow-lg border-2 border-peach-300">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search for cleaning services..."
                  className="w-full pl-10 pr-4 py-2 text-lg border-0 focus:ring-0 focus:outline-none rounded-xl bg-peach-50/50"
                />
              </div>
            </div>
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchQuery.length > 0 && filteredSuggestions.length > 0 && (
            <div className="absolute top-full w-full mt-2 bg-white rounded-xl shadow-xl border-2 border-peach-300 z-50">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-peach-50 transition-colors border-b border-peach-300 last:border-b-0 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-navy-600" />
                    <span className="text-navy-700">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/services"
            className="bg-gradient-to-r from-navy-700 to-peach-300 text-white px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
          >
            Explore All Services
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/contact"
            className="bg-gradient-to-r from-navy-700 to-peach-300 text-white px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
          >
            <Phone size={20} />
            Get Free Quote
          </Link>
        </div>
      </div>

     {/* Right Image */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md">
            <img
              src={heroImage}
              alt="Hero Banner"
              className="w-full h-auto object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
      </div>

    </div>
  </div>
</section>


{/* Service Categories Section */}
<section className="py-12 bg-pink-50">
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



    {/* Promotions Section (Scrollable Cards) */}
<section className="py-12 bg-pink-50">
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
    <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2 no-scrollbar">
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
      <section className="py-12 bg-pink-50">
        <div className="w-full px-2 sm:px-3 lg:px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Kushi Services</span>?
            </h2>
            <p className="text-xl text-navy-700 max-w-3xl mx-auto">
              With years of experience and a commitment to perfection, we provide reliable, 
              professional cleaning solutions that exceed the highest industry standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-peach-50 hover:to-navy-50 transition-all transform hover:-translate-y-2 border-2 border-peach-300 shadow-lg hover:shadow-xl"
                >
                  <div className="bg-gradient-to-r from-peach-300 to-navy-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-navy-700 mb-4">{feature.title}</h3>
                  <p className="text-navy-700">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-4">
              What Our <span className="bg-gradient-to-r from-peach-700 to-navy-700 bg-clip-text text-transparent">Customers Say</span>
            </h2>
            <p className="text-xl text-navy-700 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers who trust Kushi Services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-peach-50 to-navy-50 rounded-2xl p-6 border-2 border-peach-300 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="mb-4">
                  <h4 className="font-bold text-navy-700 text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-navy-700">{testimonial.role}</p>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-navy-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      
     <section className="py-12 bg-pink-50">
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