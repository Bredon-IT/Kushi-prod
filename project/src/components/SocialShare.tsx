import React from 'react';
import { Facebook, Twitter, Linkedin, Mail, Share2 } from 'lucide-react';
import { trackSocialMediaClick } from '../utils/analytics';
import { fbTrackCustomEvent } from '../utils/fbPixel';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title = 'Check out Kushi Services',
  description = 'Professional home services in Bangalore',
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const handleShare = (platform: string, shareUrl: string) => {
    // Track analytics
    trackSocialMediaClick(platform, url);
    fbTrackCustomEvent('Share', { platform, url });

    // Open share window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const message = `${title}\n\n${description}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    trackSocialMediaClick('WhatsApp', url);
    fbTrackCustomEvent('Share', { platform: 'WhatsApp', url });
    
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodedTitle;
    const body = `${description}%0A%0A${encodedUrl}`;
    
    trackSocialMediaClick('Email', url);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        trackSocialMediaClick('Native Share', url);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
      
      {/* Facebook */}
      <button
        onClick={() => handleShare('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={18} />
      </button>

      {/* Twitter */}
      <button
        onClick={() => handleShare('Twitter', `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)}
        className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={18} />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
        className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsAppShare}
        className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
        aria-label="Share on WhatsApp"
      >
        <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {/* Email */}
      <button
        onClick={handleEmailShare}
        className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
        aria-label="Share via Email"
      >
        <Mail size={18} />
      </button>

      {/* Native Share (if available) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-colors"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>
      )}
    </div>
  );
};

export default SocialShare;
