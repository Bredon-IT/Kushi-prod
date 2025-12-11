import React, { useState, useEffect } from "react";
import axios from "axios";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLocationContext } from "../contexts/LocationContext";
import { useNavigate, useLocation } from "react-router-dom";
import Global_API_BASE from "../services/GlobalConstants";

const locationDetails: Record<string, any> = {
  Bangalore: {
    phone: "+91 9606999081/82/83/84/85",
    contactnumber: "8792288656",
    email: "info@kushiservices.in",
    address:
      "No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049",
    hours: "Mon-Sat: 8:00 AM - 8:00 PM | Sun: Emergency",
  },
  Hyderabad: {
    phone: "+91 9606999081/82/83/84/85",
    contactnumber: "8792288656",
    email: "info.hyderabad@kushiservices.in",
    address: "Some Hyderabad Address, Telangana 500001 (Near Test Landmark)",
    hours: "Mon-Sat: 9:00 AM - 7:00 PM | Sun: Closed",
  },
};

const InputGroup = ({
  label,
  name,
  type,
  value,
  onChange,
  error,
  placeholder,
}: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded-lg focus:ring-navy-500 focus:border-navy-500 text-gray-900 placeholder-gray-500 text-sm bg-gray-50 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      placeholder={placeholder}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const Contact: React.FC = () => {
  const { location } = useLocationContext();
  const navigate = useNavigate();
  const currentDetails = locationDetails[location] || locationDetails["Bangalore"];

  // locationState from navigation (prefillService should be full service_category, prefillSubcategory should be service_name)
  const locationState = useLocation();
  const prefillServiceFromNav = locationState.state?.prefillService || "";
  const prefillSubcategoryFromNav = locationState.state?.prefillSubcategory || "";

  // form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "", // will store full category label (e.g. 'Residential Cleaning Services')
    subcategory: "", // will store full service_name
    message: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // dynamic lists from API
  const [allServices, setAllServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(
    {}
  );
  const [loadingServices, setLoadingServices] = useState<boolean>(true);

  // Build Google Maps directions url
  const encodedAddress = encodeURIComponent(currentDetails.address);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  // Fetch all services and build categories & subcategories maps
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoadingServices(true);
        const res = await axios.get(Global_API_BASE + "/api/customers/all-services");
        const data = res.data || [];

        if (!mounted) return;

        setAllServices(data);

        // preserve API order for categories (use Set to dedupe while preserving order)
        const catSet = new Set<string>();
        const map: Record<string, Set<string>> = {};

        data.forEach((item: any) => {
          const cat = (item.service_category || "Other").trim();
          const sub = (item.service_name || "").trim();

          if (!catSet.has(cat)) catSet.add(cat);

          if (!map[cat]) map[cat] = new Set();
          if (sub) map[cat].add(sub);
        });

        const catArray = Array.from(catSet);
        const subMap: Record<string, string[]> = {};
        Object.keys(map).forEach((k) => {
          subMap[k] = Array.from(map[k]);
        });

        setCategories(catArray);
        setSubcategoriesMap(subMap);
      } catch (err) {
        console.error("Failed to load services for contact page", err);
      } finally {
        setLoadingServices(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // If navigation provided prefill values, apply them intelligently:
  // apply category immediately if it exists in categories; if categories not loaded yet, wait for the fetch effect to set them (below effect)
  useEffect(() => {
    if (!prefillServiceFromNav && !prefillSubcategoryFromNav) return;

    // If categories already available, apply; otherwise wait for categories to populate (handled in next effect)
    if (categories.length > 0) {
      const catExists = categories.includes(prefillServiceFromNav);
      if (catExists) {
        setFormData((p) => ({
          ...p,
          service: prefillServiceFromNav,
          subcategory: prefillSubcategoryFromNav || "",
        }));
        return;
      }
    }

    // If categories empty yet, set a temporary value only if prefillService is empty string fallback handled later
    if (categories.length === 0 && prefillServiceFromNav) {
      // We'll attempt to set after categories are loaded (effect below will handle)
      setFormData((p) => ({
        ...p,
        service: "", // leave empty till we validate post-fetch
        subcategory: "",
      }));
    }
  }, [prefillServiceFromNav, prefillSubcategoryFromNav, categories]);

  // When categories and subcategoriesMap are ready, auto-apply prefill if present and valid
  useEffect(() => {
    if (!prefillServiceFromNav || categories.length === 0) return;

    // ensure the prefills exist in the fetched data
    const catExists = categories.includes(prefillServiceFromNav);
    const validSub =
      catExists && subcategoriesMap[prefillServiceFromNav]?.includes(prefillSubcategoryFromNav);

    setFormData((prev) => ({
      ...prev,
      service: catExists ? prefillServiceFromNav : prev.service,
      subcategory: validSub ? prefillSubcategoryFromNav : prev.subcategory,
    }));
  }, [categories, subcategoriesMap, prefillServiceFromNav, prefillSubcategoryFromNav]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(Global_API_BASE + "/api/contact/submit", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location,
        serviceCategory: formData.service,
        subcategory: formData.subcategory,
        message: formData.message,
      });

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        subcategory: "",
        message: "",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        navigate("/thank-you");
      }, 1250);
    } catch (err) {
      console.error("Failed to send contact form", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // When category changes, clear subcategory unless the new category contains that sub
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      service: value,
      subcategory: "",
    }));
  };

  const currentSubcategories = formData.service ? subcategoriesMap[formData.service] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-r from-peach-300 to-navy-700 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold mb-1">
            Contact <span className="text-white">Us</span>
          </h1>
          <p className="text-white max-w-2xl mx-auto text-sm">
            We're here to help! Get in touch with our team in <strong>{location}</strong>.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-xl order-1 lg:order-2">
              <h3 className="text-2xl font-bold text-navy-800 mb-4">Request a Service Quote</h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <InputGroup
                  label="Full Name *"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                />

                <div className="grid sm:grid-cols-2 gap-3">
                  <InputGroup
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="your@email.com"
                  />

                  <InputGroup
                    label="Phone Number *"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Category
                    </label>

                    {loadingServices ? (
                      <div className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-600">
                        Loading categories...
                      </div>
                    ) : (
                      <select
                        name="service"
                        value={formData.service}
                        onChange={(e) => {
                          handleCategoryChange(e);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specific Service
                    </label>

                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      disabled={!formData.service || currentSubcategories.length === 0}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="">Select a specific service</option>
                      {currentSubcategories.map((sub, idx) => (
                        <option key={idx} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    {formData.service && currentSubcategories.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No services available in this category.</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full p-2 border rounded-lg bg-white ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your requirements and location..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-peach-300 to-navy-700 text-white py-2 rounded-lg font-semibold hover:bg-navy-800 transition-all shadow-md mt-4 text-base"
                >
                  Submit Request
                </button>
              </form>
            </div>

            <div className="space-y-4 order-2 lg:order-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Our Details in {location}</h2>
              <p className="text-gray-600 text-sm">Reach out to us directly or fill out the form for a prompt quote.</p>

              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-md font-semibold text-gray-900 mb-2 border-b pb-1">Call or Email</h3>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Phone size={16} className="text-navy-700" />
                    <a
                      href={`tel:${currentDetails.phone.replace(/[^0-9+]/g, "")}`}
                      className="text-gray-700 hover:text-navy-500 font-medium"
                    >
                      {currentDetails.phone}
                    </a>
                  </div>

                  {currentDetails.contactnumber && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Phone size={16} className="text-navy-700" />
                      <a href={`tel:${currentDetails.contactnumber}`} className="text-gray-700 hover:text-navy-500 font-medium">
                        +91 {currentDetails.contactnumber}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-navy-700" />
                    <a href={`mailto:${currentDetails.email}`} className="text-gray-700 hover:text-navy-500 break-all">
                      {currentDetails.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                  <MapPin size={18} className="text-navy-700 mt-1" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">Our Location</h3>
                    <p className="text-gray-600 text-sm leading-snug mb-1">{currentDetails.address}</p>

                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="text-peach-500 text-xs font-medium hover:text-navy-700 flex items-center gap-1">
                      <MapPin size={14} /> View Directions from My Location
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                  <Clock size={18} className="text-navy-700 mt-1" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600 text-sm">{currentDetails.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-2 bg-white">{/* Additional content if needed */}</section>
    </div>
  );
};

export default Contact;