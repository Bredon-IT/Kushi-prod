import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
}

const Blog: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);

  const blogPosts: BlogPost[] = [
    {
      id: 'eco-friendly-cleaning-tips',
      title: 'Top 10 Eco-Friendly Cleaning Tips for Your Home',
      excerpt: 'Discover sustainable cleaning methods that protect your family and the environment while maintaining a spotless home.',
      author: 'Priya Sharma',
      date: '2024-01-15',
      readTime: '5 min read',
      image: '/slider_5.png',
      category: 'Eco-Friendly'
    },
    {
      id: 'office-hygiene-best-practices',
      title: 'Office Hygiene Best Practices for Post-Pandemic Workplace',
      excerpt: 'Essential guidelines for maintaining a safe and healthy office environment that protects employees and visitors.',
      author: 'Rajesh Kumar',
      date: '2024-01-12',
      readTime: '7 min read',
      image: 'https://tse4.mm.bing.net/th/id/OIP.4sfHkYYtCx-EbCDOmhEXpQHaEc?rs=1&pid=ImgDetMain&o=7&rm=3',
      category: 'Commercial'
    },
    {
      id: 'deep-cleaning-checklist',
      title: 'The Ultimate Deep Cleaning Checklist for Every Room',
      excerpt: 'A comprehensive room-by-room guide to deep cleaning that ensures no corner is left untouched.',
      author: 'Amit Patel',
      date: '2024-01-10',
      readTime: '6 min read',
      image: 'https://tse2.mm.bing.net/th/id/OIP.7efBVaeoCvNikXyEyKZH2gHaEL?rs=1&pid=ImgDetMain&o=7&rm=3',
      category: 'Residential'
    },
    {
      id: 'industrial-safety-protocols',
      title: 'Industrial Cleaning Safety Protocols and Compliance',
      excerpt: 'Understanding OSHA requirements and safety measures for industrial cleaning operations.',
      author: 'Rajesh Kumar',
      date: '2024-01-08',
      readTime: '8 min read',
      image: 'https://www.service-techcorp.com/hubfs/Industrial_Cleaning.jpeg',
      category: 'Industrial'
    },
    {
      id: 'seasonal-cleaning-guide',
      title: 'Seasonal Cleaning Guide: Preparing Your Home for Every Season',
      excerpt: 'Learn how to adapt your cleaning routine for different seasons and weather conditions.',
      author: 'Priya Sharma',
      date: '2024-01-05',
      readTime: '4 min read',
      image: 'https://www.squeakycleaner.homes/wp-content/uploads/2024/11/seasonal-cleaning-checklist.jpg',
      category: 'Seasonal'
    },
    {
      id: 'carpet-maintenance-tips',
      title: 'Professional Carpet Care: Maintenance Tips That Actually Work',
      excerpt: 'Expert advice on keeping your carpets clean, fresh, and extending their lifespan.',
      author: 'Amit Patel',
      date: '2024-01-03',
      readTime: '5 min read',
      image: 'https://tse3.mm.bing.net/th/id/OIP.bIRSxh1ykVgafhgM77H25QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
      category: 'Maintenance'
    }
  ];

  const postsToDisplay = [...blogPosts, ...blogPosts];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cleaning <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Insights</span> & Tips
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Expert advice, industry insights, and practical tips to help you maintain the highest standards of cleanliness and hygiene.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Carousel */}
      <section className="py-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6"></div>

        {/* Blog Scroller */}
        <div
          className={`flex space-x-6 px-4 pb-4 blog-scroller-container ${isHovering ? 'pause-scroll' : ''}`}
          style={{ scrollbarWidth: 'none', width: 'fit-content' }}
        >
          {postsToDisplay.map((post, index) => (
            <article
              key={`${post.id}-${index}`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="flex-shrink-0 w-80 bg-white rounded-xl overflow-hidden shadow-lg border border-orange-200 hover:shadow-xl transition-all transform hover:scale-[1.02] max-w-sm cursor-pointer"
            >
              <Link to={`/blog/${post.id}`}>
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-gradient-to-r from-navy-500 to-navy-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {post.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 truncate">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-peach-300 text-white rounded-md text-sm font-medium hover:bg-peach-400 transition-colors">
                      Read More <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Stay Updated with <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Cleaning Tips</span>
          </h2>
          <p className="text-base text-gray-600 mb-6">
            Subscribe to our newsletter for the latest cleaning insights, tips, and industry updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <button className="bg-gradient-to-r from-peach-300 to-navy-800 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Auto Scroll CSS */}
      <style jsx global>{`
        @keyframes blog-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .blog-scroller-container {
          animation: blog-scroll 50s linear infinite;
          overflow-x: hidden;
        }
        .pause-scroll {
          animation-play-state: paused !important;
        }
        .blog-scroller-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

    </div>
  );
};

export default Blog;
