import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  ArrowLeft,
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

/** ---------------------------
   * Testimonials
   ---------------------------- */

 


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

// --- New Interface for Fetched Reviews (Matches your DTO/Customer entity structure) ---
interface Review {
 id: string; 
 name: string; // Will be combined from User's firstName/lastName
 rating: number; // The booking's rating field
 text: string; // The booking's feedback field
 date?: string; // Optional date for display
}
 
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
type TabKey = "overview" | "process" | "benefits" | "teamwork" |"why_choose_us"|"faq";
 
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

const [activeInclusionTab, setActiveInclusionTab] = useState<"included" | "not_included" | null>(null);
 
 // ⭐️ New State for Real-Time Reviews ⭐️
 // This will be passed to the new ServiceReviews component
 const [fetchedReviews, setFetchedReviews] = useState<Review[]>([]);
 const [reviewsLoading, setReviewsLoading] = useState(true);
 const [reviewsError, setReviewsError] = useState<string | null>(null);
 
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
    if (!selectedService) {
      // Fallback if no service is selected (shouldn't happen in the detail view)
      navigate('/booking');
      return;
    }

    const isInspectionService = 
      selectedService.category === "Commercial Cleaning Services" || 
      selectedService.category === "Industrial Cleaning Services";

    if (isInspectionService) {
      // Navigate to the inspection booking page
      navigate('/inspection-booking', { state: { selectedService } });
    } else {
      // Navigate to the standard booking page
      navigate('/booking', { state: { selectedService } });
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
            price: price || "",
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


// --- ⭐️ Effect for Fetching Public Reviews ⭐️
useEffect(() => {
 const PUBLIC_REVIEWS_ENDPOINT =  Global_API_BASE + "/api/auth/public/reviews";

 
 const fetchPublicReviews = async () => {
 try {
 setReviewsLoading(true);
 const response = await fetch(PUBLIC_REVIEWS_ENDPOINT);

 if (response.status === 204) { // No Content
 setFetchedReviews([]);
 return;
 }
 
 if (!response.ok) {
 throw new Error(`Failed to fetch reviews: ${response.status}`);
 }
 
 const rawReviews = await response.json(); 
 
 // Map the backend fields (assuming your backend returns List<Customer> with 
 // nested 'user' and fields like 'rating', 'feedback', 'id').
 const mappedReviews: Review[] = rawReviews
 .filter((r: any) => r.rating && r.feedback) // Only show complete reviews
 .map((r: any) => ({
 id: r.id.toString(), // Customer/Booking ID
 name: r.user ? `${r.user.firstName} ${r.user.lastName}` : "Anonymous Customer",
 rating: r.rating,
 text: r.feedback, 
 date: r.date_created ? new Date(r.date_created).toLocaleDateString() : 'N/A' 
 }));
 
 setFetchedReviews(mappedReviews);
 } catch (err) {
 console.error("Error fetching reviews:", err);
 setReviewsError("Could not load real-time reviews.");
 } finally {
 setReviewsLoading(false);
 }
 };

 fetchPublicReviews();
 }, []);
// --- End of Review Fetching Effect ---

// ⭐️ ServiceReviews Component (The Redesigned Testimonials Section) ⭐️
const ServiceReviews: React.FC<{
 initialReviews: Review[];
 loading: boolean;
 error: string | null;
 dummyReviews: Review[]; // To hold the dummy data
}> = ({ initialReviews, loading, error, dummyReviews }) => {
 // Use a combination of fetched and dummy data, favoring fetched if available
 const [reviews, setReviews] = useState<Review[]>(
 initialReviews.length > 0 ? initialReviews : dummyReviews
 );
 // Update state when initialReviews prop changes after fetching
 useEffect(() => {
 if (initialReviews.length > 0) {
 setReviews(initialReviews);
 } else if (!loading && error) {
 // If loading failed, use dummy data as a fallback
 setReviews(dummyReviews);
 }
 }, [initialReviews, loading, error, dummyReviews]);


 const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
 const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });

 const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
 setNewReview({ ...newReview, [e.target.name]: e.target.value });
 };

 const handleRatingChange = (rating: number) => {
 setNewReview({ ...newReview, rating });
 };

 // ⚠️ NOTE: This function only simulates submission on the frontend for now!
 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (newReview.text.length < 10) {
 alert("Review text is too short.");
 return;
 }

 // Simulate submission (You need to add real API POST call here later)
 const submittedReview: Review = {
 ...newReview,
 id: Date.now().toString(),
 date: new Date().toLocaleDateString(),
 };

 // Add the new review to the *beginning* of the list
 setReviews(prevReviews => [submittedReview, ...prevReviews]);
 setNewReview({ name: '', rating: 5, text: '' });
 alert("Your feedback has been submitted! (Note: Real submission requires backend setup)");
 };

 // Dummy data mapping to Review interface
 // NOTE: This assumes 'testimonials' is available in this scope (defined globally or imported)
 const dummyReviewList: Review[] = testimonials.map((t, index) => ({
 id: `dummy-${index}`,
 name: t.name,
 rating: 5, // Defaulting dummy rating to 5 as per your old component
 text: t.text,
 }));

 



 // --- JSX TEMPLATE START ---
 return (
  <section className="py-4 bg-white-50"> {/* Reduced vertical padding */}
    <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Title Block */}
      <div className="text-center mb-6"> {/* Reduced margin-bottom */}
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-1">
          <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">
            Customer Reviews & Feedback
          </span>
        </h2>
      
      </div>

 {/* --- Reviews Display --- */}


 <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-0.5 py-0.5 no-scrollbar">
{reviews.map((review, index) => {
const isExpanded = expandedIndex === index;
const MAX_LENGTH = 120;

 return (
 <div
 key={review.id}
className="group relative max-w-[200px] min-h-[50px] flex-shrink-0 snap-start rounded-xl p-3 bg-white border-2 border-peach-300 shadow-xl flex flex-col justify-between"
>
<div>
{/* Ratings */}
 <div className="flex mb-1">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 size={14}
 className={i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}
 />
))}
 </div>

 {/* Text (Expandable) */}
 <p className="text-navy-700 text-sm mb-2 transition-all duration-300 ease-in-out">
 {isExpanded
 ? review.text
 : review.text.length > MAX_LENGTH
 ? review.text.slice(0, MAX_LENGTH) + "..."
: review.text}
 </p>

 {/* Read More / Show Less */}
 {review.text.length > MAX_LENGTH && (
  <button
 onClick={() =>
 setExpandedIndex(isExpanded ? null : index)
 }
 className="text-peach-500 text-xs font-semibold hover:underline mt-0.5 self-start"
 >
  {isExpanded ? "Show Less" : "Read More"}
 </button>
)}
 </div>

 {/* Name and Date */}
 <div className="mt-2 pt-2 border-t border-gray-100">
 <h4 className="font-bold text-navy-800 text-base">
 {review.name}
 </h4>
 
 </div>
 </div>
 );
 })}
 </div>

 </div>
 </section>
 );
};
// ----------------- End of ServiceReviews Component -----------------








 
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
 
             


 
                 {!(selectedService.category === "Commercial Cleaning Services" || selectedService.category === "Industrial Cleaning Services") && selectedService.price > 0 && (
        <div className="my-4">
            <span className="text-4xl font-bold text-gray-900">
                ₹{selectedService.price}
                {selectedService.originalPrice > selectedService.price && selectedService.originalPrice > 0 && (
                    <span className="text-gray-500 text-lg line-through ml-2">
                        ₹{selectedService.originalPrice}
                    </span>
                )}
            </span>
        </div>
    )}
 
                </div>
 
 
               {/* Buttons: Add to Cart, Book Now, Get Quote */}        
               
  {/* 3. ALL BUTTONS (NOW BELOW PRICE) */}
    <div className="flex flex-wrap items-center gap-3 mt-2">
    {/* I changed space-x-3 to gap-3 and flex-wrap for better mobile handling with many buttons */}
       
        {/* Add to Cart: Hide for Commercial & Industrial */}
        {!(selectedService.category === "Commercial Cleaning Services" || selectedService.category === "Industrial Cleaning Services") && (
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
            {selectedService.category === "Commercial Cleaning Services" || selectedService.category === "Industrial Cleaning Services"
                ? "Book Inspection"
                : "Book Now"}
        </button>
 
        {/* Get Quote */}
        <button
            onClick={() => navigate("/contact")}
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
 
 
 
 
 
           
{/* --- SIMILAR SERVICES (Full-Width Auto-Sliding Carousel) --- */}
{/* Only show if a service is selected AND there are similar services to display */}
{selectedService && similarServices.length > 0 && (
    <div className="mt-12 mb-10">
       
        {/* 1. EMBEDDED CSS FOR THE MARQUEE EFFECT */}
        <style>{`
            /* Keyframes define the continuous scroll */
            @keyframes marquee-seamless {
                0% {
                    transform: translateX(0);
                }
                /* New percentage based on triple duplication (100% / 3 * 2 = 66.666%) */
                100% {
                    transform: translateX(-66.666%);
                }
            }
 
            .animate-marquee-seamless {
                /* Using the approved 15s speed */
                animation: marquee-seamless 15s linear infinite;
                /* Ensures hardware acceleration for smoothness */
                will-change: transform;
            }
        `}</style>
       
        {/* Title Container (Max width for centering) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">
                Similar Services
            </h2>
        </div>
 
        {/* --- Full-Width Auto-Sliding Carousel Container --- */}
        <div className="flex overflow-hidden relative py-4">
           
            {/* Inner container: Now set to 300% width and uses the new animation class */}
            <div className="flex animate-marquee-seamless" style={{ width: '300%' }}>
               
                {/* Loop over the services array THREE TIMES for the seamless, continuous effect.
                    This provides a much larger buffer to hide the transition jump.
                */}
                {[...similarServices, ...similarServices, ...similarServices].map((service, index) => (
                    <div
                        // Key uses the tripled index for uniqueness
                        key={`slide-${service.id}-${index}`}
                        onClick={() => handleCardClick(service)}
                        // Fixed width and margin for card spacing
                        className="flex-shrink-0 w-80 sm:w-96 mx-3 cursor-pointer"
                    >
                        {/* Service Card Structure */}
                        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl">
                            <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                                    {service.name}
                                </h3>
                                <div className="flex items-center text-xs text-gray-600 my-1">
                                    <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                                    <span>{service.rating} ({service.reviews} reviews)</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCardClick(service); }}
                                    className="flex items-center gap-1 text-blue-600 font-medium text-sm mt-2 hover:underline"
                                >
                                    View Details <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {/* --- End of Full-Width Auto-Sliding Carousel Container --- */}
    </div>
)}
 
 
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
 <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-0 relative">
    
    {/* --- Main Heading: Customized for the "Why Choose Us" theme --- */}
    <h2 className="text-4xl font-bold text-center text-gray-800 tracking-tight">
       Why Clients Choose <span className="text-navy-700">Kushi Services</span>
    </h2>
    
    <p className="text-center text-lg text-gray-600 italic">
        We focus on three things: quality, reliability, and customer happiness.
    </p>

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
            <div className="grid md:grid-cols-3 gap-6">
              {displayPoints.map((point, index) => (
                <div 
                  key={index} 
                  className="flex items-start p-5 bg-peach-100 rounded-lg shadow-md border-l-4 border-peach-300 transition duration-200"
                >
                  {/* Icon (Simplified Checkmark - Removed image tags) */}
                  <CheckCircle 
                    size={20} 
                    className="flex-shrink-0 text-navy-700 mt-0.5 mr-3" 
                  />
                  
                  {/* Point Text */}
                  <p className="text-lg font-medium text-gray-700">
                    <span className="font-bold text-gray-800 mr-1">•</span> {point}
                  </p>
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
            {/* --- End of Tabs Section --- */}
 
           
          </div>
        ) : (
          /* --- Service List View (When selectedService is null) --- */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
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

 {/* Review Section - New Component */}
 <ServiceReviews
 initialReviews={fetchedReviews}
 loading={reviewsLoading}
 error={reviewsError}
 dummyReviews={testimonials.map((t, index) => ({ // Pass mapped dummy data
id: `dummy-${index}`,
name: t.name,
 rating: 5,
 text: t.text,
 date: 'N/A', // Dummy data doesn't have a real date
 }))}
/>
 
      


{/* --- Back Buttons (End of Page, Right Corner) --- */}
<div className="px-4 mt-12 mb-8 flex justify-end gap-4">
  {selectedService && (
    <Link
      to="/services"
      className="flex items-center gap-2 text-navy-700 hover:text-navy-700 font-semibold transition"
    >
      <ArrowLeft size={18} />
      Back to Services
    </Link>
  )}
 
</div>
 
 </div>
    
    </div>
  );
};
 
export default ServiceDetails;
  
 