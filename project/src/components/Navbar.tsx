import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  cartItemCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(cartItemCount);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Locations with images
  const locations = [
    { name: "Bangalore", image: "/bangalore.png" },
    { name: "Hyderabad", image: "/Hyderabad.png" },
  ];

  // Initialize selectedLocation from localStorage (or fallback to Bangalore)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("userLocation") || "Bangalore";
  });

  // Function to handle location select
  const handleLocationSelect = (city: string) => {
    setSelectedLocation(city);
    setIsLocationOpen(false);
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

  // ✅ Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Save selectedLocation to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("userLocation", selectedLocation);
  }, [selectedLocation]);

  // Close location dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/signin");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-lg"
          : "bg-white/90 backdrop-blur-sm"
      } border-b border-peach-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/kushilogo.jpg"
              alt="Kushi Services Logo"
              className="h-20 w-auto mr-4"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(item.path)
          ? "bg-white text-navy-700 hover:bg-peach-300 hover:text-white" // Active state with hover
          : "text-navy-700 hover:bg-peach-300 hover:text-white" // Default state
      }`}
    >
      {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-navy-100 text-navy-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-200 transition-all"
                >
                  <User size={16} />
                  <span className="font-semibold">
                    {user.firstName ?? user.fullName?.split(" ")[0] ?? ""}
                    {user.lastName ? ` ${user.lastName}` : ""}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-peach-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-peach-200">
                      <p className="text-sm font-semibold text-navy-700">
                        {user.firstName ?? user.fullName?.split(" ")[0] ?? ""}
                        {user.lastName ? ` ${user.lastName}` : ""}
                      </p>
                      <p className="text-xs text-navy-700">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-peach-150 transition-colors"
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <Link
                      to="/orderhistory"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-peach-150 transition-colors"
                    >
                      <ShoppingCart size={14} /> Order History
                    </Link>
                    <div className="px-4 py-2 text-xs text-navy-700 border-t border-peach-200 mt-2">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-semibold">
                          {user?.totalBookings ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-semibold">
                          ₹{user?.totalSpent?.toLocaleString() ?? "0"}
                        </span>
                      </div>
                    </div>
                    <hr className="my-2 border-peach-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-150 transition-colors"
                    >
                      <LogIn size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
               <Link
  to="/signin"
  className="flex items-center gap-1 bg-white text-navy-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:bg-peach-300 hover:text-white hover:border-peach-300"
>
  <LogIn size={16} /> Sign In
</Link>
<Link
  to="/signup"
  className="flex items-center gap-1 bg-white text-navy-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:bg-peach-300 hover:text-white hover:border-peach-300 shadow-md"
>
  <UserPlus size={16} /> Sign Up
</Link>

              </div>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative bg-white text-navy-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-peach-300 hover:text-white transition-all shadow-md flex items-center gap-1"
>
              <ShoppingCart size={16} /> Cart
              {cartCount > 0 && (
                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartCount}
                </span>
              )}
            </Link>

            {/* Book Now */}
            <Link
              to="/booking"
             className="bg-white text-navy-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-peach-300 hover:text-white transition-all shadow-md"
>
              Book Now
            </Link>

            {/* Desktop Location Dropdown */}
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-200 transition-all"
              >
                {locations.find((loc) => loc.name === selectedLocation) && (
                  <img
                    src={
                      locations.find((loc) => loc.name === selectedLocation)!
                        .image
                    }
                    alt={selectedLocation}
                    className="h-10 w-12 object-cover rounded"
                  />
                )}
                <span>{selectedLocation}</span>
                <ChevronDown size={14} />
              </button>

              {isLocationOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                  {locations.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleLocationSelect(city.name)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <img
                        src={city.image}
                        alt={city.name}
                        className="h-10 w-14 object-cover rounded"
                      />
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-navy-700 hover:text-navy-700 hover:bg-peach-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-peach-300">
            {navItems.map((item) => (
  <Link
    key={item.name}
    to={item.path}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(item.path)
          ? "bg-white text-navy-700 hover:bg-peach-300 hover:text-white" // Active state with hover
          : "text-navy-700 hover:bg-peach-300 hover:text-white" // Default state
      }`}
    >
      {item.name}
  </Link>
))}
            {/* Mobile Cart */}
           <Link
  to="/cart"
  className="relative bg-white text-navy-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-peach-300 hover:text-white transition-all shadow-md flex items-center gap-1"
>
  <ShoppingCart size={16} /> Cart
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartCount}
    </span>
  )}
</Link>

            {!isAuthenticated && (
              <>
                <Link
  to="/signin"
  onClick={() => setIsMenuOpen(false)}
  className="block w-full bg-white text-navy-700 px-3 py-2 rounded-md text-base font-medium transition-colors border border-transparent hover:bg-peach-300 hover:text-white hover:border-peach-300 flex items-center gap-2"
>
  <LogIn size={18} /> Sign In
</Link>
<Link
  to="/signup"
  onClick={() => setIsMenuOpen(false)}
  className="block w-full bg-white text-navy-700 px-3 py-2 rounded-md text-base font-medium transition-colors border border-transparent hover:bg-peach-300 hover:text-white hover:border-peach-300 flex items-center gap-2"
>
  <UserPlus size={18} /> Sign Up
</Link>

              </>
            )}

            {isAuthenticated && user && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-peach-100 to-navy-100 text-navy-700 px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center gap-2 border border-peach-300"
              >
                <User size={18} />{" "}
                {user.firstName ?? user.fullName?.split(" ")[0] ?? ""}
                {user.lastName ? ` ${user.lastName}` : ""}
              </Link>
            )}

           <Link
  to="/booking"
  className="bg-white text-navy-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-peach-300 hover:text-white transition-all shadow-md"
>
  Book Now
</Link>

            {/* Mobile Location Dropdown */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-base font-medium cursor-pointer hover:bg-gray-200 transition-all w-full"
              >
                {locations.find((loc) => loc.name === selectedLocation) && (
                  <img
                    src={
                      locations.find((loc) => loc.name === selectedLocation)!
                        .image
                    }
                    alt={selectedLocation}
                    className="h-5 w-7 object-cover rounded"
                  />
                )}
                <span>{selectedLocation}</span>
                <ChevronDown size={16} />
              </button>

              {isLocationOpen && (
                <div className="mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                  {locations.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleLocationSelect(city.name)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <img
                        src={city.image}
                        alt={city.name}
                        className="h-10 w-14 object-cover rounded"
                      />
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
