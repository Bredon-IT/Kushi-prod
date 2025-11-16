import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64">

        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Page content */}
        <main className="flex-1 overflow-auto pt-[70px]">

          {/* --- FORCED MOBILE HORIZONTAL SCROLL WRAPPER --- */}
          <div className="
            w-full 
            max-w-full 
            overflow-x-scroll 
            md:overflow-x-visible 
            scrollbar-thin 
            scrollbar-thumb-gray-400 
            scrollbar-track-transparent
          ">
            {/* Force wide content so mobile must scroll */}
            <div className="min-w-[1100px] px-6 sm:px-6 md:px-10 lg:px-12 xl:px-18 py-4">
              {children}
            </div>

          </div>
          {/* --- END MOBILE SCROLL WRAPPER --- */}

        </main>
      </div>
    </div>
  );
}
