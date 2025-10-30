import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Wrench,
  FileText,
  TrendingUp,
  Settings,
  Camera,
  X,
  PersonStandingIcon, // <--- IMPORTED THE MISSING ICON
} from "lucide-react";

// --- Navigation Data ---
const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Services", href: "/services", icon: Wrench },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Financial", href: "/financial", icon: TrendingUp },
  { name: "Gallery", href: "/gallery", icon: Camera },
  // These lines are now safe to uncomment, as the icon is imported:
  // { name: "Staff", href: "/staff", icon: PersonStandingIcon },
  // { name: "StaffDashboard", href: "/staffdashboard", icon: PersonStandingIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

// --- Component Props Interface ---
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// --- Sidebar Component (No changes needed inside the component itself) ---
export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl p-0 m-0 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-peach-300 to-navy-700">
          <div className="flex items-center">
            <img
              src="/kushiservices logo.png"
              alt="Kushi Services"
              className="w-10 h-10 object-contain bg-white rounded-lg p-1 shadow-md"
            />
            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">Kushi Services</h1>
              <p className="text-xs text-primary-100">Admin Dashboard</p>
            </div>
          </div>

          {/* Close Button for mobile */}
          <button
            className="md:hidden p-1 rounded-md bg-white dark:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5 text-gray-700 dark:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)} // close on mobile
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-peach-300 to-navy-700 text-white shadow-lg scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-peach-100 hover:to-navy-300 hover:text-peach-300 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-primary-900/20 dark:hover:to-coral-900/20 dark:hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-5 w-5 ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-peach-300 dark:group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}