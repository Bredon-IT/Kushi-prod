import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocationContext } from "../contexts/LocationContext";
 
const Navbar: React.FC<{ cartItemCount?: number }> = ({ cartItemCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMobileLocationOpen, setIsMobileLocationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
 
  const { user, isAuthenticated, logout } = useAuth();
  const { location: selectedLocation, setLocation } = useLocationContext();
 
  const navigate = useNavigate();
  const location = useLocation();
 
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
 
  const [cartCount, setCartCount] = useState(cartItemCount);
 
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ];
 
  const menuItems = [
    { name: "Gallery", path: "/gallery" },
    { name: "Blog", path: "/blog" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];
 
  const locationsList = [
    { name: "Bangalore", image: "/bangalore.png" },
    { name: "Hyderabad", image: "/Hyderabad.png" },
  ];
 
  const isActive = (path: string) => location.pathname === path;
 
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartCount(cartItemCount || items.length);
  }, [cartItemCount]);
 
  // Disable background scroll when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);
 
  // Close menus on clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
 
      if (isUserMenuOpen && userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
 
      if (isLocationOpen && locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    };
 
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isMobileMenuOpen, isUserMenuOpen, isLocationOpen]);
 
  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
 
  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMobileMenuOpen(false);
    setIsMobileLocationOpen(false);
  };
 
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/signin");
  };
 
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-xl" : ""
      }`}
    >
      <div className="max-w-10xl mx-auto px-3 flex items-center justify-between h-16">
 
        {/* LOGO */}
        <Link to="/">
          <img src="/kushilogo.jpg" className="h-16 w-auto" />
        </Link>
 
        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-4">
 
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`px-3 py-2 text-sm font-semibold ${
                isActive(item.path) ? "text-peach-300" : "text-navy-700 hover:text-peach-500"
              }`}
            >
              {item.name}
            </button>
          ))}
 
          {/* DESKTOP LOCATION */}
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="px-3 py-2 bg-peach-300 rounded-md text-sm"
            >
              {selectedLocation || "Location"}
            </button>
 
            {isLocationOpen && (
              <div className="absolute mt-2 w-48 bg-white shadow-xl rounded-lg border py-2">
                {locationsList.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      setLocation(city.name);
                      setIsLocationOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100"
                  >
                    {city.name}
                    <img src={city.image} className="h-6 w-10 rounded" />
                  </button>
                ))}
              </div>
            )}
          </div>
 
          {/* CART */}
          <Link to="/cart" className="relative p-2">
            <ShoppingCart size={20} />
          </Link>
 
          {/* DESKTOP BOOK NOW */}
          <Link
            to="/booking"
            className="px-5 py-2 rounded-full bg-peach-300 text-black font-semi-bold shadow-md hover:bg-gradient-to-r from-peach-300 to-navy-700 transition"
          >
            Book Now
          </Link>
 
          {/* DESKTOP USER MENU */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="px-3 py-2 bg-peach-300 rounded-md text-sm"
            >
              Menu
            </button>
 
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    {item.name}
                  </Link>
                ))}
 
                <hr />
 
                {!isAuthenticated ? (
                  <>
                    <Link to="/signin" className="block px-4 py-2 hover:bg-gray-100">Sign In</Link>
                    <Link to="/signup" className="block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* MOBILE MENU */}
        <div className="lg:hidden flex items-center gap-3 relative">
 
          <Link to="/cart" className="relative p-2">
            <ShoppingCart size={22} />
          </Link>
 
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-peach-300 text-white rounded-md"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
 
          {/* MOBILE FLOATING MENU */}
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="absolute right-0 top-14 w-64 bg-white shadow-xl rounded-lg border py-3 z-50"
            >
              {/* MOBILE BOOK NOW */}
              <Link
                to="/booking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center mx-3 mb-3 px-4 py-3 rounded-full bg-gradient-to-r from-peach-300 to-navy-700 text-black font-semi-bold shadow"
              >
                Book Now
              </Link>
 
              {/* NAV ITEMS */}
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {item.name}
                </button>
              ))}
 
              {/* MOBILE LOCATION DROPDOWN */}
              <hr className="my-2" />
              <button
                className="px-4 py-2 text-left w-full font-semibold"
                onClick={() => setIsMobileLocationOpen(!isMobileLocationOpen)}
              >
                Location {selectedLocation ? `(${selectedLocation})` : ""}
              </button>
 
              {isMobileLocationOpen && (
                <div className="px-4">
                  {locationsList.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        setLocation(city.name);
                        setIsMobileLocationOpen(false);
                      }}
                      className="flex items-center gap-3 py-2 w-full hover:bg-gray-100"
                    >
                      <img src={city.image} className="h-6 w-10 rounded" />
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
 
              {/* OTHER LINKS */}
              <hr className="my-2" />
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              ))}
 
              {/* AUTH */}
              <hr className="my-2" />
              {!isAuthenticated ? (
                <>
                  <Link to="/signin" className="block px-4 py-2 hover:bg-gray-100">Sign In</Link>
                  <Link to="/signup" className="block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
 
export default Navbar;
