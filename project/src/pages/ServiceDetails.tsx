import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  ArrowLeft,
   ChevronLeft, 
   ChevronRight,
  ArrowRight,
  CheckCircle,
  ShoppingCart,
  CalendarCheck,
  ClipboardList,
  XCircle,
  Heart,
  Zap,
} from "lucide-react";
import { KushiTeamworkCarousel } from "../components/KushiTeamworkCarousel";
import Global_API_BASE from "../services/GlobalConstants";
import GoogleReviews from "../components/GoogleReviews";


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
    description:'With our skilled kitchen chimney cleaning services, you can restore suction power and get rid of grease buildup. To guarantee smoke-free cooking and better kitchen hygiene, we thoroughly clean filters, ducts, and hoods using non-toxic, safe techniques. Our service, which is trusted by residences and dining establishments, keeps your kitchen fresh and your chimney operating efficiently.',
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
    description:'Use our expert microwave oven cleaning services to guarantee hygienic and safe cooking. We use non-toxic, food-safe products to remove food stains, grease, and smells from all interior surfaces. Our service, which is perfect for both residential and commercial kitchens, restores the cleanliness and functionality of your microwave in a single visit.',
    image:"https://thumbs.dreamstime.com/b/anti-grease-spray-hand-girl-who-cleaning-kitchen-microwave-oven-dirt-modern-antistatic-agent-334440744.jpg",
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
    description:'Use our professional exhaust fan cleaning services to maintain fresh, clean air in your kitchen or bathroom. To restore ideal airflow and lower the risk of a fire, we remove grease, dust, and grime accumulation. Our skilled experts make sure your exhaust fan operates smoothly and effectively by using safe, efficient techniques.',
    image:"https://www.wikihow.com/images/thumb/e/e5/Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg/v4-460px-Clean-a-Kitchen-Exhaust-Fan-Step-6-Version-2.jpg",
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
    image:"https://tse4.mm.bing.net/th/id/OIP.gBHvUlKTqQsxNndmeVyfpQHaHf?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "mini-5",
    name: "Fridge Cleaning (200-500ltr)",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 549,
    rating: 4.8,
    reviews: "150",
    description:'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image:"https://images.airtasker.com/v7/https://airtasker-seo-assets-prod.s3.amazonaws.com/en_AU/1724116114503-fridge-cleaning.jpg",
  },
  {
    id: "mini-6",
    name: "Fridge Cleaning (500-1000ltr)",
    category: "Residential Cleaning Services",
    subcategory: "Kitchen Cleaning Services",
    price: 799,
    rating: 4.8,
    reviews: "150",
    description:'Use our expert fridge cleaning services to keep your refrigerator odor-free, hygienic, and fresh. We use eco-friendly, food-safe products to remove spills, stains, and bacteria from all surfaces, including shelves, trays, and seals. Perfect for commercial and residential kitchens. With professional deep cleaning from Kushi Services, you can guarantee safe food storage.',
    image:"https://c8.alamy.com/comp/2GNEE46/the-man-cleaning-fridge-in-hygiene-concept-2GNEE46.jpg",
  },
]; 


// --- Interface for Service Data ---
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
  badge?: string;
  overview?: string;
  our_process?: string;
  benefits?: string;
  whats_included?: string;
  whats_not_included?: string;
  why_choose_us?: string;
  kushi_teamwork: string;
  faq: string;
}



//  Added CartItem interface as required by cartUpdater 
interface CartItem extends Service {
 quantity: number;
 tier?: string; // Added tier to represent the selected package name
}
 
// Define the keys for all tabs
type TabKey = "overview" | "process" | "benefits" | "teamwork" |"why_choose_us"|"faq";
 
const ServiceDetails: React.FC = () => {
  const { subcategory } = useParams<{ subcategory: string }>();
  const navigate = useNavigate();
  const location = useLocation();
 
  // Pre-fetched data passed via navigation state
  const preFetchedServices = location.state?.services as Service[] | undefined;

   //  Retrieve the cartUpdater function 
 const cartUpdater = location.state?.cartUpdater as ((updatedItem: CartItem) => void) | undefined;

 
  const [services, setServices] = useState<Service[]>(preFetchedServices || []);
  const [loading, setLoading] = useState(!preFetchedServices);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<{ name: string; price: string; description: string }[]>([]);

  const [selectedPackage, setSelectedPackage] = useState<{
  name: string;
  price: string;
  description: string;
  isInspection: boolean;
} | null>(null);

 
 const [allServicesList, setAllServicesList] = useState<Service[]>([]);
  const [otherServices, setOtherServices] = useState<Service[]>([]);
  const [otherSubcategories, setOtherSubcategories] = useState<any[]>([]);
 
  // State to hold the currently selected service for detail view (null shows list)
  const [selectedService, setSelectedService] = useState<Service | null>(null);
 
  // Tab states
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [hovered, setHovered] = useState<"equipment" | "chemicals" | null>(null);
 
  // REFS: Used to detect clicks outside the tab container
  const contentRef = useRef<HTMLDivElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
 
 
  const [showFullDescription, setShowFullDescription] = useState(false);
 
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // Start before the first step
    const processSteps = selectedService?.our_process?.split("\n\n") || [];

const [activeInclusionTab, setActiveInclusionTab] = useState<"included" | "not_included" | null>(null);
 
 
//benefits code:
 
const [showAllBenefitsSummary, setShowAllBenefitsSummary] = useState(false);
const [showTypingIndicator, setShowTypingIndicator] = useState(false);
const [visibleBenefitCount, setVisibleBenefitCount] = useState(0);


const miniRef = useRef<HTMLDivElement>(null);
const similarRef = useRef<HTMLDivElement>(null);
const otherRef = useRef<HTMLDivElement>(null);


 useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);

