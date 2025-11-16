import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Share2 } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Mock blog post data - in a real app, this would come from an API
  const blogPost = {
    id: slug,
    title: 'Top 10 Eco-Friendly Cleaning Tips for Your Home',
    content: `
      <p>In today's environmentally conscious world, more homeowners are seeking sustainable cleaning solutions that protect both their families and the planet. Eco-friendly cleaning doesn't mean compromising on effectiveness – it means making smarter choices that benefit everyone. This article will guide you through our top ten tips.</p>
      <h2>Why Choose Eco-Friendly Cleaning?</h2>
      <p>Traditional cleaning products often contain harsh chemicals that can cause respiratory issues, skin irritation, and environmental damage. Eco-friendly alternatives offer the same cleaning power while being safer for your family and the environment.</p>
      <blockquote class="border-l-4 border-peach-400 pl-4 py-2 italic text-gray-700">"Adopting sustainable practices is a powerful step towards a healthier home and a greener planet, often relying on simple, common household items."</blockquote>
      <h2>Top 10 Eco-Friendly Cleaning Tips</h2>
      <ol>
        <li>
          <h3>1. Use White Vinegar as an All-Purpose Cleaner</h3>
          <p>White vinegar is a natural disinfectant that can clean glass, remove soap scum, and eliminate odors. Mix equal parts water and vinegar in a spray bottle for an effective all-purpose cleaner.</p>
        </li>
        <li>
          <h3>2. Harness the Power of Baking Soda</h3>
          <p>Baking soda is excellent for scrubbing surfaces, deodorizing carpets, and cleaning ovens. It's gentle yet effective, making it perfect for delicate surfaces.</p>
        </li>
        <li>
          <h3>3. Lemon for Natural Freshness</h3>
          <p>Lemons contain citric acid, which cuts through grease and leaves a fresh scent. Use lemon juice to clean cutting boards, remove stains, and freshen garbage disposals.</p>
        </li>
        <li>
          <h3>4. Essential Oils for Pleasant Scents</h3>
          <p>Add a few drops of essential oils like tea tree, lavender, or eucalyptus to your cleaning solutions for natural antimicrobial properties and pleasant fragrances.</p>
        </li>
        <li>
          <h3>5. Microfiber Cloths Reduce Chemical Dependency</h3>
          <p>High-quality microfiber cloths can clean effectively with just water, reducing the need for chemical cleaners while being reusable and long-lasting.</p>
        </li>
        <li>
          <h3>6. Make Your Own Glass Cleaner</h3>
          <p>Combine 2 cups water, 1/2 cup vinegar, and 1/4 cup rubbing alcohol for a streak-free glass cleaner that rivals commercial products.</p>
        </li>
        <li>
          <h3>7. Use Castile Soap for Gentle Cleaning</h3>
          <p>Made from plant oils, castile soap is biodegradable and gentle on skin while effectively cleaning dishes, floors, and even as a body wash.</p>
        </li>
        <li>
          <h3>8. Steam Cleaning for Deep Sanitization</h3>
          <p>Steam cleaning uses only water to kill bacteria and remove dirt, making it perfect for sanitizing surfaces without chemicals.</p>
        </li>
        <li>
          <h3>9. Choose Concentrated Products</h3>
          <p>When buying eco-friendly products, choose concentrated formulas that reduce packaging waste and transportation emissions.</p>
        </li>
        <li>
          <h3>10. Proper Ventilation is Key</h3>
          <p>Always ensure good ventilation when cleaning to improve air quality and help natural cleaning solutions work more effectively.</p>
        </li>
      </ol>
      <h2>Benefits of Professional Eco-Friendly Cleaning</h2>
      <p>While DIY eco-friendly cleaning is great for daily maintenance, professional cleaning services like Kushi Hygiene Services use advanced eco-friendly products and techniques that deliver superior results while maintaining environmental responsibility.</p>
      <p>Our team is trained in the latest sustainable cleaning methods and uses only certified eco-friendly products that are safe for your family, pets, and the environment.</p>
      <h2>Conclusion</h2>
      <p>Adopting eco-friendly cleaning practices is a simple yet impactful way to create a healthier home environment while protecting our planet. Start with these tips and gradually incorporate more sustainable practices into your cleaning routine.</p>
    `,
    author: 'Priya Sharma',
    date: '2024-01-15',
    readTime: '5 min read',
    image: '/kushi.png',
    category: 'Eco-Friendly'
  };

  const relatedPosts = [
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
  ];

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
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header - Full Width */}
      <header className="bg-white text-navy-700 py-4 lg:py-8">
        <div className="px-2 sm:px-4 xl:px-8 2xl:px-16">
          <Link to="/blog" className="inline-flex items-center gap-2 text-navy-700  font-medium transition-colors mb-4">
            <ArrowLeft size={18} />
            All Articles
          </Link>
          <h1 className="text-1xl sm:text-2xl font-bold mb-4 leading-tight max-w-2xl">
            {blogPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-navy-700 text-sm">
            <span className="flex items-center gap-2">
              <User size={16} />
              <span className="font-medium">{blogPost.author}</span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(blogPost.date)}</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} />
              <span>{blogPost.readTime}</span>
            </span>
            <button onClick={sharePost} className="flex items-center gap-2 text-peach-400 hover:text-peach-400 transition-colors font-medium">
              <Share2 size={16} />
              Share Article
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Section - Grid Layout */}
      <section className="py-6 px-2 sm:px-4 xl:px-8 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Article Content (takes 3/4 width on desktop) */}
          <div className="lg:col-span-3">
            <article>
              <div
                className="prose prose-xl max-w-none prose-headings:text-gray-900 prose-headings:font-extrabold prose-h2:mt-10 prose-h3:text-peach-600 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-navy-700 prose-a:font-semibold hover:prose-a:text-peach-400 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-2 prose-li:marker:text-peach-400 prose-blockquote:text-lg prose-blockquote:font-normal prose-blockquote:border-peach-400"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />

              {/* Final Call to Action */}
              <div className="mt-12 p-8 bg-navy-50 rounded-xl border-l-8 border-peach-400 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-400 to-navy-700">Expert Cleaning</span>?
                </h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Contact us today to discuss your cleaning needs with our certified eco-friendly team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/contact" 
                   onClick={() => window.scrollTo(0, 0)}
                  className="bg-gradient-to-r from-peach-400 to-navy-700 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg text-center">
                    Get Free Quote

                  </Link>
                  <Link to="/services"
                   onClick={() => window.scrollTo(0, 0)}
                   className="border-2 border-navy-700 text-navy-700 px-6 py-3 rounded-lg font-semibold hover:bg-navy-700 hover:text-white transition-all text-center">
                    View Services
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {/* Column 2: Corner Image / Sidebar (takes 1/4 width on desktop) */}
          <aside className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="sticky top-10 p-6 bg-peach-50 rounded-xl border border-peach-200 shadow-lg">
              <h4 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2 border-peach-200">Featured Image</h4>
              <img src={blogPost.image} alt={blogPost.title} className="w-full h-auto rounded-lg mb-4 object-cover border-4 border-white shadow-md" />
              <p className="text-sm text-gray-600 italic">
                {blogPost.category} - Discovering safe and effective ways to keep your home spotless.
              </p>
            </div>
            {/* You could place a small newsletter signup or social links here */}
          </aside>
        </div>
      </section>

      {/* Related Posts Section - Full Width (Adjusted Spacing and Card Size) */}
      <section className="mt-0 py-12 bg-gray-50 border-t border-gray-200">
        <div className="px-4 sm:px-8 xl:px-16 2xl:px-32">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            More <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-400 to-navy-700">Articles</span> You'll Love
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((post, index) => (
              <Link key={index} to={`/blog/${post.slug}`} className="bg-white rounded-xl overflow-hidden shadow-md border border-navy-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                <img src={post.image} alt={post.title} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{post.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Inline styles to reduce vertical spacing between points and list items */}
      <style>{`
        /* Reduce paragraph and list spacing inside prose */
        .prose p { margin-bottom: 0.5rem; }
        .prose li { margin-bottom: 0.35rem; }
        .prose ol { margin-top: 0.25rem; margin-bottom: 0.5rem; }
        .prose h3 { margin-top: 0.4rem; margin-bottom: 0.35rem; }
        .prose blockquote { margin: 0.5rem 0; padding-left: 0.75rem; }
        /* Slightly smaller blockquote font to tighten look */
        .prose blockquote { font-size: 1rem; }
      `}</style>
    </div>
  );
};

export default BlogPost;