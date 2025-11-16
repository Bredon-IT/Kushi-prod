import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocationContext } from "../contexts/LocationContext";

const Navbar: React.FC<{ cartItemCount?: number }> = ({ cartItemCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [cartCount, setCartCount] = useState(cartItemCount);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { location: selectedLocation, setLocation } = useLocationContext();

  const navRef = useRef<HTMLElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const locations = [
    { name: "Bangalore", image: "/bangalore.png" },
    { name: "Hyderabad", image: "/Hyderabad.png" },
  ];

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

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/signin");
  };

  const handleLocationSelect = (city: string) => {
    setLocation(city);
    setIsLocationOpen(false);
  };

  // ✅ Scroll to top when navigating between routes
  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  // ✅ Update cart count from localStorage
  useEffect(() => {
    const updateCart = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartCount(cartItemCount || items.length);
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, [cartItemCount]);

  // ✅ Add shadow when scrolling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isMenuOpen && mobilePanelRef.current && !mobilePanelRef.current.contains(target))
        setIsMenuOpen(false);
      if (isLocationOpen && locationDropdownRef.current && !locationDropdownRef.current.contains(target))
        setIsLocationOpen(false);
      if (isUserMenuOpen && userDropdownRef.current && !userDropdownRef.current.contains(target))
        setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isLocationOpen, isUserMenuOpen]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-xl" : "bg-white"
      }`}
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link
          to="/"
          className="flex-shrink-0 flex items-center"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img src="/kushilogo.jpg" alt="Logo" className="h-16 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-peach-300 bg-white shadow-sm"
                  : "text-navy-700 hover:text-peach-500 hover:white-200"
              }`}
            >
              {item.name}
            </button>
          ))}

          {/* Location Dropdown */}
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-peach-300 rounded-md text-sm font-medium hover:bg-peach-300 shadow-sm transition-colors duration-200"
            >
              {selectedLocation || "Select Location"}
              <ChevronDown
                size={14}
                className={isLocationOpen ? "transform rotate-180" : ""}
              />
            </button>
            {isLocationOpen && (
              <div className="absolute mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-100 py-2 z-50">
                {locations.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleLocationSelect(city.name)}
                    className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-navy-700 hover:bg-peach-100 transition-colors duration-200"
                  >
                    <span>{city.name}</span>
                    <img
                      src={city.image}
                      alt={city.name}
                      className="h-6 w-10 object-cover rounded shadow-inner"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full text-navy-700 bg-white shadow-md hover:bg-peach-300 hover:text-white transition-colors duration-200"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Book Now */}
          <Link
            to="/booking"
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-peach-300 shadow-lg hover:bg-peach-300 transition-colors duration-200"
          >
            Book Now
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-peach-300 rounded-md text-sm font-medium hover:bg-peach-200 shadow-sm transition-colors duration-200"
            >
              {isAuthenticated ? user?.name || "Profile" : "Menu"}
              <ChevronDown
                size={14}
                className={isUserMenuOpen ? "transform rotate-180" : ""}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg border border-gray-100 py-2 z-50">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path!}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-navy-700 hover:bg-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2 border-gray-200" />
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/signin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-white transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-white transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-white transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <Link
            to="/cart"
            className="relative p-2 rounded-full text-navy-700 hover:bg-peach-200 mr-2 transition-colors duration-200"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-navy-700 hover:bg-peach-300"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
          <div
            ref={mobilePanelRef}
            className="absolute top-0 right-0 w-64 h-full bg-white shadow-2xl p-4 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-navy-700 hover:bg-peach-300"
              >
                <X size={22} />
              </button>
            </div>

            <Link
              to="/booking"
              onClick={() => setIsMenuOpen(false)}
              className="mb-4 text-center px-4 py-2.5 rounded-full text-sm font-bold text-white bg-peach-300 shadow-lg hover:bg-peach-300 transition-colors duration-200"
            >
              Book Now
            </Link>

            {/* Navigation */}
            <div className="flex flex-col space-y-2 mb-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  className="block px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Location Selection */}
            <div className="mb-4 p-2 bg-white rounded-lg">
              <p className="text-sm font-bold mb-2 text-navy-700">
                Current Location: {selectedLocation || "Not Set"}
              </p>
              <hr className="my-2 border-gray-200" />
              <p className="text-xs font-semibold mb-2 text-gray-600">Change City</p>
              {locations.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    handleLocationSelect(city.name);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-navy-700 hover:bg-white rounded transition-colors duration-200"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-6 w-10 object-cover rounded shadow-inner"
                  />
                  <span>{city.name}</span>
                </button>
              ))}
            </div>

            <hr className="my-2 border-gray-200" />

            {/* Other Links */}
            <div className="flex flex-col space-y-2 mb-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path!}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-navy-700 hover:bg-peach-300 rounded text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <hr className="my-2 border-gray-200" />

            {/* Authentication Section */}
            <div className="flex flex-col space-y-2 mt-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-navy-700 hover:bg-peach-300 rounded text-base font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-navy-700 hover:bg-peach-300 rounded text-base font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-navy-700 hover:bg-peach-300 rounded text-base font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-100 rounded text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
