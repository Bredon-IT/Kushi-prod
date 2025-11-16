import React from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageSquare,
  Copyright,
} from "lucide-react";
import { useLocationContext } from "../contexts/LocationContext";

// --- Utility Function: Converts service name to URL slug ---
const createSlug = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const Footer: React.FC = () => {
  const { location } = useLocationContext();

  const locationDetails: Record<string, any> = {
    Bangalore: {
      phone: "+91 9606999081/82/83/84/85",
      email: "info@kushiservices.in",
      address:
        "No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049",
      whatsappNumber: "YOUR_TEST_WHATSAPP_NUMBER",
      facebookUrl: "https://www.facebook.com/kushiservices.bengaluru",
      instagramUrl: "YOUR_TEST_INSTA_URL",
    },
    Hyderabad: {
      phone:"+91 9606999081/82/83/84/85",
      email: "info.hyderabad@kushiservices.in",
      address: "Some Hyderabad Address, Telangana 500001",
      whatsappNumber: "YOUR_TEST_WHATSAPP_NUMBER",
      facebookUrl: "https://www.facebook.com/kushiservices.hyderabad",
      instagramUrl: "YOUR_TEST_INSTA_URL",
    },
  };

   const serviceLinks = [
    "Residential Cleaning Services",
    "Commercial Cleaning Services",
    "Industrial Cleaning Services",
    "Pest Control Services",
    "Marble Polishing Services",
    "Packers And Movers",
    "Other Services",
 ];

  const current = locationDetails[location] || locationDetails["Bangalore"];

  const getWhatsAppLink = (number: string) => {
    const prefilledMessage = encodeURIComponent(
      "Hello Kushi Services, I saw your website and would like to inquire about your cleaning services."
    );
    return `https://wa.me/${number}?text=${prefilledMessage}`;
  };

  return (
    <footer className="bg-gray-900 py-10 border-t border-gray-800">
      {/* Mobile layout tweak: place Quick Links and Our Services side-by-side on small screens */}
      <style>{`
        @media (max-width: 639px) {
          /* make the two sections occupy the same row on mobile */
          .footer-quick, .footer-services {
            display: inline-block;
            width: 48%;
            vertical-align: top;
            box-sizing: border-box;
          }
          /* reduce spacing so they fit nicely */
          .footer-quick ul, .footer-services ul { margin-top: 0.25rem; }
          .footer-quick h4, .footer-services h4 { margin-bottom: 0.5rem; }
          /* ensure icons/links wrap correctly */
          .footer-quick a, .footer-services a { word-break: break-word; }
        }
      `}</style>

      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          
          <div className="md:col-span-4">
            {/* REDUCED: mb-3 to mb-1 for tighter spacing */}
            <h2 className="text-2xl md:text-3xl font-extrabold mb-1 bg-gradient-to-r from-peach-300 to-peach-300 bg-clip-text text-transparent">
              Kushi Services - {location}
            </h2>
            {/* MODIFIED: text-md to text-sm, mb-6 to mb-4, leading-relaxed to leading-tight for compactness */}
            <p className="text-gray-400 mb-6 text-md leading-tight">
              Premium cleaning and hygiene services in <strong>{location}</strong>.
              <br />
              Making your space immaculate, safe, and professionally maintained.
            </p>
            <div className="flex space-x-5">
              <a
                href={current.facebookUrl}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-peach-300 transition-colors"
              >
                <Facebook size={22} />
              </a>

              <a
                href={current.instagramUrl}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-peach-300 transition-colors"
              >
                <Instagram size={22} />
              </a>
              
              <a
                href={getWhatsAppLink(current.whatsappNumber)}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors" 
              >
                <MessageSquare size={22} /> 
              </a>
            </div>
          </div>

          {/* added class footer-quick for mobile-only styling */}
          <div className="md:col-span-2 footer-quick">
            <h4 className="text-lg font-semibold mb-3 text-white border-b border-gray-700 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-peach-300 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-peach-300 transition-colors">Services</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-peach-300 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-peach-300 transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-peach-300 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* added class footer-services for mobile-only styling */}
           <div className="md:col-span-3 footer-services">
               <h4 className="text-lg font-semibold mb-3 text-white border-b border-gray-700 pb-2">Our Services</h4>
                 <ul className="space-y-2 text-gray-400">
                {serviceLinks.map((serviceName) => (
                    <li key={serviceName}>
                        <Link 
                            to={`/services/category/${createSlug(serviceName)}`} // <-- UPDATED: Use slug in the path
                            state={{ initialCategory: serviceName }} 
                            className="hover:text-peach-300 transition-colors"
                        >
                            {serviceName}
                        </Link>
                    </li>
                ))}
                     </ul>
                     </div>

          <div className="md:col-span-3">
            <h4 className="text-lg font-semibold mb-3 text-white border-b border-gray-700 pb-2">Contact Us ({location})</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-peach-300 flex-shrink-0 mt-0.5" />
                <a href={`tel:${current.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">{current.phone}</a>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-peach-300 flex-shrink-0 mt-0.5" />
                <a href={`mailto:${current.email}`} className="hover:text-white transition-colors break-all">{current.email}</a>
              </div>
              
              {/* MODIFIED SECTION: Added View Location link below the address */}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-peach-300 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm leading-relaxed">{current.address}</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(current.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-peach-300 text-xs font-medium hover:text-white transition-colors mt-1 inline-flex items-center gap-1"
                  >
                    <MapPin size={14} />
                    View Location on Map
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Copyright size={18} className="text-peach-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">Kushi Services © {new Date().getFullYear()}. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;