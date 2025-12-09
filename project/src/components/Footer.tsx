import React from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageSquare,
  Linkedin,
  Copyright,
} from "lucide-react";
import { useLocationContext } from "../contexts/LocationContext";

// Convert service name to slug
const createSlug = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
};

const Footer: React.FC = () => {
  const { location } = useLocationContext();

  const locationDetails: Record<string, any> = {
    Bangalore: {
      phone: "+91 9606999081/82/83/84/85",
      email: "info@kushiservices.in",
      address:
        "No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049",
      whatsappNumber: "9606999084",
      facebookUrl: "https://www.facebook.com/kushiservices",
      instagramUrl: "https://www.instagram.com/kushiservices?utm_source=qr&igsh=MThrcGFtcXlrMXZicg==",
      linkedinUrl: "https://www.linkedin.com/company/kushi-services/",
    },
    Hyderabad: {
      phone: "+91 9606999081/82/83/84/85",
      email: "info.hyderabad@kushiservices.in",
      address: "Some Hyderabad Address, Telangana 500001",
      whatsappNumber: "9606999084",
      facebookUrl: "https://www.facebook.com/kushiservices",
      instagramUrl: "https://www.instagram.com/kushiservices?utm_source=qr&igsh=MThrcGFtcXlrMXZicg==",
      linkedinUrl: "https://www.linkedin.com/company/kushi-services/",
    },
  };

  const serviceLinks = [
    "Residential Cleaning Services",
    "Commercial Cleaning Services",
    "Industrial Cleaning Services",
    "Pest Control Services",
    "Marble Polishing Services",
    "Packers And Movers",
  ];

  const current = locationDetails[location] || locationDetails["Bangalore"];

  const getWhatsAppLink = (number: string) => {
    const prefilledMessage = encodeURIComponent(
      "Hello Kushi Services, I saw your website and would like to inquire about your cleaning services."
    );
    return `https://wa.me/${number}?text=${prefilledMessage}`;
  };

  return (
    <footer className="bg-gray-900 py-20 border-t border-gray-800">

      {/* MOBILE FONT + HEIGHT FIX */}
      <style>{`
        @media (max-width: 639px) {
          footer {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }

          .footer-title {
            font-size: 1.25rem !important; /* text-xl */
          }

          .footer-small {
            font-size: 0.9rem !important; /* slightly bigger */
            line-height: 1.3rem !important;
          }

          .footer-links-mobile {
            display: flex !important;
            justify-content: space-between;
            gap: 1rem;
          }

          .footer-quick,
          .footer-services {
            width: 48% !important;
          }

          .footer-quick a,
          .footer-services a {
            font-size: 0.9rem !important;
          }
        }
      `}</style>

      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* DESKTOP VIEW */}
        <div className="hidden md:flex md:flex-row md:justify-between md:items-start gap-12">

          {/* BRAND SECTION */}
          <div className="w-1/4">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-peach-300 to-peach-300 bg-clip-text text-transparent">
              Kushi Services - {location}
            </h2>

            <p className="text-gray-400 text-base mb-4">
              Premium cleaning and hygiene services in <strong>{location}</strong>.
            </p>

            <div className="flex space-x-5 mt-3">
              <a href={current.facebookUrl} target="_blank" className="text-gray-400 hover:text-peach-300"><Facebook size={20} /></a>
              <a href={current.instagramUrl} target="_blank" className="text-gray-400 hover:text-peach-300"><Instagram size={20} /></a>
              <a href={current.linkedinUrl} target="_blank" className="text-gray-400 hover:text-blue-400"><Linkedin size={20} /></a>
              <a href={getWhatsAppLink(current.whatsappNumber)} target="_blank" className="text-gray-400 hover:text-green-500"><MessageSquare size={20} /></a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="w-1/4">
            <h4 className="text-lg font-bold mb-3 text-white border-b border-gray-700 pb-1">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-base">
              <li><Link to="/" className="hover:text-peach-300">Home</Link></li>
              <li><Link to="/services" className="hover:text-peach-300">Services</Link></li>
              <li><Link to="/about" className="hover:text-peach-300">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-peach-300">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-peach-300">Contact</Link></li>
            </ul>
          </div>

          {/* SERVICES SECTION */}
          <div className="w-1/4">
            <h4 className="text-lg font-bold mb-3 text-white border-b border-gray-700 pb-1">Our Services</h4>
            <ul className="space-y-2 text-gray-400 text-base">
              {serviceLinks.map((serviceName) => (
                <li key={serviceName}>
                  <Link
                    to={`/services/category/${createSlug(serviceName)}`}
                    state={{ selectedCategory: serviceName }}
                    className="hover:text-peach-300"
                  >
                    {serviceName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="w-1/4">
            <h4 className="text-lg font-bold mb-3 text-white border-b border-gray-700 pb-1">
              Contact Us ({location})
            </h4>

            <div className="space-y-3 text-gray-300 text-base">
              <div className="flex items-start gap-2"><Phone size={18} className="text-peach-300 mt-1" />{current.phone}</div>
              <div className="flex items-start gap-2"><Mail size={18} className="text-peach-300 mt-1" />{current.email}</div>

              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-peach-300 mt-1" />
                <span className="text-sm">{current.address}</span>
              </div>

              <div className="flex items-start gap-2">
                <Copyright size={18} className="text-peach-300 mt-1" />
                <span className="text-sm">Kushi Services © {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden grid grid-cols-1 gap-6 mt-6">

          {/* BRAND */}
          <div>
            <h2 className="footer-title font-bold mb-2 bg-gradient-to-r from-peach-300 to-peach-300 bg-clip-text text-transparent">
              Kushi Services - {location}
            </h2>

            <p className="footer-small text-gray-400 mb-3">
              Premium cleaning services in <strong>{location}</strong>.
            </p>

            <div className="flex space-x-4 mt-1">
              <a href={current.facebookUrl} target="_blank" className="text-gray-400 hover:text-peach-300"><Facebook size={18} /></a>
              <a href={current.instagramUrl} target="_blank" className="text-gray-400 hover:text-peach-300"><Instagram size={18} /></a>
              <a href={current.linkedinUrl} target="_blank" className="text-gray-400 hover:text-blue-400"><Linkedin size={18} /></a>
              <a href={getWhatsAppLink(current.whatsappNumber)} target="_blank" className="text-gray-400 hover:text-green-500"><MessageSquare size={18} /></a>
            </div>
          </div>

          {/* QUICK LINKS + SERVICES */}
          <div className="footer-links-mobile">

            <div className="footer-quick">
              <h4 className="footer-title font-semibold mb-2 text-white border-b border-gray-700 pb-1">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 footer-small">
                <li><Link to="/" className="hover:text-peach-300">Home</Link></li>
                <li><Link to="/services" className="hover:text-peach-300">Services</Link></li>
                <li><Link to="/about" className="hover:text-peach-300">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-peach-300">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-peach-300">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-services">
              <h4 className="footer-title font-semibold mb-2 text-white border-b border-gray-700 pb-1">Our Services</h4>
              <ul className="space-y-2 text-gray-400 footer-small">
                {serviceLinks.map((serviceName) => (
                  <li key={serviceName}>
                    <Link
                      to={`/services/category/${createSlug(serviceName)}`}
                      state={{ selectedCategory: serviceName }}
                      className="hover:text-peach-300"
                    >
                      {serviceName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* MOBILE CONTACT */}
          <div>
            <h4 className="footer-title font-semibold mb-2 text-white border-b border-gray-700 pb-1">
              Contact Us ({location})
            </h4>
            <div className="space-y-3 text-gray-300 footer-small">
              <div className="flex items-start gap-2"><Phone size={16} className="text-peach-300 mt-1" />{current.phone}</div>
              <div className="flex items-start gap-2"><Mail size={16} className="text-peach-300 mt-1" />{current.email}</div>
              <div className="flex items-start gap-2"><MapPin size={16} className="text-peach-300 mt-1" /><span>{current.address}</span></div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;