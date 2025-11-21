import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Global_API_BASE from "../services/GlobalConstants";
import GoogleReviews from "../components/GoogleReviews";

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
 
const Subcategories: React.FC = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
 
  const selectedCategory = location.state?.selectedCategory || null;
 
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);
 
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(Global_API_BASE + "/api/customers/all-services");
        const data = await response.json();
 
        const mapped: Service[] = data
          .filter((x: any) => x.active === "Y")
          .map((x: any, index: number) => ({
            id: x.service_id?.toString() || index.toString(),
            name: x.service_name,
            category: x.service_category,
            subcategory: x.service_type,
            service_package: x.service_package,
            price: x.service_cost,
            originalPrice: x.originalPrice || x.price,
            rating: parseFloat(x.rating),
            reviews: x.rating_count?.toString() || "0",
            duration: x.duration,
            image: x.service_image_url.startsWith("http")
              ? x.service_image_url
              : `${Global_API_BASE}${x.service_image_url}`,
            description: x.service_description,
            features: x.features ? x.features.split(",") : [],
            active: x.active,
            badge:  x.badge || "",
             overview: x.overview || "",
             our_process: x.our_process || "",
             benefits: x.benefits || "",
             whats_included: x.whats_included || "",
             whats_not_included: x.whats_not_included || "",
             why_choose_us: x.why_choose_us || "",
             kushi_teamwork: x.kushi_teamwork || "",
             faq: x.faq || "",
          }));
 
        setAllServices(mapped);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchServices();
  }, []);
 
  // FIX: Normalize comparison so backend category matches frontend category
  const subcategoryData = useMemo(() => {
    const normalize = (str: string) =>
      str?.toLowerCase().replace(/[^a-z0-9]/g, "");
 
    const result: { name: string; image: string }[] = [];
 
    allServices.forEach((service) => {
      // FIXED COMPARISON:
      if (normalize(service.category) === normalize(selectedCategory)) {
        if (!result.find((x) => x.name === service.subcategory)) {
          result.push({ name: service.subcategory, image: service.image });
        }
      }
    });
 
    return result;
  }, [allServices, selectedCategory]);
 
  const handleSubcategoryClick = (sub: string) => {
    const slug = sub.toLowerCase().replace(/\s+/g, "-");
    navigate(`/services/${slug}`, {
      state: {
        services: allServices.filter(
          (x) => x.subcategory.toLowerCase().replace(/\s+/g, "-") === slug
        ),
      },
    });
  };
 
  return (
    <div className="bg-gradient-to-br from-peach-50 to-navy-50 pb-2">
 
      {/* Category Title */}
      <h1 className="text-center text-2xl font-bold text-navy-900 **mt-2**">
        {selectedCategory}
      </h1>
 
      {/* Loading */}
      {isLoading && (
        <p className="text-center text-navy-700 mt-4 animate-pulse">
          Loading Services...
        </p>
      )}
 
      {/* No Services */}
      {!isLoading && subcategoryData.length === 0 && (
        <p className="text-center text-navy-700 mt-6">
          No services available in this category yet.
        </p>
      )}
 
      {/* Subcategory Grid */}
      {!isLoading && subcategoryData.length > 0 && (
        <div className="grid subcategory-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 px-4 mt-8">
          {subcategoryData.map((sub) => (
            <div
              key={sub.name}
              className="group rounded-3xl shadow-xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
              onClick={() => handleSubcategoryClick(sub.name)}
            >
              <img
                src={sub.image}
                alt={sub.name}
                className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
              />
 
              <div className="p-2 text-center">
                <h3 className="text-lg font-bold text-navy-900 mb-1">
                  {sub.name}
                </h3>
 
                <button className="w-full px-3 py-1 mt-1 font-semibold rounded-full bg-gradient-to-r from-peach-300 to-navy-700 text-white">
                  View Services
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      <GoogleReviews />
 
    </div>
  );
};
 
export default Subcategories;