const isInspectionCategory = (category?: string) => {
  if (!category) return false;

  const normalized = category
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  return (
    normalized === "commercial cleaning services" ||
    normalized === "industrial cleaning services" ||
    normalized === "marble polishing services" ||
    normalized === "packers and movers"
  );
};



 //BENEFITS CODE :
useEffect(() => {
    const benefitsArray = selectedService?.benefits?.split('\n').filter(b => b.trim() !== "") || [];
   
    if (activeTab === "benefits" && benefitsArray.length > 0) {
        // Reset states for a fresh start
        setShowTypingIndicator(false);
        setVisibleBenefitCount(0);
       
        // 1. Show Typing Indicator briefly
        const typingDelay = setTimeout(() => {
            setShowTypingIndicator(false);
            setShowAllBenefitsSummary(true); // Now we transition to the permanent list state
        }, 1500); // Wait 1.5 seconds for "typing"
 
        // 2. Start Staggered Display (after summary state is true)
        const staggerDelay = setTimeout(() => {
            let count = 0;
            const interval = setInterval(() => {
                count++;
                if (count <= benefitsArray.length) {
                    setVisibleBenefitCount(count);
                } else {
                    clearInterval(interval);
                }
            }, 300); // Adjust this time (in ms) to change the speed of staggered appearance
 
            return () => clearInterval(interval);
        }, 200 + 200); // Start staggering 0.5s after typing ends
 
        return () => {
            clearTimeout(typingDelay);
            clearTimeout(staggerDelay);
            // The interval inside staggerDelay is cleared by its return function
           
            // Reset states when leaving the tab
            setShowAllBenefitsSummary(false);
            setShowTypingIndicator(false);
            setVisibleBenefitCount(0);
        };
    } else if (activeTab === "benefits" && benefitsArray.length === 0) {
        // Ensure everything is hidden if no data exists
        setShowAllBenefitsSummary(false);
        setShowTypingIndicator(false);
        setVisibleBenefitCount(0);
    }
}, [activeTab, selectedService]);
 
