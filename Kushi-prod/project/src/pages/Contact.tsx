import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const servicesWithSubcategories: { [key: string]: string[] } = {
  residential: [
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
  ],
  commercial: [
     'Commercial Cleaning Services',
  'Office Cleaning Services',
  'Office Carpet Cleaning Services',
  'Office Chair Cleaning Services',
  'Hotel and restaurant cleaning',
  
  ],
  industrial: [
    "Factory Cleaning",
    "Machine Cleaning",
    "Industrial Floor Polishing",
  ],
  pestControl: [
   'Cockroach Pest Control',
  'Bedbug Pest Control',
  'Termite Treatment',
  'Woodborer Pest Control',
  'Rodent Pest Control',
  'Mosquito Pest Control',
  'General Pest Control',
  'Commercial Pest Control',
  'AMC Pest Control',
  ],
  marblePolishing: [
   'Indian Marble Polishing Services',
  'Italian Marble Polishing Services',
  'Mosaic Tile Polishing Services',
  ],
  packersMovers: [
  'Home Shifting Services',
  'Office Shifting Services',
  ],
  other: ['Borewell Motor Repair Services',
  'Swimming Pool Cleaning Services',
  'Paver Laying and Maintenance Services',
  'Layout Development and Maintenance Services'
]
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    subcategory: '',
    message: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        subcategory: '',
        message: ''
      });
      
      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "service" ? { subcategory: '' } : {}) // reset subcategory if service changes
    }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="py-20 bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Contact <span className="bg-gradient-to-r from-navy-800 to-navy-800 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to transform your space? Contact our expert team today for a personalized consultation and premium service quote.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We're here to help you with all your cleaning and hygiene needs. Reach out to us through any of the following channels, and we'll get back to you promptly.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-lg">
                  <div className="bg-gradient-to-r from-navy-700 to-peach-300 text-white p-3 rounded-lg shadow-lg">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91 9606999081/82/83/84/85</p>
                    <p className="text-sm text-gray-500">Available 24/7 for emergencies</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-lg">
                  <div className="bg-gradient-to-r from-navy-700 to-peach-300 text-white p-3 rounded-lg shadow-lg">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">info@kushiservices.in</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-lg">
                  <div className="bg-gradient-to-r from-navy-700 to-peach-300 text-white p-3 rounded-lg shadow-lg">   
                     <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli<br/>
                      Bengaluru, Karnataka 560049
                    </p>
                    <p className="text-sm text-gray-500">Visit us for consultations</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-lg">
                  <div className="bg-gradient-to-r from-navy-700 to-peach-300 text-white p-3 rounded-lg shadow-lg">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                      <p>Saturday: 8:00 AM - 6:00 PM</p>
                      <p>Sunday: Emergency Services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl border border-orange-200 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <p className="text-green-700">Thank you! Your message has been sent successfully.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.name ? 'border-red-500' : 'border-orange-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                        errors.email ? 'border-red-500' : 'border-orange-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                        errors.phone ? 'border-red-500' : 'border-orange-300'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a service</option>
                    <option value="residential">Residential Cleaning Services</option>
                    <option value="commercial">Commercial Cleaning Services</option>
                    <option value="industrial">Industrial Cleaning Services</option>
                    <option value="pestControl">Pest Control Services</option>
                    <option value="marblePolishing">Marble Polishing Services</option>
                    <option value="packersMovers">Packers & Movers</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subcategory Dropdown */}
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    disabled={!formData.service}
                  >
                    <option value="">Select a subcategory</option>
                    {formData.service &&
                      servicesWithSubcategories[formData.service]?.map((sub, index) => (
                        <option key={index} value={sub}>{sub}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.message ? 'border-red-500' : 'border-orange-300'
                    }`}
                    placeholder="Tell us about your cleaning requirements..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-navy-700 to-peach-200 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
