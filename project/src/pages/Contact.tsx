import React, { useState } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useLocationContext } from "../contexts/LocationContext";
import { useNavigate } from 'react-router-dom';
import Global_API_BASE from '../services/GlobalConstants';
 
const locationDetails: Record<string, any> = {
  Bangalore: {
    phone: "+91 9606999081/82/83/84/85",
    contactnumber :"8792288656",
    email: "info@kushiservices.in",
    address: "No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049",
    hours: 'Mon-Sat: 8:00 AM - 8:00 PM | Sun: Emergency'
  },
  Hyderabad: {
    phone:"+91 9606999081/82/83/84/85",
    contactnumber :"8792288656",
    email: "info.hyderabad@kushiservices.in",
    address: "Some Hyderabad Address, Telangana 500001 (Near Test Landmark)",
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM | Sun: Closed'
  }
};
 
const servicesWithSubcategories: { [key: string]: string[] } = {
  residential: [
    'Home Deep Cleaning Services','Kitchen Cleaning Services','Bathroom Cleaning Services',
    'Carpet Cleaning Services','Sofa Cleaning Services','Mattress cleaning Services',
    'Window Cleaning Services','Exterior Cleaning','Water Tank Cleaning','Floor Deep Cleaning Services'
  ],
  commercial: [
    'Commercial Cleaning Services','Office Cleaning Services','Office Carpet Cleaning Services',
    'Office Chair Cleaning Services','Hotel and restaurant cleaning'
  ],
  industrial: ["Factory Cleaning","Machine Cleaning","Industrial Floor Polishing"],
  pestControl: [
    'Cockroach Pest Control','Bedbug Pest Control','Termite Treatment','Rodent Pest Control',
    'Mosquito Pest Control','General Pest Control','Commercial Pest Control','AMC Pest Control'
  ],
  marblePolishing: [
    'Indian Marble Polishing Services','Italian Marble Polishing Services','Mosaic Tile Polishing Services'
  ],
  packersMovers: ['Home Shifting Services','Office Shifting Services'],
  other: ['Borewell Motor Repair Services','Swimming Pool Cleaning Services','Paver Laying Services']
};
 
const InputGroup = ({ label, name, type, value, onChange, error, placeholder }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded-lg focus:ring-navy-500 focus:border-navy-500 text-gray-900 placeholder-gray-500 text-sm bg-gray-50 ${error ? 'border-red-500' : 'border-gray-300'}`}
      placeholder={placeholder}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
 
const Contact: React.FC = () => {
  const { location } = useLocationContext();
  const navigate = useNavigate();
  const currentDetails = locationDetails[location] || locationDetails['Bangalore'];
 
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', service: '', subcategory: '', message: ''
  });
 
  const [errors, setErrors] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
 
  const encodedAddress = encodeURIComponent(currentDetails.address);
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
 
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axios.post(Global_API_BASE + "/api/contact/submit", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location,
          serviceCategory: formData.service,
          subcategory: formData.subcategory,
          message: formData.message
        });
 
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', service: '', subcategory: '', message: '' });
 
        setTimeout(() => {
  setIsSubmitted(false);
  navigate("/thank-you");
}, 1500);
 
 
      } catch (error) {
        console.error("Failed to send contact form", error);
      }
    }
  };
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "service" ? { subcategory: '' } : {})
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
 
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-r from-peach-300 to-navy-700 text-white pt-6 pb-2 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-4xl font-extrabold mb-1">Contact <span className="text-white">Us</span></h1>
            <p className="text-black max-w-2xl mx-auto text-sm">We're here to help! Get in touch with our team in <strong>{location}</strong>.</p>
          </div>
        </div>
      </section>
 
      <section className="py-8">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
 
            {/* FORM */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-xl order-1 lg:order-2">
              <h3 className="text-2xl font-bold text-navy-800 mb-4">Request a Service Quote</h3>
 
             
 
              <form onSubmit={handleSubmit} className="space-y-3">
 
                <InputGroup label="Full Name *" name="name" type="text"
                  value={formData.name} onChange={handleChange}
                  error={errors.name} placeholder="Enter your full name" />
 
                <div className="grid sm:grid-cols-2 gap-3">
                  <InputGroup label="Email Address *" name="email" type="email"
                    value={formData.email} onChange={handleChange}
                    error={errors.email} placeholder="your@email.com" />
 
                  <InputGroup label="Phone Number *" name="phone" type="tel"
                    value={formData.phone} onChange={handleChange}
                    error={errors.phone} placeholder="+91 98765 43210" />
                </div>
 
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                    <select name="service" value={formData.service}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                      <option value="">Select a category</option>
                      <option value="residential">Residential Cleaning</option>
                      <option value="commercial">Commercial Cleaning</option>
                      <option value="industrial">Industrial Cleaning</option>
                      <option value="pestControl">Pest Control</option>
                      <option value="marblePolishing">Marble Polishing</option>
                      <option value="packersMovers">Packers & Movers</option>
                      <option value="other">Other Services</option>
                    </select>
                  </div>
 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Service</label>
                    <select name="subcategory" value={formData.subcategory}
                      onChange={handleChange} disabled={!formData.service}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100">
                      <option value="">Select a specific service</option>
                      {formData.service &&
                        servicesWithSubcategories[formData.service]?.map((sub, idx) => (
                          <option key={idx} value={sub}>{sub}</option>
                        ))}
                    </select>
                  </div>
                </div>
 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea name="message" value={formData.message}
                    onChange={handleChange} rows={2}
                    className={`w-full p-2 border rounded-lg bg-white ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tell us about your requirements and location..." />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>
 
                <button type="submit"
                  className="w-full bg-gradient-to-r from-peach-300 to-navy-700 text-white py-2 rounded-lg font-semibold hover:bg-navy-800 transition-all shadow-md mt-4 text-base">
                  Submit Request
                </button>
              </form>
            </div>
 
            {/* CONTACT DETAILS */}
            <div className="space-y-4 order-2 lg:order-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Our Details in {location}</h2>
              <p className="text-gray-600 text-sm">Reach out to us directly or fill out the form for a prompt quote.</p>
 
              <div className="space-y-3">
 
                {/* Call / Email */}
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-md font-semibold text-gray-900 mb-2 border-b pb-1">Call or Email</h3>
 
                  {/* Primary Phone */}
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Phone size={16} className="text-navy-700" />
                    <a href={`tel:${currentDetails.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-gray-700 hover:text-navy-500 font-medium">
                      {currentDetails.phone}
                    </a>
                  </div>
 
                  {/* Alternate Number */}
                  {currentDetails.contactnumber && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Phone size={16} className="text-navy-700" />
                      <a href={`tel:${currentDetails.contactnumber}`}
                        className="text-gray-700 hover:text-navy-500 font-medium">
                        +91 {currentDetails.contactnumber}
                      </a>
                    </div>
                  )}
 
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-navy-700" />
                    <a href={`mailto:${currentDetails.email}`}
                      className="text-gray-700 hover:text-navy-500 break-all">
                      {currentDetails.email}
                    </a>
                  </div>
                </div>
 
                {/* Location */}
                <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                  <MapPin size={18} className="text-navy-700 mt-1" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">Our Location</h3>
                    <p className="text-gray-600 text-sm leading-snug mb-1">{currentDetails.address}</p>
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-peach-500 text-xs font-medium hover:text-navy-700 flex items-center gap-1">
                      <MapPin size={14} /> View Directions from My Location
                    </a>
                  </div>
                </div>
 
                {/* Business Hours */}
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
    </div>
  );
};
 
export default Contact;
