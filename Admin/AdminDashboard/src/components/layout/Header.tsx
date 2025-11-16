import { Menu, Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-navy-700 via-peach-200 to-peach-300 shadow-lg">
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 md:py-2">
        {/* Left Section: Sidebar toggle + Logo */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-white/90 hover:bg-white/20 transition-all"
          >
            <Menu className="h-6 w-6" />
          </button>

          <img
            src="/public/kushiKlogo.png"
            alt="Kushi Services"
            className="w-12 h-12 md:w-10 md:h-10 shadow-md"
          />

          <div className="flex flex-col truncate min-w-0">
            <h1 className="text-white font-bold text-lg md:text-xl lg:text-2xl truncate">
              Kushi Services
            </h1>
            <p className="text-white/80 text-sm md:text-base truncate hidden sm:block">
              Welcome back, Admin! • Dashboard Overview
            </p>
          </div>
        </div>

        {/* Right Section: Theme toggle + User info + Logout */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-white" />
            ) : (
              <Sun className="h-5 w-5 text-white" />
            )}
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-2 md:space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-2 shadow-lg border border-white/30 hover:bg-white/20 transition-all cursor-pointer">
            <User className="h-6 w-6 black-white" />
            <div className="hidden sm:flex flex-col">
              <span className="text-black font-semibold text-sm md:text-base">
                Admin User
              </span>
              <span className="text-black/80 text-xs md:text-sm">Administrator</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/70 hover:bg-red-500/90 text-white transition-all"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
