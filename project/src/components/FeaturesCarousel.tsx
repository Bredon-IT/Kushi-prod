import React, { useEffect, useState } from 'react';

// --- IMAGE PATHS ---
const trustedImage = '/why_choose_us_step_1.png';
const premiumImage = '/why_choose_us_step_2.png';
const reliableImage = '/why_choose_us_step_3.png';
const satisfactionImage = '/why_choose_us_step_4.png';

// --- SLIDES DATA ---
const slides = [
  {
    id: 1,
    image: trustedImage,
    title: 'Trusted & Certified',
    description: 'Fully licensed, bonded, and insured with industry certifications for your complete peace of mind.',
  },
  {
    id: 2,
    image: premiumImage,
    title: 'Premium Solutions',
    description: 'Advanced eco-friendly products and cutting-edge technology that deliver superior results.',
  },
  {
    id: 3,
    image: reliableImage,
    title: 'Reliable Service',
    description: 'Punctual and dependable service with guaranteed scheduling that respects your valuable time.',
  },
  {
    id: 4,
    image: satisfactionImage,
    title: '100% Satisfaction',
    description: 'We guarantee exceptional results with our comprehensive quality assurance program.',
  },
];

const FeaturesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // --- AUTO-TEXT SLIDE CHANGER ---
  useEffect(() => {
    // Only cycle text if no card is actively selected
    if (selectedCardId !== null) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [selectedCardId]);

  // --- Click Handler ---
  const handleCardClick = (id: number) => {
    if (selectedCardId === id) {
      // Deselect if already selected
      setSelectedCardId(null);
    } else {
      // Select the new card and update the displayed text immediately
      setSelectedCardId(id);
      const index = slides.findIndex(slide => slide.id === id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  };

  // Determine the content to display
  const displayedContent = slides.find(slide => slide.id === selectedCardId) || slides[currentIndex];
  
  return (
    <>
      <section className="py-2 bg-gradient-to-b from-white to-peach-50">
        <div className="w-full px-6 lg:px-12 mx-auto max-w-7xl">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-3">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">
                Kushi Services
              </span>
              ?
            </h2>
            <p className="text-base sm:text-lg text-navy-700 max-w-1xl mx-auto leading-relaxed">
              We bring excellence, trust, and innovation to every cleaning task — making your spaces shine.
            </p>
          </div>

          {/* STATIC GRID DISPLAY */}
          <div
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                onClick={() => handleCardClick(slide.id)} // <-- Added Click Handler
                className={`group relative rounded-3xl overflow-hidden shadow-xl transform transition-transform duration-500 cursor-pointer
                         bg-white border-2 
                         ${selectedCardId === slide.id ? 'border-navy-700 shadow-2xl scale-[1.03]' : 'border-peach-200 hover:shadow-2xl hover:border-peach-300'} 
                         hover:scale-[1.01]`}
              >
                <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Text Section Below Carousel */}
          <div className="text-center mt-8 transition-opacity duration-500">
            <h3 className="text-lg font-semibold text-navy-800">
              {displayedContent.title}
            </h3>
            <p className="text-lg italic text-navy-600 mt-2 px-4">
              "{displayedContent.description}"
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesCarousel;