import React, { useEffect, useState } from "react";
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
}
 
const ServiceDetails: React.FC = () => {
  const { subcategory } = useParams<{ subcategory: string }>();
  const navigate = useNavigate();
 const handleBookNow = () => {
  if (selectedService) {
    navigate('/booking', { state: { selectedService } });
  } else {
    navigate('/booking');
  }
};
  const location = useLocation();
 
  const preFetchedServices = location.state?.services as Service[] | undefined;


  
 
  const [services, setServices] = useState<Service[]>(preFetchedServices || []);
  const [loading, setLoading] = useState(!preFetchedServices);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<{ name: string; price: string; description: string }[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
 
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
    }
  }, [subcategory, preFetchedServices]);
 
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
        price: pkgs[0].price,
        description: selectedDescription,
      });
    } else {
      setSelectedService(service);
    }
 
    setActiveTab("overview");
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
          price: pkg.price,
          description: selectedDescription,
        });
      }
    }
  };
 
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
 
  return (
   <div className="bg-pink-50 min-h-screen w-full">
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
 
        {selectedService ? (
          <div className="mt-8">
            <button
              onClick={() => setSelectedService(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-6"
            >
              <ArrowLeft size={20} /> Back to all{" "}
              {selectedService.subcategory.replace(/-/g, " ")}
            </button>
            <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-lg shadow-md overflow-hidden p-6 border border-gray-200">
              {/* Left Column: Image and Packages */}
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
 
              {/* Right Column: Details and Buttons */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between">
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
                  <p className="text-gray-700 mb-6">
                    {selectedService.description}
                  </p>
                </div>
 
                <div className="flex flex-col items-start space-y-4">
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
                    className="w-full px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-gradient-to-r from-peach-200 to-navy-800"
                  >
                    <ClipboardList size={20} /> Get Quote
                  </button>
                </div>
              </div>
            </div>
 
            <div className="mt-12 bg-white rounded-3xl border-2 shadow-xl">
              <div className="flex space-x-2 border-b-2 border-gray-200 p-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                    activeTab === "overview"
                      ? "bg-white text-orange-500 border-b-2 border-orange-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Zap size={16} /> Overview
                </button>
                <button
                  onClick={() => setActiveTab("process")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                    activeTab === "process"
                      ? "bg-white text-orange-500 border-b-2 border-orange-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <ClipboardList size={16} /> Our Process
                </button>
                <button
                  onClick={() => setActiveTab("included")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                    activeTab === "included"
                      ? "bg-white text-orange-500 border-b-2 border-orange-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <PlusCircle size={16} /> What's Included
                </button>
                <button
                  onClick={() => setActiveTab("benefits")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                    activeTab === "benefits"
                      ? "bg-white text-orange-500 border-b-2 border-orange-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Heart size={16} /> Benefits
                </button>
              </div>
              <div className="p-8">
                {activeTab === "overview" && (
                  <>
                    <h2 className="text-xl font-bold mb-3">Service Overview</h2>
                    <p className="text-gray-700 mb-6 whitespace-pre-line">
                      {selectedService?.overview || "No overview available."}
                    </p>
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-4">
                        Why Choose Our Service?
                      </h3>
                      {selectedService?.why_choose_us &&
                        selectedService.why_choose_us
                          .split("\n")
                          .map((point, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 mb-2"
                            >
                              <CheckCircle
                                size={18}
                                className="text-green-500 mt-1 flex-shrink-0"
                              />
                              <p className="text-gray-700">{point}</p>
                            </div>
                          ))}
                    </div>
                  </>
                )}
                {activeTab === "process" && (
                  <>
                    <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center capitalize">
                      Our Step-by-Step Process of {subcategory?.replace(/-/g, " ")}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedService?.our_process &&
                        selectedService.our_process
                          .split("\n\n")
                          .map((step, index) => {
                            const [title, ...description] = step.split("\n");
                            return (
                              <div
                                key={index}
                                className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center"
                              >
                                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                                  {index + 1}
                                </div>
                                <h3 className="font-bold text-lg mb-2">
                                  {title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {description.join("\n")}
                                </p>
                              </div>
                            );
                          })}
                    </div>
                  </>
                )}
                {activeTab === "included" && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle size={24} className="text-green-500" />{" "}
                        What's Included
                      </h3>
                      <ul className="space-y-2">
                        {selectedService.whats_included &&
                          selectedService.whats_included
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
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <XCircle size={24} className="text-red-500" />{" "}
                        What's Not Included
                      </h3>
                      <ul className="space-y-2">
                        {selectedService.whats_not_included &&
                          selectedService.whats_not_included
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
                  </div>
                )}
                {activeTab === "benefits" && (
                  <>
                    <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center capitalize">
                     Benefits of Hiring a Professional {subcategory?.replace(/-/g, " ")}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedService.benefits &&
                        selectedService.benefits
                          .split("\n")
                          .map((benefit, index) => (
                            <div
                              key={index}
                              className="bg-white border-2 border-orange-100 rounded-lg p-6 text-center"
                            >
                              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                                <Heart size={24} className="text-orange-600" />
                              </div>
                              <p className="text-gray-600">{benefit}</p>
                            </div>
                          ))}
                    </div>
                  </>
                )}
              </div>
            </div>
 
            {similarServices.length > 0 && (
              <div className="mt-12 mb-10">
                <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">
                  Similar Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {similarServices.map((service) => (
                    <div
                      key={service.id}
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
                          onClick={() => handleCardClick(service)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <div
                key={service.id}
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
                    onClick={() => handleCardClick(service)}
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
 