import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoogleReviews from "../components/GoogleReviews";
 
const Categories: React.FC = () => {
  const navigate = useNavigate();
 
  const categories = [
    { title: 'Residential Cleaning Services', icon: '🏠' },
    { title: 'Commercial Cleaning Services', icon: '🏢' },
    { title: 'Industrial Cleaning Services', icon: '🏭' },
    { title: 'Pest Control Services', icon: '🐜' },
    { title: 'Marble Polishing Services', icon: '🪞' },
    { title: 'Packers And Movers', icon: '🚚' },
  ];
 
  const handleCategoryClick = (category: string) => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/services/category/${slug}`, { state: { selectedCategory: category } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

 useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);
 
  return (
    <div className="bg-gradient-to-br from-peach-50 to-navy-50 relative pb-12">
 
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-peach-300 to-navy-700 text-white py-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-8 text-center">
          <h1 className="text-xl md:text-3xl font-bold mb-2 animate-fade-in">
            Professional <span className="text-peach-300">Cleaning</span> Services
          </h1>
          <p className="text-sm mb-0 max-w-3xl mx-auto text-peach-100 animate-fade-in-delay">
            Transform your space with our premium cleaning solutions. Professional, reliable, and trusted by thousands of satisfied customers across Bangalore.
          </p>
        </div>
      </div>
 
      {/* Categories */}
      <div className="bg w-full py-2">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-navy-900 mb-6">
              Explore Our <span className="text-peach-400">Categories</span>
            </h2>
          </div>
 
          {/* Category Grid */}
          <div className="grid category-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((cat, index) => (
              <div
                key={cat.title}
                onClick={() => handleCategoryClick(cat.title)}
                className={`group rounded-3xl shadow-xl overflow-hidden
                transition-all duration-500 transform hover:-translate-y-2 hover:scale-105
                border-2 cursor-pointer bg-white text-navy-900 border-peach-200
                hover:bg-gradient-to-r hover:from-peach-300 hover:to-navy-700 hover:text-white`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">{cat.icon}</div>
                  <h3 className="text-xl font-bold mb-2 transition-colors duration-300">{cat.title}</h3>
                  <p className="text-sm transition-colors duration-300">View Types</p>
                </div>
              </div>
            ))}
          </div>
 
          {/* Google Reviews */}
          <GoogleReviews />
        </div>
      </div>
 
      {/* Same mobile/tablet/desktop styles */}
      <style>{`
        ${/* COPY EXACT CSS YOU HAD */""}
        @media (max-width: 640px) {
          .category-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .category-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1025px) {
          .category-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
 
    </div>
  );
};
 
export default Categories;
 
 