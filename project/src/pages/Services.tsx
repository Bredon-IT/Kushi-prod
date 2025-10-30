import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Global_API_BASE from '../services/GlobalConstants';
 
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

         // Helper function to create slug (MUST be defined here for logic)
const createSlug = (text: string) => text.toLowerCase().replace(/\s/g, '-').replace(/&/g, 'and');

 
const Services: React.FC = () => {
    const navigate = useNavigate();
     const { categorySlug } = useParams<{ categorySlug: string }>(); // <-- GET SLUG FROM URL
  


    const [allServices, setAllServices] = useState<Service[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
 
    const categories = [
        'Residential Cleaning Services',
        'Commercial Cleaning Services',
        'Industrial Cleaning Services',
        'Pest Control Services',
        'Marble Polishing Services',
        'Packers And Movers',
        'Other Services',
    ];
 
    useEffect(() => {
        const fetchServices = async () => {
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
    }, [allServices, categories]);
 
    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
 
   const handleSubcategoryClick = async (subcategoryName: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
 
    // Convert to URL-friendly format (e.g., "1BHK" → "1bhk")
    const urlSubcategory = subcategoryName.toLowerCase().replace(/\s/g, '-');
 
    // Filter services under this subcategory
    const filteredServices = allServices.filter(
        (s) => s.subcategory.toLowerCase().replace(/\s/g, '-') === urlSubcategory
    );
 
    // ✅ Logic: If only one service, open it directly
    if (filteredServices.length === 1) {
        navigate(`/services/${urlSubcategory}`, {
            state: { services: filteredServices, openDirectly: true },
        });
    } else {
        // ✅ Otherwise, open list page showing all services
        navigate(`/services/${urlSubcategory}`, {
            state: { services: filteredServices, openDirectly: false },
        });
    }
};
 
    const filteredCategories = categories;
    const displayedSubcategories = selectedCategory ? subcategoryData[selectedCategory] : [];

    // 1. NEW useEffect to handle direct navigation via slug
    useEffect(() => {
        // This runs once when the component mounts or when categorySlug changes
        if (categorySlug && categories.length > 0) {
            // Find the original category name matching the URL slug
            const matchingCategory = categories.find(cat => createSlug(cat) === categorySlug);

            if (matchingCategory) {
                // Set the state to bypass the main category grid view
                setSelectedCategory(matchingCategory);
                console.log(`Initial category set from URL: ${matchingCategory}`);
            } else {
                // Handle case where slug is present but doesn't match a known category
                // For now, we can just default to null or stay on the category page
                setSelectedCategory(null);
            }
        }
    }, [categorySlug, categories]); // Depend on slug and categories array


 
    return (
        <div className="bg-gradient-to-br from-peach-50 to-navy-50 relative pb-12">
 
            {/* Hero Section - Reduced height */}
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
                        {!selectedCategory && (
                            <h2 className="text-3xl font-bold text-navy-900 mb-6">
                                Explore Our <span className="text-peach-400">Categories</span>
                            </h2>
                        )}
                        {selectedCategory && displayedSubcategories.length === 0 && (
                            <p className="text-navy-700 text-lg">No subcategories available for this category.</p>
                        )}
                    </div>
 
                    {/* Selected Category Name above Back button */}
                    {selectedCategory && (
                        <div className="mb-4 text-center w-full">
                            <h1 className="text-2xl font-bold text-navy-900 mb-2">
                                {selectedCategory}
                            </h1>
                        </div>
                    )}
 
                   
                    {selectedCategory ? (
                        displayedSubcategories.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
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
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredCategories.map((category, index) => (
                                <div
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`group rounded-3xl shadow-xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 cursor-pointer
                                        bg-white text-navy-900 border-peach-200 hover:bg-gradient-to-r hover:from-peach-300 hover:to-navy-700 hover:text-white`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="p-8 text-center">
                                        <h3 className="text-xl font-bold mb-2 transition-colors duration-300">{category}</h3>
                                        <p className="text-sm transition-colors duration-300">View types</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
 
               {/* Back to Categories button */}
                    {selectedCategory && (
                        <div className="flex justify-end w-full px-4 sm:px-6 lg:px-8 mt-8 mb-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-peach-300 to-navy-700 text-white hover:from-peach-300 hover:to-navy-900 transition-all duration-300"
                            >
                                ← Back to Categories
                            </button>
                        </div>
                    )}
 
 
                </div>
            </div>
        </div>
    );
};
 
export default Services;
 
 