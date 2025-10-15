import React from 'react';
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
  const blogPosts: BlogPost[] = [
    {
      id: 'eco-friendly-cleaning-tips',
      title: 'Top 10 Eco-Friendly Cleaning Tips for Your Home',
      excerpt: 'Discover sustainable cleaning methods that protect your family and the environment while maintaining a spotless home.',
      author: 'Priya Sharma',
      date: '2024-01-15',
      readTime: '5 min read',
      image: 'https://images.pexels.com/photos/4099350/pexels-photo-4099350.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      category: 'Eco-Friendly'
    },
    {
      id: 'office-hygiene-best-practices',
      title: 'Office Hygiene Best Practices for Post-Pandemic Workplace',
      excerpt: 'Essential guidelines for maintaining a safe and healthy office environment that protects employees and visitors.',
      author: 'Rajesh Kumar',
      date: '2024-01-12',
      readTime: '7 min read',
      image: 'https://images.pexels.com/photos/7414284/pexels-photo-7414284.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      category: 'Commercial'
    },
    {
      id: 'deep-cleaning-checklist',
      title: 'The Ultimate Deep Cleaning Checklist for Every Room',
      excerpt: 'A comprehensive room-by-room guide to deep cleaning that ensures no corner is left untouched.',
      author: 'Amit Patel',
      date: '2024-01-10',
      readTime: '6 min read',
      image: 'https://images.pexels.com/photos/4107123/pexels-photo-4107123.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      category: 'Residential'
    },
    {
      id: 'industrial-safety-protocols',
      title: 'Industrial Cleaning Safety Protocols and Compliance',
      excerpt: 'Understanding OSHA requirements and safety measures for industrial cleaning operations.',
      author: 'Rajesh Kumar',
      date: '2024-01-08',
      readTime: '8 min read',
      image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      category: 'Industrial'
    },
    {
      id: 'seasonal-cleaning-guide',
      title: 'Seasonal Cleaning Guide: Preparing Your Home for Every Season',
      excerpt: 'Learn how to adapt your cleaning routine for different seasons and weather conditions.',
      author: 'Priya Sharma',
      date: '2024-01-05',
      readTime: '4 min read',
      image: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      category: 'Seasonal'
    },
    {
      id: 'carpet-maintenance-tips',
      title: 'Professional Carpet Care: Maintenance Tips That Actually Work',
      excerpt: 'Expert advice on keeping your carpets clean, fresh, and extending their lifespan.',
      author: 'Amit Patel',
      date: '2024-01-03',
      readTime: '5 min read',
      image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      category: 'Maintenance'
    }
  ];

  const categories = ['All', 'Eco-Friendly', 'Commercial', 'Residential', 'Industrial', 'Seasonal', 'Maintenance'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="py-20 bg-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Cleaning <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Insights</span> & Tips
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert advice, industry insights, and practical tips to help you maintain 
              the highest standards of cleanliness and hygiene.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-peach-300 to-navy-700 text-white shadow-lg'
                      : 'bg-orange-100 text-peach-600 hover:bg-navy-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-orange-200 hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-navy-500 to-navy-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Read More
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-br-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated with <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">Cleaning Tips</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Subscribe to our newsletter for the latest cleaning insights, tips, and industry updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button className="bg-gradient-to-r from-peach-300 to-navy-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;