//END BENEFITS CODE
 
 
 // 2. Effect for the animation timing
    useEffect(() => {
        // Reset index when changing tabs or services
        setCurrentStepIndex(-1);
    }, [activeTab, selectedService]); // Dependency array ensures reset on tab/service change
   
    useEffect(() => {
        // Only run this logic when the 'process' tab is active
        if (activeTab === 'process' && currentStepIndex < processSteps.length) {
            // Check if all steps have been displayed. If so, stop the timer.
            if (currentStepIndex === processSteps.length - 1) {
                // All steps are constant now, nothing more to do.
                return;
            }
           
            // Set a timer to reveal the next step after a delay
            const timer = setTimeout(() => {
                setCurrentStepIndex(prevIndex => prevIndex + 1);
            }, 200); // 0.2 seconds delay between showing steps
           
            return () => clearTimeout(timer); // Cleanup the timer on unmount/re-run
        }
        // If the tab is not 'process', the effect will clean up or not run.
    }, [activeTab, currentStepIndex, processSteps.length]);
    //----
  // --- Logic for Click Outside to close tab content ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // If the click is not inside the entire tab section (buttons OR content), hide the content.
        if (contentRef.current && !contentRef.current.contains(event.target as Node) &&
            tabContainerRef.current && !tabContainerRef.current.contains(event.target as Node) &&
            isContentVisible
        ) {
            setIsContentVisible(false);
        }
    };
 
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isContentVisible]);
 
 
  // --- Event Handlers ---
 
    const handleBookNow = () => {
    if (!selectedService) {
      navigate("/booking");
      return;
    }

   const isCategoryInspection = isInspectionCategory(selectedService.category);


    // 👉 If current package is an inspection/visit, also treat as inspection
    const isPackageInspection = !!selectedPackage?.isInspection;

    const isInspectionService =
  isCategoryInspection || isPackageInspection || selectedService.price <= 0;


    if (isInspectionService) {
      navigate("/inspection-booking", { state: { selectedService } });
    } else {
      navigate("/booking", { state: { selectedService } });
    }
  };

 
  const handleAddToCart = (service: Service) => {
    const cartItem = {
      ...service,
      quantity: 1,
       cartItemId: Date.now().toString() + Math.random().toString().slice(2),
  };
 
    let existingCart = JSON.parse(localStorage.getItem("kushiServicesCart") || "[]");

  const fromCartEdit = location.state?.fromCartEdit === true;
  const editCartItemId = location.state?.editCartItemId;

  if (fromCartEdit && editCartItemId) {
    // 🔥 Only remove THIS card the user is editing
    existingCart = existingCart.filter((item: any) => item.cartItemId !== editCartItemId);
  }

  // Add new one (always)
  existingCart.push(cartItem);

  localStorage.setItem("kushiServicesCart", JSON.stringify(existingCart));

  navigate("/cart");
};
 
  // Toggle content visibility logic
  const handleTabClick = (tabKey: TabKey) => {
    if (activeTab === tabKey) {
        // If clicking the currently active tab, TOGGLE visibility
        setIsContentVisible(prev => !prev);
    } else {
        // If clicking a NEW tab, set active tab and ensure visibility is TRUE
        setActiveTab(tabKey);
        setIsContentVisible(true);
    }
    setOpenFaqIndex(null); // Reset FAQ state on tab change
  };
 
 
  // Function called when user clicks "View Details" on a service card
   const handleCardClick = (service: Service) => {

  // ✅ Force inspection-only for these categories
 const isInspection = isInspectionCategory(service.category);

if (isInspection) {
  setPackages([]);
  setSelectedPackage(null);
  setSelectedService(service);
  setActiveTab("overview");
  setIsContentVisible(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}




    const pkgs =
      service.service_package && service.service_package.trim() !== ""
        ? service.service_package.split(";").map((pkg) => {
            const [name, price, description] = pkg.split(":");

            // 👉 Treat as inspection if no numeric price or contains these words
            const lower = (price || "").toLowerCase();
            const isInspection =
              !price ||
              isNaN(Number(price)) ||
              lower.includes("inspection") ||
              lower.includes("visit");

            return {
              name: name || "",
              price: price || "",
              description: description || "",
              isInspection,
            };
          })
        : [];

    setPackages(pkgs);

    if (pkgs.length > 0) {
      const firstPkg = pkgs[0];

      setSelectedPackage(firstPkg);

      setSelectedService({
        ...service,
        name: `${service.name} (${firstPkg.name})`,
        price: firstPkg.isInspection ? 0 : Number(firstPkg.price),
        description: firstPkg.description || service.description,
      });
    } else {
      // No packages (Commercial / Industrial)
      setSelectedPackage(null);
      setSelectedService(service);
    }

    setActiveTab("overview");
    setIsContentVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

 
 
    const handlePackageSelect = (pkg: {
    name: string;
    price: string;
    description: string;
    isInspection: boolean;
  }) => {
    if (!selectedService) return;

  if (isInspectionCategory(selectedService.category)) return;


    const originalService = services.find(
      (s) => s.id === selectedService.id
    );
    if (!originalService) return;

    setSelectedPackage(pkg);

    setSelectedService({
      ...selectedService,
      name: `${originalService.name} (${pkg.name})`,
      price: pkg.isInspection ? 0 : Number(pkg.price),
      description: pkg.description || originalService.description,
    });
  };

 
 // --- Data Fetching useEffect (UPDATED: Auto-open single service or when openDirectly is true) ---
useEffect(() => {
  if (!preFetchedServices) {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
 
        const res = await fetch(Global_API_BASE + "/api/customers/all-services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
 
        const mapped: Service[] = data.map((item: any, index: number) => ({
          id: item.service_id?.toString() || index.toString(),
          name: item.service_name || "Unnamed Service",
          category: item.service_category || "General",
          subcategory: item.service_type || "",
          service_package: item.service_package || "",
          price: item.service_cost || 0,
          originalPrice: item.originalPrice || item.price || 0,
          rating: parseFloat(item.rating) || 4.8,
          reviews: item.rating_count ? String(item.rating_count) : "0",
          duration: item.duration || "4-6 hours",
          image: item.service_image_url
            ? item.service_image_url.startsWith("http")
              ? item.service_image_url
              :  `Global_API_BASE${item.service_image_url}`
            : "/placeholder.jpg",
          description: item.service_description || "",
          features: item.features
            ? item.features.split(",")
            : ["Eco-Friendly Products", "Insured Service"],
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
 
        const filtered = mapped.filter(
          (s) =>
            s.subcategory.toLowerCase().replace(/\s/g, "-") ===
            subcategory?.toLowerCase()
        );
 
        setServices(filtered);
 
       
      } catch (err) {
        console.error(err);
        setError("Unable to load services.");
      } finally {
        setLoading(false);
      }
    };
 
    loadServices();
  } else if (preFetchedServices.length > 0 && !selectedService) {
    const filtered = preFetchedServices.filter(
      (s) =>
        s.subcategory.toLowerCase().replace(/\s/g, "-") ===
        subcategory?.toLowerCase()
    );
    setServices(filtered);
 
    
  }
}, [subcategory, preFetchedServices]);
// --- End of Updated useEffect ---



// -------- Fetch ALL SERVICES for "Other Services" section --------
useEffect(() => {
  const fetchAllServices = async () => {
    try {
      const res = await fetch(Global_API_BASE + "/api/customers/all-services");
      const data = await res.json();
 
      const mapped: Service[] = data.map((item: any, index: number) => ({
        id: item.service_id?.toString() || index.toString(),
        name: item.service_name || "Unnamed Service",
        category: item.service_category || "General",
        subcategory: item.service_type || "",
        service_package: item.service_package || "",
        price: item.service_cost || 0,
        originalPrice: item.originalPrice || item.price || 0,
        rating: parseFloat(item.rating) || 4.8,
        reviews: item.rating_count ? String(item.rating_count) : "0",
        duration: item.duration || "4-6 hours",
        image: item.service_image_url
          ? item.service_image_url.startsWith("http")
            ? item.service_image_url
            : `Global_API_BASE${item.service_image_url}`
          : "/placeholder.jpg",
        description: item.service_description || "",
        features: item.features
          ? item.features.split(",")
          : ["Eco-Friendly Products", "Insured Service"],
        overview: item.overview || "",
        our_process: item.our_process || "",
        benefits: item.benefits || "",
        whats_included: item.whats_included || "",
        whats_not_included: item.whats_not_included || "",
        why_choose_us: item.why_choose_us || "",
        kushi_teamwork: item.kushi_teamwork || "",
        faq: item.faq || "",
      }));
 
      setAllServicesList(mapped);
 
      if (selectedService) {
        const filtered = mapped.filter(
          (s) => s.category !== selectedService.category
        );
        setOtherServices(filtered.slice(0, 10)); // show only 10
// --- Build All Other Categories Subcategories ---
if (selectedService) {
  const otherCats = mapped.filter(s => s.category !== selectedService.category);
 
  const subMap = new Map();
 
  otherCats.forEach(s => {
    const key = s.subcategory;
    if (!subMap.has(key)) {
      subMap.set(key, {
        name: s.subcategory,
        image: s.image,
        rating: s.rating,
        reviews: s.reviews,
        category: s.category,
        serviceId: s.id,   // needed for view details
      });
    }
  });
 
  setOtherSubcategories(Array.from(subMap.values()));
}
 
 
 
      }
    } catch (error) {
      console.error("Error loading all services:", error);
    }
  };
 
  fetchAllServices();
}, [selectedService]);
 
 


// ✅ Open the correct service sent from ServiceList
useEffect(() => {
  const selectedServiceId = location.state?.selectedServiceId;

  if (!selectedServiceId) return;          // nothing to open
  if (selectedService) return;             // already opened
  if (services.length === 0) return;       // services not loaded yet

  const match = services.find(
    (s) => s.id.toString() === selectedServiceId.toString()
  );

  if (match) {
    handleCardClick(match);  // open correct service
  }
}, [services]);


useEffect(() => {
  if (miniRef.current && mockMiniServices.length > 0) {
    initScrollPosition(miniRef);
  }
}, [mockMiniServices.length]);

useEffect(() => {
  if (similarRef.current && selectedService) {
    initScrollPosition(similarRef);
  }
}, [selectedService]);


useEffect(() => {
  if (otherRef.current && otherSubcategories.length > 0) {
    initScrollPosition(otherRef);
  }
}, [otherSubcategories.length]);

 
 
   if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;
  if (services.length === 0)
    return (
      <div className="p-8 text-center">
        No services found for this subcategory.
      </div>
    );
 
  const similarServices = selectedService ? services
    .filter((s) => s.id !== selectedService.id)
    .slice(0, 3) : [];

      const isCommercialOrIndustrial =
  !!selectedService && isInspectionCategory(selectedService.category);


  // 👉 true when current selected package is inspection/visit
  const isInspectionPackage = !!selectedPackage?.isInspection;

  const hasNoPrice = !selectedService || selectedService.price <= 0;


 
  const allTabs: { key: TabKey, label: string }[] = [
     { key: "overview", label: "Equipments & Chemicals" },
     { key: "process", label: "Our Process" },
     { key: "benefits", label: "Benefits" },
     { key: "teamwork", label: "Teamwork" },
     { key: "why_choose_us", label: "Why Choose Us" },
     { key: "faq", label: "FAQs" },
   ];
 
  const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 bg-gray-100 p-2 rounded-full shadow-inner">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
    </div>
);

const initScrollPosition = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref.current) return;

  // ✅ Start from center so left & right work immediately
  ref.current.scrollLeft = ref.current.scrollWidth / 3;
};



const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollBy({ left: -300, behavior: "smooth" });
};

