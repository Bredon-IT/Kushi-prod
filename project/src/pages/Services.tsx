import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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
    active: string;
}

const Services: React.FC = () => {
    const navigate = useNavigate();
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

    // Fetch services from API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/customers/all-services');
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
                                : `https://bmytsqa7b3.ap-south-1.awsapprunner.com${item.service_image_url}`
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
                        active: item.active,
                    }));

                setAllServices(mappedData);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
    }, []);

    // Prepare subcategories grouped by category
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

    const handleSubcategoryClick = (subcategoryName: string) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const urlSubcategory = subcategoryName.toLowerCase().replace(/\s/g, '-');
        const filteredServices = allServices.filter(
            (s) => s.subcategory.toLowerCase().replace(/\s/g, '-') === urlSubcategory
        );
        navigate(`/services/${urlSubcategory}`, { state: { services: filteredServices } });
    };

    const filteredCategories = categories;
    const displayedSubcategories = selectedCategory ? subcategoryData[selectedCategory] : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-peach-50 to-navy-50  relative">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-peach-300 to-navy-700 text-white py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                        Professional <span className="text-peach-300">Cleaning</span> Services
                    </h1>
                    <p className="text-xl mb-8 max-w-3xl mx-auto text-peach-100 animate-fade-in-delay">
                        Transform your space with our premium cleaning solutions. Professional, reliable, and trusted by thousands of satisfied customers across Bangalore.
                    </p>
                </div>
            </div>

            {/* Category / Subcategory Section */}
            
           <div className="bg-pink-50 w-full py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    {selectedCategory ? (
                        <>
                            <h2 className="text-3xl font-bold text-navy-800 mb-6">
                                Explore Subcategories for <span className="text-navy-800">{selectedCategory}</span>
                            </h2>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mb-8 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-peach-200 to-navy-800 text-white hover:from-peach-300 hover:to-navy-900 transition-all duration-300">
                                ← Back to all Categories
                            </button>
                        </>
                    ) : (
                        <h2 className="text-3xl font-bold text-navy-900 mb-6">
                            Explore Our <span className="text-peach-400">Categories</span>
                        </h2>
                    )}
                </div>

                {selectedCategory ? (
                    displayedSubcategories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {displayedSubcategories.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="group rounded-3xl shadow-xl overflow-hidden bg-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col"
                                    onClick={() => handleSubcategoryClick(sub.name)}
                                >
                                    <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                                        <img
                                            src={sub.image}
                                            alt={sub.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-4 text-center flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-peach-300 transition-colors duration-300">
                                                {sub.name}
                                            </h3>
                                        </div>
                                        <button
                                            className="w-full px-4 py-2 mt-2 font-semibold rounded-full bg-gradient-to-r from-peach-300 to-navy-700 text-white hover:from-peach-300 hover:to-navy-900 transition-colors duration-300"
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
                    ) : (
                        <div className="text-center p-12 bg-white rounded-lg shadow-lg">
                            <p className="text-xl font-semibold text-gray-700">No services found for this category yet.</p>
                            <p className="text-gray-500 mt-2">Please check back later or try a different category.</p>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredCategories.map((category, index) => (
                            <div
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={`group rounded-3xl shadow-xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 cursor-pointer
                                    ${selectedCategory === category
                                        ? 'bg-gradient-to-r from-peach-200 to-navy-800 text-white border-peach-400'
                                        : 'bg-white text-navy-900 border-peach-200 hover:bg-gradient-to-r hover:from-peach-300 hover:to-navy-700 hover:text-white'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-8 text-center">
                                    <h3
                                        className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                                            selectedCategory === category
                                                ? 'text-white'
                                                : 'group-hover:text-white'
                                        }`}
                                    >
                                        {category}
                                    </h3>
                                    <p className={`text-sm transition-colors duration-300 ${
                                        selectedCategory === category ? 'text-white' : 'group-hover:text-white'
                                    }`}>
                                        View types
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default Services;
