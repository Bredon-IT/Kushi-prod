// src/pages/ServiceListPage.tsx
import React, { useEffect, useRef } from "react";
import GoogleReviews from "../components/GoogleReviews";
import {
 useParams,
  useNavigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
 
const ServiceList: React.FC = () => {
  const { subcategory } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
 
  const services = location.state?.services || [];
 
  // 🔥 Prevent auto-open from running more than ONCE
  const autoOpened = useRef(false);


useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);


 
  useEffect(() => {
    // run only for single service
    if (services.length !== 1) return;
 
    // do NOT auto-open when user used back/forward (POP)
    if (navigationType === "POP") return;
 
    // do NOT run twice
    if (autoOpened.current) return;
    autoOpened.current = true;
 
    const slug = services[0].name.toLowerCase().replace(/\s+/g, "-");
 
    // small delay ensures subcategory page is registered in history
    setTimeout(() => {
      navigate(`/services/${subcategory}/${slug}`, {
        state: {
          services,
          selectedServiceId: services[0].id,
          openDirectly: true,
           fromCartEdit: location.state?.fromCartEdit || false,
           editCartItemId: location.state?.editCartItemId || null,
           selectedPackageName: location.state?.selectedPackageName || null,
        },
        replace: false,
      });
    }, 0);
  }, [services, navigationType, navigate, subcategory]);
 
  const handleCardClick = (service: any) => {
    const serviceSlug = service.name.toLowerCase().replace(/\s+/g, "-");
 
    navigate(`/services/${subcategory}/${serviceSlug}`, {
      state: {
        services,
        selectedServiceId: service.id,
        openDirectly: true,
        skipAutoOpen: true,
         fromCartEdit: location.state?.fromCartEdit || false,
         editCartItemId: location.state?.editCartItemId || null,
         selectedPackageName: location.state?.selectedPackageName || null,
      },
      replace: false,
    });
  };
 
  return (
    <div className="bg-white w-full **min-h-screen**"> {/* Added min-h-screen for better footer placement */}
      <div className="px-2 sm:px-2 lg:px-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-8 text-center capitalize">
          {subcategory?.replace(/-/g, " ")}
        </h1>
 
        {/* --- Service List View --- */}
        {/* Removed mb-6 to reduce the space above the footer */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto"> 
          {services.map((service: any) => (
            <div
              key={service.id}
              onClick={() => handleCardClick(service)}
              className="bg-white rounded-xl shadow-md overflow-hidden
                         border border-gray-200 transition-all duration-300
                         hover:shadow-xl hover:-translate-y-1 cursor-pointer
                         w-full"
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-44 object-cover"
              />
 
              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-800 leading-tight truncate mb-1">
                  {service.name}
                </h3>
 
                <div className="flex items-center text-[11px] text-gray-600 mb-1">
                  <Star
                    size={11}
                    className="text-yellow-400 fill-yellow-400 mr-1"
                  />
                  <span>
                    {service.rating} ({service.reviews})
                  </span>
                </div>
 
                <p className="text-[12px] text-gray-600 h-8 overflow-hidden mb-1">
                  {service.description}
                </p>
 
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleCardClick(service);
 }}
  className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline"
 >
 View Details <ArrowRight size={12} />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 <GoogleReviews />
 </div>
 );
};

export default ServiceList;