const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollBy({ left: 300, behavior: "smooth" });
};





  return (
    <div className="bg-white w-full">
     
 
      <div className="px-2 sm:px-2 lg:px-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-8 text-center capitalize">
          {subcategory?.replace(/-/g, " ")}
        </h1>
 
        {/* Conditional Rendering based on selectedService */}
        {selectedService ? (
          // --- Service Detail View ---
          <div className="mt-8">
            {/* Show “Back to all services” only if there are multiple services */}
 
            <div className=" max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 bg-white rounded-lg shadow-md overflow-hidden p-6 border border-gray-200 ">
              {/* Image & Packages */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                {packages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {packages.map((pkg, index) => (
                      <button
                        key={index}
                        onClick={() => handlePackageSelect(pkg)}
                        className={`px-4 py-3 border rounded-lg text-sm font-medium flex flex-col items-center justify-center text-center transition-colors
                          ${selectedService.name.includes(`(${pkg.name})`)
                            ? "bg-gradient-to-r from-peach-200 to-navy-700 border-peach-300 text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-peach-100 hover:border-peach-500"
                          }`}
                      >
                        <span className="mb-1">{pkg.name}</span>
                        <span className="text-gray-900 font-semibold">
  {pkg.isInspection ? pkg.price : `₹${pkg.price}`}
</span>

                      </button>
                    ))}
                  </div>
                )}
              </div>
 
              {/* Details & Actions */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedService.name}
                  </h2>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Star
                      size={16}
                      className="text-yellow-400 fill-yellow-400 mr-1"
                    />
                    <span>
                      {selectedService.rating} ({selectedService.reviews} reviews)
                    </span>
                  </div>
 
                 <p className="text-gray-700 mb-2">
                       {selectedService.description.length > 200
                        ? showFullDescription
                        ? selectedService.description
                       : `${selectedService.description.slice(0, 200)}...`
                       : selectedService.description
                   }
                </p>
                       {selectedService.description.length > 200 && (
                      <button
                       onClick={() => setShowFullDescription(prev => !prev)}
                       className="text-blue-600 font-medium hover:underline mb-6"
                      >
                       {showFullDescription ? "Read Less" : "Read More"}
                      </button>
                 )}
 
             


 
                {!isCommercialOrIndustrial && !isInspectionPackage && selectedService.price > 0 && (
  <div className="my-4">
    <span className="text-4xl font-bold text-gray-900">
      ₹{selectedService.price}
      {selectedService.originalPrice > selectedService.price &&
        selectedService.originalPrice > 0 && (
          <span className="text-gray-500 text-lg line-through ml-2">
            ₹{selectedService.originalPrice}
          </span>
        )}
    </span>
  </div>
)}

 
                </div>
 
 
               {/* Buttons: Add to Cart, Book Now, Get Quote */}        
               
  
    <div className="flex flex-wrap items-center gap-3 mt-2">
    {/* I changed space-x-3 to gap-3 and flex-wrap for better mobile handling with many buttons */}
       
        {/* Add to Cart: Hide for Commercial & Industrial */}
       {!isCommercialOrIndustrial && !isInspectionPackage && selectedService.price > 0 && (
  <button
    onClick={() => handleAddToCart(selectedService)}
    className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-green-400 to-green-600 text-white rounded-md shadow hover:opacity-90 transition"
  >
    <ShoppingCart size={16} /> Add to Cart
  </button>
)}

 
        {/* Book Now / Book Inspection */}
        <button
            onClick={handleBookNow}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md shadow hover:opacity-90 transition"
        >
            <CalendarCheck size={16} />
            {isCommercialOrIndustrial || isInspectionPackage || hasNoPrice
  ? "Book Inspection"
  : "Book Now"}


        </button>
 
        {/* Get Quote */}
             <button
                    onClick={() => {
                      if (!selectedService) return;
                      // clean name (remove package suffix like " (1BHK)")
                      const cleanName = selectedService.name.replace(/\s*\(.*\)$/, "").trim();
                      navigate("/contact", {
                        state: {
                          prefillService: selectedService.category, // full API category label
                          prefillSubcategory: cleanName, // service_name (clean)
                        },
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-md shadow hover:opacity-90 transition"
                  >
                    <ClipboardList size={16} /> Get Quote
                  </button>

 
        {/* Includes Button */}
        {selectedService.whats_included && (
            <button
                onClick={() => setActiveInclusionTab(prev => prev === 'included' ? null : 'included')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md shadow transition ${
                    activeInclusionTab === 'included'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
            >
                <CheckCircle size={16} /> Includes
            </button>
        )}
 
        {/* Excludes Button */}
        {selectedService.whats_not_included && (
            <button
                onClick={() => setActiveInclusionTab(prev => prev === 'not_included' ? null : 'not_included')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md shadow transition ${
                    activeInclusionTab === 'not_included'
                        ? 'bg-gradient-to-r from-pink-500 to-pink-700 text-white'
                        : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
            >
                <XCircle size={16} /> Excludes
            </button>
        )}
    </div>
 
    {/* The inclusion display logic remains here, below the buttons */}
 
    {(activeInclusionTab === 'included' && selectedService?.whats_included) ||
    (activeInclusionTab === 'not_included' && selectedService?.whats_not_included) ? (
        // This is the DIV that creates the box (border, background, padding)
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 transition-all duration-300">
           
            {/* Content for Included (only shows if 'included' is active) */}
            {activeInclusionTab === 'included' && selectedService.whats_included && (
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
                        <CheckCircle size={24} className="text-green-500" /> What's Included
                    </h3>
                    <ul className="space-y-2">
                        {selectedService.whats_included
                            .split("\n")
                            .map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2 text-gray-700"
                                >
                                    <CheckCircle
                                        size={18}
                                        className="text-green-500 mt-1 flex-shrink-0"
                                    />
                                    <span>{item}</span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
 
            {/* Content for Not Included (only shows if 'not_included' is active) */}
            {activeInclusionTab === 'not_included' && selectedService.whats_not_included && (
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
                        <XCircle size={24} className="text-red-500" /> What's Not Included
                    </h3>
                    <ul className="space-y-2">
                        {selectedService.whats_not_included
                            .split("\n")
                            .map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2 text-gray-700"
                                >
                                    <XCircle
                                        size={18}
                                        className="text-red-500 mt-1 flex-shrink-0"
                                    />
                                    <span>{item}</span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
 
    ) : null}
 
            </div>
            </div> 
 
 {/* --- MINI SERVICES  --- */}
{selectedService && (() => {
  const cart = JSON.parse(localStorage.getItem("kushiServicesCart") || "[]");

  const availableMiniServices = mockMiniServices.filter(
    service => !cart.some((item: any) => item.id === service.id)
  );

  if (availableMiniServices.length === 0) return null;

  return (
    <div className="mt-16 mb-4 w-full">

      <style>{`
        @keyframes mini-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-66.666%); }
        }
        .mini-marquee-track {
          animation: mini-marquee 40s linear infinite;
          will-change: transform;
        }
        .mini-marquee-container:hover .mini-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-navy-900 text-center">
          <span className="text-peach-600">Mini Services</span>
        </h2>
      </div>

    <div className="relative">

  {/* LEFT ARROW */}
  <button
    onClick={() => scrollLeft(miniRef)}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
  >
    <ChevronLeft size={22} />
  </button>

  {/* RIGHT ARROW */}
  <button
    onClick={() => scrollRight(miniRef)}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
  >
    <ChevronRight size={22} />
  </button>

  <div ref={miniRef} className="mini-marquee-container flex overflow-hidden py-4">
   

        <div className="flex mini-marquee-track" style={{ width: "300%" }}>

          {[...availableMiniServices, ...availableMiniServices, ...availableMiniServices].map(
            (service, index) => {
              return (
                <div
                  key={`${service.id}-${index}`}
                  className="flex-shrink-0 w-60 sm:w-72 mx-3 cursor-pointer"
                >
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl flex flex-col">

                    {/* Image */}
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Price Left + Add Button Right */}
                    <div className="px-3 pt-3 pb-2 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-snug">
                          {service.name}
                        </h3>

                        <div className="flex items-center text-xs text-gray-600">

                          {/* Price */}
                          <div className="text-xl font-bold text-peach-600">
                            ₹{service.price.toLocaleString("en-IN")}
                          </div>

                          {/* Add Button */}
                          <button
  onClick={() => {
    const newItem = {
      cartItemId:
        Date.now().toString() +
        Math.random().toString().slice(2),
      id: service.id,
      name: service.name,
      price: service.price,
      rating: service.rating,
      reviews: service.reviews,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory,
      tier: "",
      quantity: 1,
      duration: service.duration,
    };

    const existingCart = JSON.parse(
      localStorage.getItem("kushiServicesCart") || "[]"
    );

    existingCart.push(newItem);

    localStorage.setItem(
      "kushiServicesCart",
      JSON.stringify(existingCart)
    );

    navigate("/cart");   
  }}
  className="ml-auto flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg"
>
  <ShoppingCart size={14} /> Add
</button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
    </div>
  );
})()}
{/* --- END MINI SERVICES SECTION --- */}
 
 
 
           
{/* --- SIMILAR SERVICES (Full-Width Auto-Sliding Carousel) --- */}
{selectedService && similarServices.length > 0 && (
  <div className="mt-12 mb-10">
 
    <style>{`
      @keyframes marquee-seamless {
        0% { transform: translateX(0); }
        100% { transform: translateX(-75%); }
      }
      .animate-marquee-seamless {
        animation: marquee-seamless 40s linear infinite;
        will-change: transform;
      }
      .marquee-container:hover .animate-marquee-seamless {
        animation-play-state: paused;
      }
    `}</style>
 
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">
        Similar Services
      </h2>
    </div>
 
   <div className="relative">
<button
  onClick={() => scrollLeft(similarRef)}
  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
>
  <ChevronLeft size={22} />
</button>

<button
  onClick={() => scrollRight(similarRef)}
  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
>
  <ChevronRight size={22} />
</button>


  <div ref={similarRef} className="marquee-container flex overflow-hidden relative py-2">
   
      <div className="flex animate-marquee-seamless" style={{ width: "400%" }}>
 
        {[...similarServices, ...similarServices, ...similarServices, ...similarServices].map((service, index) => (
          <div
            key={`slide-${service.id}-${index}`}
            onClick={() => handleCardClick(service)}
            className="flex-shrink-0 w-56 sm:w-64 mx-2 cursor-pointer"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl">
             
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-28 object-cover"
              />
 
              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-800 mb-1 truncate">
                  {service.name}
                </h3>
 
                <div className="flex items-center text-[11px] text-gray-600 mb-1">
                  <Star size={11} className="text-yellow-400 fill-yellow-400 mr-1" />
                  <span>{service.rating} ({service.reviews})</span>
                </div>
 
                <button
                  onClick={(e) => { e.stopPropagation(); handleCardClick(service); }}
                  className="flex items-center gap-1 text-blue-600 text-xs font-semibold mt-1 hover:underline"
                >
                  View Details <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
 
      </div>
    </div>
 </div>
  </div>
)}
 
 
{/* --- OTHER SERVICES (Auto Sliding Marquee – Compact Size Like Similar Services) --- */}
{selectedService && otherSubcategories.length > 0 && (
  <div className="mt-8 mb-2">
 
    {/* Centered Title */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl font-bold text-navy-900 mb-1">
        Other Services
      </h2>
    </div>
 
    {/* Auto Sliding CSS */}
    <style>{`
      @keyframes other-marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .other-services-track {
        animation: other-marquee 40s linear infinite;
        will-change: transform;
      }
      .other-container:hover .other-services-track {
        animation-play-state: paused;
      }
    `}</style>
 
    {/* Slider */}
    <div className="relative">

  <button
    onClick={() => scrollLeft(otherRef)}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
  >
     <ChevronLeft size={22} />
  </button>

  <button
    onClick={() => scrollRight(otherRef)}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
  >
    <ChevronRight size={22} />
  </button>

  <div ref={otherRef} className="other-container overflow-hidden py-4">
    {/* existing sliding code */}

      <div className="flex other-services-track"
           style={{ width: "200%" }}>
 
        {/* Duplicate for seamless sliding */}
        {[...otherSubcategories, ...otherSubcategories].map((sub, idx) => {
          const urlSub = sub.name.toLowerCase().replace(/\s+/g, "-");
 
          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedService(null);
 
                const subServices = allServicesList.filter((s) => {
                  const routeSlug = s.subcategory.toLowerCase().replace(/\s+/g, "-");
                  const nameSlug = s.name.toLowerCase().replace(/\s+/g, "-");
                  return routeSlug === urlSub || nameSlug.includes(urlSub);
                });
 
                if (subServices.length === 1) {
                  navigate(`/services/${urlSub}`, {
                    state: {
                      services: subServices,
                      openDirectly: true,
                      selectedServiceId: subServices[0].id,
                    },
                  });
                  return;
                }
 
                navigate(`/services/${urlSub}`, {
                  state: { services: subServices, openDirectly: false },
                });
              }}
 
              className="flex-shrink-0 w-56 sm:w-64 mx-3 bg-white rounded-xl shadow-md
                         border border-gray-200 p-3 cursor-pointer hover:shadow-xl
                         hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={sub.image}
                alt={sub.name}
                className="w-full h-28 object-cover rounded-lg mb-2"
              />
 
              <h3 className="text-sm font-bold text-gray-800 truncate mb-1">
                {sub.name}
              </h3>
 
              <div className="flex items-center text-[11px] text-gray-600 mb-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                <span>{sub.rating} ({sub.reviews})</span>
              </div>
 
              <button
                onClick={(e) => {
                  e.stopPropagation();
 
                  setSelectedService(null);
 
                  const subServices = allServicesList.filter((s) => {
                    const routeSlug = s.subcategory.toLowerCase().replace(/\s+/g, "-");
                    const nameSlug = s.name.toLowerCase().replace(/\s+/g, "-");
                    return routeSlug === urlSub || nameSlug.includes(urlSub);
                  });
 
                  if (subServices.length === 1) {
                    navigate(`/services/${urlSub}`, {
                      state: {
                        services: subServices,
                        openDirectly: true,
                        selectedServiceId: subServices[0].id,
                      },
                    });
                    return;
                  }
 
                  navigate(`/services/${urlSub}`, {
                    state: { services: subServices, openDirectly: false },
                  });
                }}
 
                className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                View Details <ArrowRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </div>
  </div>
)}
 
 
            {/* --- Tabs Section --- */}
            {selectedService && (

            <div className="mt-8">
             
              {/* Tab Buttons Container */}
              <div
                ref={tabContainerRef}
                className="flex flex-wrap gap-4 p-4 justify-center"
              >
                {allTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`flex items-center gap-2 px-6 py-3 text-base font-bold rounded-full transition-all duration-300 shadow-md
                      ${
                        activeTab === tab.key && isContentVisible
                          // Active style
                          ? "bg-gradient-to-r from-peach-300 to-navy-700 text-white shadow-xl transform scale-105"
                          : "bg-gradient-to-r from-peach-300 to-navy-700 text-white hover:opacity-90"
                      }
                    `}
                  >
                  <span>{tab.label}</span>
                       {activeTab === tab.key && isContentVisible && (
                              <XCircle size={16} className="text-white" />
              )}
                               </button>
                ))}
              </div>
             
              {/* Tab Content Container */}
              {isContentVisible && (
                <div ref={contentRef} className="p-8 mt-4">
                 
 
 {activeTab === "overview" && selectedService && (
  <div className="max-w-10xl mx-auto relative bg-gradient-to-br from-yellow-50 to-pink-50 p-8 rounded-2xl shadow-lg font-sans overflow-visible">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10 tracking-wide">
          What we use in {selectedService.name}
        </h2>
 
    <div className="grid **grid-cols-1** **md:grid-cols-2** gap-6 **md:gap-10**"> 
        {/* Equipment Card */}
          <div
            className={`flex flex-col relative bg-white p-4 rounded-2xl shadow-md transition-all duration-300 overflow-hidden cursor-pointer ${
              hovered === "equipment" ? "h-auto max-h-[480px]" : "h-20"
            }`}
            onMouseEnter={() => setHovered("equipment")}
            onMouseLeave={() => setHovered(null)}
          >
        {/* Question */}
            <div className="flex items-center gap-4">
              <img
                src="/team-avatar.png"
                alt="Person asking"
                className="w-10 h-10 rounded-full border-2 border-peach-300 shadow-md"
              />
              <div className="font-medium text-gray-800 text-lg">
                The Equipment we use for cleaning
              </div>
            </div>
          
            {/* Answer */}
            {hovered === "equipment" && (
              <div className="mt-4 text-gray-800 space-y-3 pl-14 animate-fade-in">
                <p className="font-bold text-navy-800 mb-2"></p>
                {selectedService.overview
                  ?.split("\n\n")[0]
                  ?.split("\n")
                  .map((line, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="bold text-gray-700">{line.trim()}</span>
                    </div>
                  )) || (
                  <div className="flex items-start">
                    <span className="bold text-gray-700">
                    
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        
          {/* Chemicals Card */}
          <div
            className={`flex flex-col relative bg-white p-4 rounded-2xl shadow-md transition-all duration-300 overflow-hidden cursor-pointer ${
              hovered === "chemicals" ? "h-auto max-h-[480px]" : "h-20"
            }`}
            onMouseEnter={() => setHovered("chemicals")}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Question */}
            <div className="flex items-center gap-4">
              <img
                src="/team-avatar.png"
                alt="Person asking"
                className="w-10 h-10 rounded-full border-2 border-peach-300 shadow-md"
              />
              <div className="font-medium text-gray-800 text-lg">
                The Chemicals or cleaning products we use for cleaning
              </div>
            </div>
          
            {/* Answer */}
            {hovered === "chemicals" && (
              <div className="mt-4 text-gray-800 space-y-3 pl-14 animate-fade-in">
                <p className="font-bold text-navy-800 mb-2"></p>
                {selectedService.overview
                  ?.split("\n\n")[1]
                  ?.split("\n")
                  .map((line, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="bold text-gray-700">{line.trim()}</span>
                    </div>
                  )) || (
                  <div className="flex items-start">
                    <span className="bold text-gray-700">
                    
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* End Note */}
        <div className="text-center mt-10 text-lg font-medium text-gray-700 bold">
          “A clean home is a happy home — and we’re here to make yours shine!” 
        </div>
      </div>
    )}
 
 <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style> 
 
 {/* Our Process Tab*/}
{activeTab === "process" && (
  <div className="space-y-6 max-w-10xl mx-auto p-4 sm:p-0 relative">
    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 tracking-wide">
       Our Step-by-Step Process of {selectedService?.name}
    </h2>
 
   
 
    {/* Process Timeline/Story Container */}
    <div className="relative mt-8  pl-8 space-y-2">
 
      {selectedService?.our_process &&
        selectedService.our_process
          .split("\n\n")
          .map((step, index) => {
 
            // CRITICAL LINE: This controls the one-by-one display
            const isVisible = index <= currentStepIndex;
 
            const [title, ...description] = step.split("\n");
            const combinedMessage = description.length > 0 ? `${title}: ${description.join(" ")}` : title;
 
            return (
              <div
                key={index}
                className={`relative transition-all duration-700 ease-in-out transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
 
                {/* Step Content Card - Decreased length with 'py-3' and 'text-sm italic' */}
                <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-teal-100 ml-4">
 
                  {/* Single Quote Message: Italic font, wrapped in double quotes, smaller text */}
                  <p className="text-black text-md ">
                    <span className="text-peach-300 text-xl font-bold mr-1">"</span>
                    {combinedMessage}
                    <span className="text-peach-300 text-xl font-bold ml-1">"</span>
                  </p>
                </div>
              </div>
            );
          })}
 
      {/* Fallback/Completion Message */}
      {!selectedService?.our_process && (
        <div className="relative opacity-100 ml-4">
          <p className="text-gray-500 text-center italic text-lg p-6 bg-white rounded-xl shadow-lg">
            Our detailed process is currently being finalized. Please contact us for a walkthrough!
          </p>
        </div>
      )}
    </div>
 
   
  </div>
)}
                 
                  {/* 4. Benefits Content */}
                 {activeTab === "benefits" && (
    <div className="space-y-6 max-w-10xl mx-auto p-4 sm:p-0 relative">
        <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center capitalize">
           Healthy Benefits of {selectedService?.name} 

        </h2>
 
      
       
        {/* Typing Indicator */}
        {showTypingIndicator && (
            <div className="flex justify-center my-6">
                <TypingIndicator />
            </div>
        )}
 
        {/* --- STAGGERED GRID CONTAINER (SINGLE CARD) --- */}
        {/* We use the conditional styles from the old looping card but apply them permanently here */}
        <div
            className={`relative my-10 p-6 rounded-3xl shadow-xl border-4 border-peach-400
                        ${selectedService?.benefits && selectedService.benefits.trim() !== ""
                            ? 'bg-gradient-to-br from-navy-700 to-peach-300' // Use the background only if there are benefits to show
                            : 'bg-white' // Solid white if no benefits
                        }`}
        >
           
            {selectedService?.benefits && selectedService.benefits.trim() !== "" ? (
                // Benefit points grid - only shows if data exists
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedService.benefits.split('\n')
                        .filter(b => b.trim() !== "")
                        .map((benefit, index) => {
                           
                            // Check if this benefit should be visible yet
                            const isVisible = index < visibleBenefitCount;
                           
                            const parts = benefit.split(' - ');
                            // Use both title and description for a complete message
                            const title = parts[0]?.trim();
                            const description = parts.length > 1 ? parts.slice(1).join(' - ').trim() : '';
                            const displayContent = title && description ? `${title}: ${description}` : (title || benefit);
                           
                            return (
                                <div
                                    key={`stagger-box-${index}`}
                                    className={`flex flex-col items-center justify-center p-3 h-full bg-white/70
                                                rounded-lg shadow-md border border-peach-200 transition-all duration-700 ease-out
                                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                                    // Stagger animation is controlled by the useEffect and isVisible class
                                >
                                    {/* Small, italic, quoted text */}
                                    <p className="text-sm text-gray-700 italic text-center max-w-full font-medium">
                                        "{displayContent}"
                                    </p>
                                </div>
                            );
                        })}
                </div>
            ) : (
                // Fallback inside the main card if no benefits exist
                <div className="min-h-[10rem] flex items-center justify-center">
                    <p className="text-gray-500 text-center italic text-lg">
                        No detailed benefits available yet.
                    </p>
                </div>
            )}
 
        </div>
    </div>
)}
             
                 
                  {/* 5. Kushi Teamwork Content */}
                 
 
{activeTab === "teamwork" && selectedService?.kushi_teamwork && (
  <KushiTeamworkCarousel />
)}
 
 
 
                {/* 7. Why Choose Us Tab - MODIFIED SECTION (Image Only) */}
{activeTab === "why_choose_us" && selectedService && (
 <div className="space-y-5 max-w-10xl mx-auto p-2 sm:p-0 relative">
    
    {/* --- Main Heading: Customized for the "Why Choose Us" theme --- */}
    <h2 className="text-3xl font-bold text-center text-gray-800 tracking-tight">
       Why Clients Choose <span className="text-navy-700">Kushi Services</span>
    </h2>

    {/* --- Content Area: Replaces Chat and Timeline with Points --- */}
    <div className="space-y-6">

      {/* Logic to determine points to display */}
      {(() => {
        // Fallback/Mock data (if why_choose_us is not populated yet)
        const mockPoints = [
          "100% Satisfaction Guarantee",
          "Eco-Friendly and Safe Cleaning Products",
          "Vetted and Highly-Trained Professionals",
          "Flexible Scheduling and Easy Online Booking",
          "Transparent, Upfront Pricing with No Hidden Fees",
          "Dedicated Customer Support, 24/7",
        ];

        // Use 'why_choose_us' data if available, otherwise use mock data
        const rawPoints = selectedService?.why_choose_us;
        const displayPoints = rawPoints 
          ? rawPoints.split('\n').filter(p => p.trim() !== "") 
          : mockPoints;

        if (displayPoints.length > 0) {
          return (
            <div className="grid md:grid-cols-3 gap-3">
              {displayPoints.map((point, index) => (
                <div 
                  key={index} 
                  className="flex items-start p-3 bg-peach-200 rounded-lg shadow-md border-l-4 border-navy-500 transition duration-200"
                >
                  {/* Icon (Simplified Checkmark - Removed image tags) */}
                  <CheckCircle 
                    size={20} 
                    className="flex-shrink-0 text-navy-700 mt-0.5 mr-3" 
                  />
                  {point}
                  
                 
                </div>
              ))}
            </div>
          );
        } else {
          // Fallback Message
          return (
            <div className="text-center p-8 bg-gray-50 rounded-xl shadow-lg">
              <p className="text-gray-500 italic text-lg">
                Our detailed benefits are currently being finalized. Please contact us to learn more!
              </p>
            </div>
          );
        }
      })()}
    </div>

   
  </div>
)}
 
                 
                  {/* 6. FAQ Content */}
                  {activeTab === "faq" && selectedService?.faq && (
                      <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">
                          Frequently Asked Questions
                      </h2>
                      {selectedService.faq
                          .split("\n\n")
                          .map((entry: string, idx: number) => {
                          const lines = entry.split("\n").filter(Boolean);
                          const question = lines[0] || `Question ${idx + 1}`;
                          const answer = lines.slice(1).join("\n") || "No answer available.";
                          const isOpen = openFaqIndex === idx;
 
                          return (
                              <div
                              key={idx}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                              >
                              <button
                                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                              >
                                  <span className="font-medium">{question}</span>
                                  <span className="text-gray-500 font-bold">
                                  {isOpen ? "−" : "+"}
                                  </span>
                              </button>
 
                              {isOpen && (
                                  <div className="p-4 pt-0 text-gray-700 whitespace-pre-line">
                                  {answer}
                                  </div>
                              )}
                              </div>
                          );
                          })}
                      </div>
                  )}
                 
                  {/* Fallback for no content */}
                  {!selectedService?.overview && activeTab === "overview" && <p className="text-gray-500">No detailed overview provided for this service.</p>}
                  {!selectedService?.our_process && activeTab === "process" && <p className="text-gray-500">No process steps provided for this service.</p>}
                  {!selectedService?.benefits && activeTab === "benefits" && <p className="text-gray-500">No benefits information provided for this service.</p>}
                  {!selectedService?.kushi_teamwork && activeTab === "teamwork" && <p className="text-gray-500">No Kushi Teamwork details provided for this service.</p>}
                  {!selectedService?.faq && activeTab === "faq" && <p className="text-gray-500">No frequently asked questions (FAQs) provided for this service.</p>}
 
                </div>
              )}
            </div>
            )}

            {/* --- End of Tabs Section --- */}

 
           
          </div>
        ) :null}

 {/* ✅ Add Google Reviews Section Above Footer */}
<GoogleReviews />
      


 

 
 </div>
    
    </div>
  );
};
 
export default ServiceDetails;
  
 