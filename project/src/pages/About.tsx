import React from 'react';
import { Shield, Award, Users, Target, Eye, Heart, Briefcase, Smile, Star, Zap } from 'lucide-react';

// Custom Kushi Colors (Inferred from your gradient usage)
const kushiColors = {
  // A deep, primary blue/navy
  'kushi-navy': '#1F3F60', 
  // A bright, secondary orange/peach
  'kushi-peach': '#FF7F50', 
};

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Shashikala M',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'With over 3 years in the cleaning industry, Shashikala founded Kushi Services to revolutionize professional cleaning standards.'
    },
    {
      name: 'Abhlash Gowda',
      role: 'Operations Director',
      image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Abhlash Gowda ensures our operations run smoothly and maintains our high-quality service standards across all locations.'
    },
    {
      name: 'Usha T',
      role: 'Technical Manager',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Usha leads our technical team and ensures we use the latest cleaning technologies and eco-friendly solutions.'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Reliability',
      description: 'We keep our promises and deliver services you can depend on every time.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for the highest standards, ensuring every detail reflects quality.'
    },
    {
      icon: Heart,
      title: 'Care & Compassion',
      description: 'We serve with empathy, putting the well-being of our customers at the center of everything we do.'
    },
    {
      icon: Users,
      title: 'Team Spirit',
      description: 'Together, we achieve more by supporting, respecting, and uplifting each other.'
    }
  ];

  const stats = [
    { icon: Briefcase, value: '50,000+', label: 'Completed Projects' },
    { icon: Smile, value: '47,500+', label: 'Happy Customers' },
    { icon: Star, value: '10+', label: 'Years of Experience' },
    { icon: Users, value: '50+', label: 'Professionals' },
  ];

  return (
    <div className="bg-white">

      {/* Hero Section - Redesigned for smaller, complementing image and better content focus */}
      <section className="py-2 md:py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content Column */}
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl sm:text-10xl font-extrabold text-gray-900 mb-6 leading-tight">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-300 to-navy-700">Kushi Services</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                We believe cleanliness builds comfort and trust. Our mission is to deliver reliable, eco-friendly, and affordable solutions for every home and business.
              </p>
              
              <div className="space-y-6 text-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 border-b pb-2 border-orange-100">Our Story</h2>
                <p className="leading-relaxed">
                  Kushi Services began with a simple vision — to create cleaner, healthier, and more comfortable spaces for families and businesses. We started in 2015 as a small pest control service and have now grown into a trusted name, offering a wide range of professional solutions including deep cleaning, floor polishing, sump and tank cleaning, packers & movers, facility management, and more.
                </p>
                <p className="leading-relaxed font-medium">
                  Behind this growth is our commitment to quality, eco-friendly practices, and customer satisfaction. Every service we provide is backed by trained professionals, certified products, and a promise of transparency.
                </p>
              </div>
            </div>

            {/* Image Column - Reduced size and moved to the right for a better visual balance */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg shadow-2xl rounded-2xl overflow-hidden aspect-square">
               
                <img
                  src="/kushi.png" // Assumes this image is available
                  alt="Kushi Services Cleaning Team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
          </div>
        </div>
      </section>

    {/* Mission & Vision - Redesigned Section */}
<section className="py-2 bg-white">
  <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div className="text-center mb-16">
      <h2 className="text-4xl font-extrabold text-gray-900">
        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-300 to-navy-700">Core Aspirations</span>
      </h2>
    </div>

    {/* Dynamic Two-Card Layout */}
    <div className="grid lg:grid-cols-2 gap-6">
      
      {/* Mission Card - Prominent Navy Background */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl text-black shadow-2xl bg-gradient-to-r from-peach-300 to-navy-700">
        
        {/* Decorative elements - subtle pattern or shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-kushi-peach/20 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
           
            <h3 className="text-3xl font-bold">Our Mission</h3>
          </div>
          
          <p className="text-lg leading-relaxed text-black">
            Kushi Services empowers lives and businesses by delivering all-in-one, premium solutions in pest control, deep cleaning, marble polishing, shifting, plumbing, electrical works, borewell care, pump servicing, facility management, and more—powered by trained professionals, global SOPs, and digital tools. We serve VIP clients, corporates, and communities with speed, privacy, safety, and trust—combining traditional service values with future-ready innovation.
          </p>
        </div>
      </div>

      {/* Vision Card - Prominent Peach Background */}
      <div className="relative overflow-hidden p-10 md:p-12 rounded-3xl text-gray-900 shadow-2xl bg-gradient-to-r from-navy-600 to-peach-300">
        
        {/* Decorative elements - subtle pattern or shape */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-kushi-navy/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/20 rounded-full transform translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            
            <h3 className="text-3xl font-bold">Our Vision</h3>
          </div>
          
          <p className="text-lg leading-relaxed text-gray-800">
            To become the world’s most trusted, innovative, and complete lifestyle service brand— revolutionizing hygiene, relocation, facility management, and essential maintenance with eco-smart excellence, human touch, and global scalability.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


 
 {/* ------------------------Stats Section----------------------------- */}
<section className="py-2 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Section Title */}
    <div className="text-center mb-8">
      <h2 className="text-3xl font-extrabold text-navy-700">
        Our Success By The Numbers
      </h2>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        // UNIFORM GRADIENT BACKGROUND
        const cardBgClass = 'bg-pink-50';
        
        return (
          <div
            key={index}
            className={`
              flex flex-col items-center justify-center p-8 rounded-2xl shadow-2xl h-full text-center
              ${cardBgClass} transition-transform duration-300 transform hover:scale-105
            `}
          >
            {/* Icon - White background for maximum contrast against the dark card gradient */}
            <div className="rounded-full p-3 mb-4 bg-white/20"> 
              <Icon className="w-8 h-8 text-black" />
            </div>
            
            {/* Value - Large and Bold, always white on the dark gradient */}
            <h3 className="text-4xl font-extrabold mb-1 text-black">
              {stat.value}
            </h3>
            
            {/* Label - Clear and slightly muted white for hierarchy */}
            <p className="text-base font-medium text-black">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  </div>
</section>
 
 {/* ------------------------Core Values----------------------------- */}

      {/* Core Values */}
   <section className="py-2 bg-white overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Section Header */}
    <div className="text-center mb-8 max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-300 to-navy-700">Core Values</span>
      </h2>
      <p className="text-xl text-black leading-relaxed">
        These values shape our culture, drive our commitment to excellence, and ensure we deliver trustworthy service every time.
      </p>
    </div>

  </div>

  {/* Horizontal Card Container - Now animated */}
  <div 
    className="flex space-x-8 px-4 sm:px-6 lg:px-8 pb-4 scrolling-container"
    style={{ scrollbarWidth: 'none', width: 'fit-content' }} // Add width: fit-content for animation
  >
    {
      [...values, ...values].map((value, index) => { // Map the values array twice for the loop
        const IconComponent = value.icon;
        
        const cardClass = `
          flex-shrink-0 w-80 p-8 rounded-2xl shadow-xl transition-all duration-300 transform 
          hover:shadow-2xl hover:scale-[1.05] text-center
          bg-gradient-to-br from-peach-300 to-navy-700 text-white
        `;
        
        return (
          <div key={`val-${index}`} className={cardClass}>
            {/* Icon - Prominent white background for contrast */}
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto
              bg-white/20 text-white shadow-md 
            `}>
              <IconComponent size={28} />
            </div>
            
            {/* Title - Bold white text */}
            <h3 className="text-xl font-bold mb-3 text-white">
              {value.title}
            </h3>
            
            {/* Description - Slightly muted white text */}
            <p className="text-gray-200 leading-relaxed">
              {value.description}
            </p>
          </div>
        );
      })
    }

  </div>
  
  {/* CSS for Auto-Scrolling and Scrollbar Hiding */}
  <style jsx global>{`
    /* Keyframes for the continuous scroll effect */
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); } 
    }
    
    /* Apply animation to the container */
    .scrolling-container {
      /* Animation speed: 25 seconds, linear, infinite loop */
      animation: scroll 25s linear infinite; 
      /* Ensures content is wide enough for the animation to work */
      width: fit-content; 
      /* Hide the scrollbar in modern browsers */
      overflow-x: hidden; 
    }

    /* Hide scrollbar for WebKit (Chrome/Safari) */
    .scrolling-container::-webkit-scrollbar {
      display: none;
    }
  `}</style>
</section>

 {/* ------------------------Team Section----------------------------- */}
 
      {/* Team Section */}
      <section className="py-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Meet Our <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Leadership Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to delivering exceptional cleaning services and customer satisfaction.
            </p>
          </div>
 
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 text-center border border-orange-200 hover:shadow-lg transition-all"
              >
               
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-orange-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
 
export default About;