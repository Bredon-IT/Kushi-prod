import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Share2 } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug } = useParams();

  // Mock blog post data - in a real app, this would come from an API
  const blogPost = {
    id: slug,
    title: 'Top 10 Eco-Friendly Cleaning Tips for Your Home',
    content: `
      <p>In today's environmentally conscious world, more homeowners are seeking sustainable cleaning solutions that protect both their families and the planet. Eco-friendly cleaning doesn't mean compromising on effectiveness – it means making smarter choices that benefit everyone.</p>

      <h2>Why Choose Eco-Friendly Cleaning?</h2>
      <p>Traditional cleaning products often contain harsh chemicals that can cause respiratory issues, skin irritation, and environmental damage. Eco-friendly alternatives offer the same cleaning power while being safer for your family and the environment.</p>

      <h2>Top 10 Eco-Friendly Cleaning Tips</h2>

      <h3>1. Use White Vinegar as an All-Purpose Cleaner</h3>
      <p>White vinegar is a natural disinfectant that can clean glass, remove soap scum, and eliminate odors. Mix equal parts water and vinegar in a spray bottle for an effective all-purpose cleaner.</p>

      <h3>2. Harness the Power of Baking Soda</h3>
      <p>Baking soda is excellent for scrubbing surfaces, deodorizing carpets, and cleaning ovens. It's gentle yet effective, making it perfect for delicate surfaces.</p>

      <h3>3. Lemon for Natural Freshness</h3>
      <p>Lemons contain citric acid, which cuts through grease and leaves a fresh scent. Use lemon juice to clean cutting boards, remove stains, and freshen garbage disposals.</p>

      <h3>4. Essential Oils for Pleasant Scents</h3>
      <p>Add a few drops of essential oils like tea tree, lavender, or eucalyptus to your cleaning solutions for natural antimicrobial properties and pleasant fragrances.</p>

      <h3>5. Microfiber Cloths Reduce Chemical Dependency</h3>
      <p>High-quality microfiber cloths can clean effectively with just water, reducing the need for chemical cleaners while being reusable and long-lasting.</p>

      <h3>6. Make Your Own Glass Cleaner</h3>
      <p>Combine 2 cups water, 1/2 cup vinegar, and 1/4 cup rubbing alcohol for a streak-free glass cleaner that rivals commercial products.</p>

      <h3>7. Use Castile Soap for Gentle Cleaning</h3>
      <p>Made from plant oils, castile soap is biodegradable and gentle on skin while effectively cleaning dishes, floors, and even as a body wash.</p>

      <h3>8. Steam Cleaning for Deep Sanitization</h3>
      <p>Steam cleaning uses only water to kill bacteria and remove dirt, making it perfect for sanitizing surfaces without chemicals.</p>

      <h3>9. Choose Concentrated Products</h3>
      <p>When buying eco-friendly products, choose concentrated formulas that reduce packaging waste and transportation emissions.</p>

      <h3>10. Proper Ventilation is Key</h3>
      <p>Always ensure good ventilation when cleaning to improve air quality and help natural cleaning solutions work more effectively.</p>

      <h2>Benefits of Professional Eco-Friendly Cleaning</h2>
      <p>While DIY eco-friendly cleaning is great for daily maintenance, professional cleaning services like Kushi Hygiene Services use advanced eco-friendly products and techniques that deliver superior results while maintaining environmental responsibility.</p>

      <p>Our team is trained in the latest sustainable cleaning methods and uses only certified eco-friendly products that are safe for your family, pets, and the environment.</p>

      <h2>Conclusion</h2>
      <p>Adopting eco-friendly cleaning practices is a simple yet impactful way to create a healthier home environment while protecting our planet. Start with these tips and gradually incorporate more sustainable practices into your cleaning routine.</p>
    `,
    author: 'Priya Sharma',
    date: '2024-01-15',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/4099350/pexels-photo-4099350.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    category: 'Eco-Friendly'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: blogPost.title,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="py-20">
      {/* Back to Blog */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </Link>
      </div>

      {/* Hero Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={blogPost.image}
            alt={blogPost.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-6 left-6">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {blogPost.category}
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {blogPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{blogPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formatDate(blogPost.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{blogPost.readTime}</span>
            </div>
            <button
              onClick={sharePost}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />

        {/* Call to Action */}
        <div className="mt-12 p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Professional <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Eco-Friendly Cleaning</span>?
          </h3>
          <p className="text-gray-600 mb-6">
            Let our expert team handle your cleaning needs with advanced eco-friendly products and techniques. 
            Get a free consultation today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg text-center"
            >
              Get Free Quote
            </Link>
            <Link
              to="/services"
              className="border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all text-center"
            >
              View Services
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Related <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Articles</span>
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mock related posts */}
          {[
            {
              title: 'Office Hygiene Best Practices for Post-Pandemic Workplace',
              excerpt: 'Essential guidelines for maintaining a safe and healthy office environment.',
              image: 'https://images.pexels.com/photos/7414284/pexels-photo-7414284.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
              slug: 'office-hygiene-best-practices'
            },
            {
              title: 'The Ultimate Deep Cleaning Checklist for Every Room',
              excerpt: 'A comprehensive room-by-room guide to deep cleaning.',
              image: 'https://images.pexels.com/photos/4107123/pexels-photo-4107123.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
              slug: 'deep-cleaning-checklist'
            },
            {
              title: 'Seasonal Cleaning Guide: Preparing Your Home for Every Season',
              excerpt: 'Learn how to adapt your cleaning routine for different seasons.',
              image: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
              slug: 'seasonal-cleaning-guide'
            }
          ].map((post, index) => (
            <Link
              key={index}
              to={`/blog/${post.slug}`}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-orange-200 hover:shadow-xl transition-all transform hover:-translate-y-2"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPost;