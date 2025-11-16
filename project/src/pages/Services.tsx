import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Global_API_BASE from '../services/GlobalConstants';
import GoogleReviews from '../components/GoogleReviews';

 
interface Service {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    service_package: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: string;
    duration: string;
    image: string;
    description: string;
    features: string[];
    badge?: string;
    overview?: string;
    our_process?: string;
    benefits?: string;
    whats_included?: string;
    whats_not_included?: string;
    why_choose_us?: string;
    kushi_teamwork: string;
    faq: string;
    active: string;
}
 
 
const Services: React.FC = () => {
    const navigate = useNavigate();
    const [allServices, setAllServices] = useState<Service[]>([]);
    const location = useLocation();
const initialCategory = location.state?.selectedCategory || null;
const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
    const [isLoading, setIsLoading] = useState(true);

 
    const categories = [
        'Residential Cleaning Services',
        'Commercial Cleaning Services',
        'Industrial Cleaning Services',
        'Pest Control Services',
        'Marble Polishing Services',
        'Packers And Movers',
       
    ];



    useEffect(() => {
  if (initialCategory) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [initialCategory]);


 
    useEffect(() => {
        const fetchServices = async () => {
             setIsLoading(true); // Start loading
            try {
                const response = await fetch(Global_API_BASE + '/api/customers/all-services');
                if (!response.ok) throw new Error('Failed to fetch services');
                const data = await response.json();
 
                const mappedData: Service[] = data
                    .filter((item: any) => item.active === "Y")
                    .map((item: any, index: number) => ({
                        id: item.service_id?.toString() || index.toString(),
                        name: item.service_name || 'Unnamed Service',
                        category: item.service_category || 'General',
                        subcategory: item.service_type || '',
                        service_package: item.service_package || "",
                        price: item.service_cost || 0,
                        originalPrice: item.originalPrice || item.price || 0,
                        rating: parseFloat(item.rating) || 0,
                        reviews: item.rating_count ? String(item.rating_count) : '0',
                        duration: item.duration || '1 hr',
                        image: item.service_image_url
                            ? item.service_image_url.startsWith('http')
                                ? item.service_image_url
                                : `Global_API_BASE${item.service_image_url}`
                            : '/placeholder.jpg',
                        description: item.service_description || '',
                        features: item.features ? item.features.split(',') : ['Reliable', 'Affordable'],
                        badge: item.badge || undefined,
                        overview: item.overview || '',
                        our_process: item.our_process || '',
                        benefits: item.benefits || '',
                        whats_included: item.whats_included || '',
                        whats_not_included: item.whats_not_included || '',
                        why_choose_us: item.why_choose_us || '',
                        kushi_teamwork: item.kushi_teamwork || '',
                        faq: item.faq || '',
                        active: item.active,
                    }));
 
                setAllServices(mappedData);
            } catch (error) {
                console.error('Error fetching services:', error);
            }finally {
                setIsLoading(false); // End loading
            }
        };
 
        fetchServices();
    }, []);
 
    const subcategoryData = useMemo(() => {
        const subcategoriesByCat: Record<string, { id: string; name: string; image: string }[]> = {};
        categories.forEach(cat => {
            const subcategoryMap = new Map<string, { id: string; name: string; image: string }>();
            allServices.forEach(service => {
                const frontendCategory = categories.find(c =>
                    service.category.toLowerCase().includes(c.toLowerCase())
                );
                if (frontendCategory === cat && service.subcategory) {
                    if (!subcategoryMap.has(service.subcategory)) {
                        subcategoryMap.set(service.subcategory, {
                            id: service.subcategory,
                            name: service.subcategory,
                            image: service.image,
                        });
                    }
                }
            });
            subcategoriesByCat[cat] = Array.from(subcategoryMap.values());
        });
        return subcategoriesByCat;
    }, [allServices, categories]);const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
 
    const handleSubcategoryClick = async (subcategoryName: string) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
   
        const urlSubcategory = subcategoryName.toLowerCase().replace(/\s+/g, '-');
   
        const filteredServices = allServices.filter(
            (s) => s.subcategory.toLowerCase().replace(/\s+/g, '-') === urlSubcategory
        );
   
        if (filteredServices.length > 0) {
            navigate(`/services/${urlSubcategory}`, {
                state: {
                    services: filteredServices,
                    openDirectly: filteredServices.length === 1
                },
            });
        } else {
            navigate(`/services/${urlSubcategory}`, {
                state: { services: [], openDirectly: false },
            });
        }
    };
 
    const filteredCategories = categories;
    const displayedSubcategories = selectedCategory ? subcategoryData[selectedCategory] : [];
 
 
 
    return (
        <div className="bg-gradient-to-br from-peach-50 to-navy-50 relative pb-12">
 
            {/* Hero Section */}
            {!selectedCategory && (
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
            )}
 
            {/* Category / Subcategory Section */}
            <div className="bg w-full py-2">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        {!selectedCategory ? (
                            <h2 className="text-3xl font-bold text-navy-900 mb-6">
                                Explore Our <span className="text-peach-400">Categories</span>
                            </h2>
                        ) : (
                            <div className="mb-4 text-center w-full">
                                <h1 className="text-2xl font-bold text-navy-900 mb-2">
                                    {selectedCategory}
                                </h1>
                            </div>
                        )}
                       
                        {/* ✅ Sub-Category Loading/Empty State - ONLY APPEARS WHEN A CATEGORY IS SELECTED */}
                        {selectedCategory && (
                            (isLoading || displayedSubcategories.length === 0) && (
                                <p className="text-navy-700 text-lg">
                                    {/* Show loading ONLY if the initial fetch is still active */}
                                    {isLoading ? (
                                        <span className="animate-pulse">Loading Services, please wait...</span>
                                    ) : (
                                        // Show No services if loading is false and the array is empty
                                        "No services available in this category yet."
                                    )}
                                </p>
                            )
                        )}
                    </div>
 
                   
                   {/* Category Grid */}
          {!selectedCategory ? (
           <div className="grid category-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

              {[
                { title: 'Residential Cleaning Services', icon: '🏠' },
                { title: 'Commercial Cleaning Services', icon: '🏢' },
                { title: 'Industrial Cleaning Services', icon: '🏭' },
                { title: 'Pest Control Services', icon: '🐜' },
                { title: 'Marble Polishing Services', icon: '🪞' },
                { title: 'Packers And Movers', icon: '🚚' },
               
              ].map((cat, index) => (
                <div
                  key={cat.title}
                  onClick={() => handleCategoryClick(cat.title)}
                  className={`group rounded-3xl shadow-xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 cursor-pointer
                    bg-white text-navy-900 border-peach-200 hover:bg-gradient-to-r hover:from-peach-300 hover:to-navy-700 hover:text-white`}
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
          ) : (
            !isLoading && displayedSubcategories.length > 0 && (
             <div className="grid subcategory-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">

                {displayedSubcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="group rounded-3xl shadow-xl overflow-hidden bg-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col"
                    onClick={() => handleSubcategoryClick(sub.name)}
                  >
                    <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-2 text-center flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-navy-900 mb-1 group-hover:text-peach-300 transition-colors duration-300">
                          {sub.name}
                        </h3>
                      </div>
                      <button
                        className="w-full px-3 py-1 mt-1 font-semibold rounded-full bg-gradient-to-r from-peach-300 to-navy-700 text-white hover:from-peach-300 hover:to-navy-900 transition-colors duration-300 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubcategoryClick(sub.name);
                        }}
                      >
                        View Services
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

           
{/* ✅ Add Google Reviews Section Above Footer */}
<GoogleReviews />
 
               {/* Back to Categories button */}
                    {selectedCategory && (
                        <div className="flex justify-end w-full px-4 sm:px-6 lg:px-8 mt-8 mb-2">
                            <button
                                onClick={() => {
                                  setSelectedCategory(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                               
                               
                                className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-peach-300 to-navy-700 text-white hover:from-peach-300 hover:to-navy-900 transition-all duration-300"
                            >
                                ← Back to Categories
                            </button>
                        </div>
                    )}

                </div>
            </div>

           <style>
{`
/* ============= MOBILE (0–640px) ============= */
@media (max-width: 640px) {
  .mobile-hidden { display: none !important; }
  .mobile-block { display: block !important; }
  .mobile-center { text-align: center !important; }

  /* 2 items per row for categories */
  .category-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* 2 items per row for subcategories (optional) */
  .subcategory-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Cards */
  .category-card,
  .subcategory-card {
    padding: 12px !important;
    border-radius: 16px !important;
  }

  /* Category Icons */
  .category-icon {
    font-size: 34px !important;
  }

  /* Reduce Title Size */
  .category-title {
    font-size: 16px !important;
  }

  /* Subcategory images */
  .subcategory-img {
    height: 120px !important;
  }
}

/* ============= TABLET (641px–1024px) ============= */
@media (min-width: 641px) and (max-width: 1024px) {
  .tab-hidden { display: none !important; }
  .tab-block { display: block !important; }

  /* Grid adjustments */
  .category-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .subcategory-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .subcategory-img {
    height: 160px !important;
  }
}

/* ============= DESKTOP (1025px+) ============= */
@media (min-width: 1025px) {
  .desktop-hidden { display: none !important; }
  .desktop-block { display: block !important; }

  .category-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }

  .subcategory-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
}
`}
</style>


        </div>
    );
};
 
export default Services;
 