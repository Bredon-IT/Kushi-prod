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

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const updateCart = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartCount(cartItemCount || items.length);
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, [cartItemCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 shadow-lg" : "bg-white/90"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Left: Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src="/kushilogo.jpg" alt="Logo" className="h-16 w-auto" />
        </Link>

        {/* Right: Nav + Actions (Desktop) */}
        <div className="hidden lg:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive(item.path)
                  ? "text-peach-600"
                  : "text-navy-700 hover:text-peach-500"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Location Dropdown */}
          <div className="relative" ref={desktopDropdownRef}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              {selectedLocation || "Select Location"} <ChevronDown size={14} />
            </button>
            {isLocationOpen && (
              <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
                {locations.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleLocationSelect(city.name)}
                    className="flex items-center gap-2 w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded"
                  >
                    <img
                      src={city.image}
                      alt={city.name}
                      className="h-6 w-10 object-cover rounded"
                    />
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative px-3 py-2 rounded-md text-sm font-medium bg-white shadow-md hover:bg-peach-300 hover:text-white"
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Book Now */}
          <Link
            to="/booking"
            className="px-4 py-2 rounded-md text-sm font-medium bg-white shadow-md hover:bg-peach-300 hover:text-white"
          >
            Book Now
          </Link>

          {/* Menu Dropdown */}
          <div className="relative" ref={desktopDropdownRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Menu <ChevronDown size={14} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path!}
                    className="block px-4 py-2 text-sm text-navy-700 hover:bg-gray-100 rounded"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2 border-gray-200" />
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/signin"
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-gray-100 rounded"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-gray-100 rounded"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-gray-100 rounded"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded"
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
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-navy-700 hover:bg-peach-200"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-4 flex flex-col">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-navy-700 hover:bg-peach-200"
              >
                <X size={22} />
              </button>
            </div>

            {/* Cart and Book Now */}
            <div className="flex flex-col space-y-2 mb-4">
              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
              >
                <ShoppingCart size={16} />
                Cart {cartCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/booking"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
              >
                Book Now
              </Link>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col space-y-2 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Location Selector */}
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Select Location</p>
              {locations.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    handleLocationSelect(city.name);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-6 w-10 object-cover rounded"
                  />
                  <span>{city.name}</span>
                </button>
              ))}
            </div>

            <hr className="my-2 border-gray-200" />

            {/* Other Menu Items */}
            <div className="flex flex-col space-y-2 mb-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path!}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <hr className="my-2 border-gray-200" />

            {/* Authentication */}
            <div className="flex flex-col space-y-2 mt-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-navy-700 hover:bg-peach-100 rounded text-base font-medium"
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
