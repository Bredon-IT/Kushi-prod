import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  ClipboardList,
  PlusCircle,
  Heart,
  Zap,
} from "lucide-react";
import { KushiTeamworkCarousel } from "../components/KushiTeamworkCarousel";
 
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
 
// Define the keys for all tabs
type TabKey = "overview" | "process" | "included" | "benefits" | "teamwork" |"why_choose_us"|"faq";
 
const ServiceDetails: React.FC = () => {
  const { subcategory } = useParams<{ subcategory: string }>();
  const navigate = useNavigate();
  const location = useLocation();
 
  // Pre-fetched data passed via navigation state
  const preFetchedServices = location.state?.services as Service[] | undefined;
 
  const [services, setServices] = useState<Service[]>(preFetchedServices || []);
  const [loading, setLoading] = useState(!preFetchedServices);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<{ name: string; price: string; description: string }[]>([]);
 
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


//benefits code:

const [showAllBenefitsSummary, setShowAllBenefitsSummary] = useState(false);
const [showTypingIndicator, setShowTypingIndicator] = useState(false);
const [visibleBenefitCount, setVisibleBenefitCount] = useState(0);


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
        }, 1500 + 500); // Start staggering 0.5s after typing ends

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
            }, 1500); // 1.5 seconds delay between showing steps
            
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
    if (selectedService) {
      navigate('/booking', { state: { selectedService } });
    } else {
      navigate('/booking');
    }
  };
 
  const handleAddToCart = (service: Service) => {
    const cartItem = {
      ...service,
      quantity: 1,
    };
 
    const existingCart = JSON.parse(
      localStorage.getItem("kushiServicesCart") || "[]"
    );
    const existingItem = existingCart.find(
      (item: any) => item.id === cartItem.id && item.name === cartItem.name
    );
    if (existingItem) existingItem.quantity += 1;
    else existingCart.push(cartItem);
 
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
    const pkgs = service.service_package
      ? service.service_package.split(";").map((pkg) => {
          const [name, price, description] = pkg.split(":");
          return {
            name: name || "",
            price: price || "0",
            description: description || "",
          };
        })
      : [];
 
    setPackages(pkgs);
 
    if (pkgs.length > 0) {
      const selectedDescription = pkgs[0].description || service.description;
 
      setSelectedService({
        ...service,
        name: `${service.name} (${pkgs[0].name})`,
        price: parseFloat(pkgs[0].price) || service.price,
        description: selectedDescription,
      });
    } else {
      setSelectedService(service);
    }
 
    setActiveTab("overview"); // Reset to overview when a new service is selected
    setIsContentVisible(false); // Keep content hidden when a new service card is clicked
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
 
  const handlePackageSelect = (pkg: {
    name: string;
    price: string;
    description: string;
  }) => {
    if (selectedService) {
      const originalService = services.find((s) => s.id === selectedService.id);
      if (originalService) {
        const selectedDescription = pkg.description || originalService.description;
        setSelectedService({
          ...selectedService,
          name: `${originalService.name} (${pkg.name})`,
          price: parseFloat(pkg.price) || originalService.price,
          description: selectedDescription,
        });
      }
    }
  };
 
 // --- Data Fetching useEffect (UPDATED: Auto-open single service or when openDirectly is true) ---
useEffect(() => {
  if (!preFetchedServices) {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
 
        const res = await fetch("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/customers/all-services");
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
              : `https://bmytsqa7b3.ap-south-1.awsapprunner.com${item.service_image_url}`
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
 
        // ✅ Auto-open if openDirectly flag OR only one service exists
        const shouldOpenDirectly =
          location.state?.openDirectly || filtered.length === 1;
 
        if (shouldOpenDirectly && filtered.length > 0) {
          handleCardClick(filtered[0]);
        }
 
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
 
    // ✅ Auto-open if openDirectly flag OR only one service exists
    const shouldOpenDirectly =
      location.state?.openDirectly || filtered.length === 1;
 
    if (shouldOpenDirectly && filtered.length > 0) {
      handleCardClick(filtered[0]);
    }
  }
}, [subcategory, preFetchedServices]);
// --- End of Updated useEffect ---
  
 
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
 
  const allTabs: { key: TabKey, label: string, icon: React.FC<any> }[] = [
    { key: "overview", label: "Overview", icon: Zap },
    { key: "process", label: "Our Process", icon: ClipboardList },
    { key: "included", label: "Included", icon: PlusCircle },
    { key: "benefits", label: "Benefits", icon: Heart },
    { key: "teamwork", label: "Teamwork", icon: Zap },
    { key: "why_choose_us", label: "Why Choose Us", icon: CheckCircle },
    { key: "faq", label: "FAQs", icon: ClipboardList },
  ];

  const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 bg-gray-100 p-2 rounded-full shadow-inner">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
    </div>
);
 
  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to="/services"
          className="flex items-center gap-2 text-navy-700 hover:text-peach-300 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Services
        </Link>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-8 text-center capitalize">
          {subcategory?.replace(/-/g, " ")}
        </h1>
 
        {/* Conditional Rendering based on selectedService */}
        {selectedService ? (
          // --- Service Detail View ---
          <div className="mt-8">
            {/* Show “Back to all services” only if there are multiple services */}
{services.length > 1 && (
  <button
    onClick={() => setSelectedService(null)}
    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-6"
  >
    <ArrowLeft size={20} /> Back to all{" "}
    {selectedService.subcategory.replace(/-/g, " ")}
  </button>
)}
            <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-lg shadow-md overflow-hidden p-6 border border-gray-200">
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
                          ₹{pkg.price}
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
                  <div className="text-4xl font-bold text-gray-900 mb-4">
                    ₹{selectedService.price}
                    {selectedService.originalPrice > selectedService.price && (
                      <span className="text-gray-500 text-lg line-through ml-2">
                        ₹{selectedService.originalPrice}
                      </span>
                    )}
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
 
                </div>
 
                  <div className="flex flex-col items-start space-y-4 mt-4">
                  <div className="flex w-full space-x-4">
                    <button
                      onClick={() => handleAddToCart(selectedService)}
                      className="flex-1 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-gradient-to-r from-peach-300 to-navy-700"
                    >
                      <PlusCircle size={20} /> Add to Cart
                    </button>
                    <button
                      onClick={handleBookNow}
                      className="flex-1 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-gradient-to-r from-peach-300 to-navy-700"
                    >
                      <Zap size={20} /> Book Now
                    </button>
                  </div>
                  <button
                    onClick={() => navigate("/contact")}
                    className="w-full px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-gradient-to-r from-peach-300 to-navy-700"
                  >
                    <ClipboardList size={20} /> Get Quote
                  </button>
                </div>
              </div>
            </div>
 
            {/* --- Tabs Section --- */}
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
                    <tab.icon size={20} /> {tab.label}
                  </button>
                ))}
              </div>
             
              {/* Tab Content Container */}
              {isContentVisible && (
                <div ref={contentRef} className="p-8 mt-4">
                 
 
 {activeTab === "overview" && selectedService && (
  <div className="relative bg-gradient-to-br from-yellow-50 to-pink-50 p-8 rounded-2xl shadow-lg font-sans overflow-visible">
    <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-10 tracking-wide">
      Explore {selectedService.name} 
    </h2>

    <div className="grid grid-cols-2 gap-10">
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
            What equipment do you use for cleaning?
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
                  <span className="italic text-gray-700">{line.trim()}</span>
                </div>
              )) || (
              <div className="flex items-start">
                <span className="italic text-gray-700">
     
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
            What chemicals or cleaning products do you use?
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
                  <span className="italic text-gray-700">{line.trim()}</span>
                </div>
              )) || (
              <div className="flex items-start">
                <span className="italic text-gray-700">
                
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* End Note */}
    <div className="text-center mt-10 text-lg font-medium text-gray-700 italic">
      “A clean home is a happy home — and we’re here to make yours shine!” ✨
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
  <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-0 relative">
    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-10 tracking-wide">
       Your Service Journey: Our Step-by-Step Process
    </h2>

    {/* --- CUSTOMer ASKS --- */}
    <div className="flex justify-start items-start gap-4">
      <img
        src="/Lady_avatar.png" // <- Update this path
        alt="Customer avatar thinking"
        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-blue-300 shadow-md"
      />
      <div className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-200 ml-2 animate-fade-in">
        <p className="font-semibold text-gray-800 text-lg italic leading-tight">
          "Can you walk me through the <span className="text-peach-700 font-extrabold">entire process</span> for this cleaning service?"
        </p>
        <div className="absolute left-[-10px] top-5 w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-white border-b-[10px] border-b-transparent"></div>
      </div>
    </div>

    {/* --- TEAM REPLIES (STEP-BY-STEP) --- */}
    <div className="flex justify-end items-start gap-4 mt-8">
      <div className="relative bg-teal-50 p-4 rounded-xl shadow-lg border border-teal-200 mr-2 max-w-[80%] animate-fade-in">
        <p className="font-semibold text-teal-800 text-lg">
          "Absolutely! Here's how we ensure a perfect clean, step-by-step:"
        </p>
        <div className="absolute right-[-10px] top-5 w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-teal-50 border-b-[10px] border-b-transparent"></div>
      </div>
      {/* Team Member Avatar - Change to a man's avatar as requested */}
      <img
        src="/team-avatar.png" // <- Update this path with your man avatar image
        alt="Team member avatar describing the process"
        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-green-300 shadow-md"
      />
    </div>

    {/* Process Timeline/Story Container */}
    <div className="relative mt-8 border-l-4 border-dashed border-teal-300 pl-8 space-y-10">
      
      {selectedService?.our_process &&
        selectedService.our_process
          .split("\n\n")
          .map((step, index) => {
            
            //  CRITICAL LINE: This controls the one-by-one display
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
                  <p className="text-gray-700 text-sm italic">
                    <span className="text-teal-500 text-lg font-bold mr-1">"</span>
                    {combinedMessage}
                    <span className="text-teal-500 text-lg font-bold ml-1">"</span>
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
    
    {/* Final Quote/Call to Action */}
    <div className="text-center mt-12 text-xl font-medium text-teal-600 italic">
      "It's a methodical journey to a magnificent result — every time!" 
    </div>
  </div>
)}
                 
                  {/* 3. What's Included Content */}
               
{activeTab === "included" && (
  // Reduced max-w-2xl to max-w-xl for more pronounced left/right spacing if screen allows
  <div className="space-y-6 max-w-xl mx-auto p-4 sm:p-0"> 

    {/* Question 1: Lady asks "What's Included?" - Pushed to the LEFT */}
    <div className="flex justify-start"> {/* Ensures the whole block starts at the left */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 shadow-sm border border-blue-100 max-w-[90%]">
          <img
            src="/lady-avatar.png" // **<- Update this path**
            alt="Customer avatar asking about inclusions"
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-blue-300"
          />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Customer:</p>
            <p className="text-base text-navy-900 italic leading-tight">
              "Hello, could you tell me <span className="text-peach-700 font-extrabold">What's Included</span> in this service?"
            </p>
          </div>
        </div>
    </div>

    {/* Answer 1: Team Explains "What's Included" - Pushed to the RIGHT */}
    <div className="flex justify-end"> {/* Ensures the whole block ends at the right */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100 max-w-[90%]">
          {/* Team Member Avatar is now on the right side of the text */}
          <div>
           
            <p className="text-base text-gray-700 leading-tight">
              "Certainly! <span className="font-bold text-navy-800">Here's what we offer:</span>"
            </p>
            {/* List changed to use quote/italic styling and removed icons */}
            <ul className="space-y-1 text-sm text-gray-600 mt-2">
              {selectedService?.whats_included &&
                selectedService.whats_included.split("\n").map((item, index) => (
                  <li key={index}>
                    {/* Applied italic font and added quote spans */}
                    <p className="text-gray-700 text-sm italic">
                      <span className="text-green-500 font-bold mr-1">"</span>
                      {item}
                      <span className="text-green-500 font-bold ml-1">"</span>
                    </p>
                  </li>
                ))}
              {!selectedService?.whats_included && (
                <li className="text-gray-500 text-sm italic">"No specific inclusions listed at this time."</li>
              )}
            </ul>
          </div>
          <img
            src="/team-avatar.png" // **<- Update this path**
            alt="Team member avatar explaining inclusions"
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-green-300"
          />
        </div>
    </div>

    {/* Question 2: Lady asks "What's NOT Included?" - Pushed to the LEFT */}
    <div className="flex justify-start mt-6"> {/* Ensures the whole block starts at the left */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 shadow-sm border border-red-100 max-w-[90%]">
          <img
            src="/lady-avatar.png" // **<- Update this path**
            alt="Customer avatar asking about exclusions"
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-red-300"
          />
          <div>
            <p className="font-semibold text-red-800 text-sm">Customer:</p>
            <p className="text-base text-navy-900 italic leading-tight">
              "Thanks! And what about <span className="text-red-700 font-extrabold">What's NOT Included</span>?"
            </p>
          </div>
        </div>
    </div>

    {/* Answer 2: Team Explains "What's NOT Included" - Pushed to the RIGHT */}
    <div className="flex justify-end"> {/* Ensures the whole block ends at the right */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100 max-w-[90%]">
          {/* Team Member Avatar is now on the right side of the text */}
          <div>
           
            <p className="text-base text-gray-700 leading-tight">
              "Good question! To ensure transparency, <span className="font-bold text-navy-800">here's what's not included:</span>"
            </p>
            {/* List changed to use quote/italic styling and removed icons */}
            <ul className="space-y-1 text-sm text-gray-600 mt-2">
              {selectedService?.whats_not_included &&
                selectedService.whats_not_included.split("\n").map((item, index) => (
                  <li key={index}>
                    {/* Applied italic font and added quote spans */}
                    <p className="text-gray-700 text-sm italic">
                      <span className="text-red-500 font-bold mr-1">"</span>
                      {item}
                      <span className="text-red-500 font-bold ml-1">"</span>
                    </p>
                  </li>
                ))}
              {!selectedService?.whats_not_included && (
                <li className="text-gray-500 text-sm italic">"No specific exclusions listed at this time."</li>
              )}
            </ul>
          </div>
          <img
            src="/team-avatar.png" // **<- Update this path**
            alt="Team member avatar explaining exclusions"
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-orange-300"
          />
        </div>
    </div>
  </div>
)}
                 
                  {/* 4. Benefits Content */}
                 {activeTab === "benefits" && (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-0 relative">
        <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center capitalize">
            Unlocking the Advantages: What You Gain
        </h2>

        {/* --- CUSTOMER ASKS --- */}
        <div className="flex justify-start items-start gap-4">
            {/* AI-Generated Lady Avatar */}
            <img
                src="/Lady_avatar.png" 
                alt="AI Customer avatar thinking"
                className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-blue-300 shadow-md"
            />
            {/* Thinking Cloud */}
            <div className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-200 ml-2 animate-fade-in-up">
                <p className="font-semibold text-gray-800 text-lg italic">
                    <span className="text-peach-700 font-extrabold">"What amazing benefits</span> will I truly get from this service?"
                </p>
                {/* Thinking cloud tail */}
                <div className="absolute left-[-10px] top-5 w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-white border-b-[10px] border-b-transparent shadow-sm"></div>
            </div>
        </div>

        {/* --- TEAM REPLIES (DYNAMICALLY) --- */}
        <div className="flex justify-end items-start gap-4 mt-8">
            {/* Thinking Cloud for Team Member's reply setup */}
            <div className="relative bg-peach-100 p-4 rounded-xl shadow-lg border border-peach-200 mr-2 max-w-[80%] animate-fade-in-up">
                <p className="font-semibold text-navy-800 text-lg">
                    "That's a crucial question! Let's reveal the powerful advantages one by one..."
                </p>
                {/* Thinking cloud tail */}
                <div className="absolute right-[-10px] top-5 w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-peach-100 border-b-[10px] border-b-transparent shadow-sm"></div>
            </div>
            {/* AI-Generated Team Avatar */}
            <img
                src="/team-avatar.png" 
                alt="AI Team member avatar explaining benefits"
                className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-green-300 shadow-md"
            />
        </div>
        
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
                            ? 'bg-gradient-to-br from-purple-50 to-pink-100' // Use the background only if there are benefits to show
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
  <div className="p-4">
    <h2 className="text-3xl font-extrabold text-navy-900 mb-6 text-center">
      Why Choose Kushi Services?
    </h2>
 
    {/* Centered Image Container */}
    <div className="flex justify-center items-center">
      <div className="w-full max-w-2xl"> {/* Set a max width for better centering on large screens */}
        <img
          src={"/why_chooseus.png"}
          alt="Kushi Services team and benefits"
          style={{ maxHeight: '600px' }}
        />
      </div>
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
                  {(!selectedService?.whats_included && !selectedService?.whats_not_included) && activeTab === "included" && <p className="text-gray-500">Inclusion/Exclusion details are not available for this service.</p>}
                  {!selectedService?.benefits && activeTab === "benefits" && <p className="text-gray-500">No benefits information provided for this service.</p>}
                  {!selectedService?.kushi_teamwork && activeTab === "teamwork" && <p className="text-gray-500">No Kushi Teamwork details provided for this service.</p>}
                  {!selectedService?.faq && activeTab === "faq" && <p className="text-gray-500">No frequently asked questions (FAQs) provided for this service.</p>}
 
                </div>
              )}
            </div>
            {/* --- End of Tabs Section --- */}
 
            {similarServices.length > 0 && (
              <div className="mt-12 mb-10">
                <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">
                  Similar Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {similarServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleCardClick(service)}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl cursor-pointer"
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-md font-bold text-gray-800 mb-1">
                          {service.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-600 my-1">
                          <Star
                            size={12}
                            className="text-yellow-400 fill-yellow-400 mr-1"
                          />
                          <span>
                            {service.rating} ({service.reviews} reviews)
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(service);
                          }}
                          className="flex items-center gap-1 text-blue-600 font-medium text-sm mt-2 hover:underline"
                        >
                          View Details <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- Service List View (When selectedService is null) --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleCardClick(service)}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {service.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-600 my-1">
                    <Star
                      size={14}
                      className="text-yellow-400 fill-yellow-400 mr-1"
                    />
                    <span>
                      {service.rating} ({service.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 h-10 overflow-hidden mb-2">
                    {service.description}
                  </p>
                  <button
                    // THIS BUTTON takes the user to the detail view.
                     onClick={(e) => {
                               e.stopPropagation();
                               handleCardClick(service);
                           }}
                    className="flex items-center gap-1 text-blue-600 font-medium text-sm mt-2 hover:underline"
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default ServiceDetails;
 
