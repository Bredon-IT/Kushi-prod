import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-coral-400 to-peach-400 bg-clip-text text-transparent">
              Kushi Services
            </h3>
            <p className="text-gray-400 mb-4">
              Premium cleaning and hygiene services that set the industry standard. 
              Making your space immaculate, safe, and professionally maintained.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-coral-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral-400 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/services" className="hover:text-white transition-colors">Residential Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Commercial Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Pest Control</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Packers & Movers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+91 9606999081/82/83/84/85</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@kushiservices.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1" />
                <span>: No 115, GVR Complex, Thambu Chetty Palya Main Rd, opposite to Axis Bank ATM, P and T Layout, Anandapura, Battarahalli<br />Bengaluru, Karnataka 560049</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Kushi Services. All rights reserved. Excellence Guaranteed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;