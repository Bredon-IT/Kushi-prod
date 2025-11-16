import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Global_API_BASE from "../services/GlobalConstants";

interface Offer {
  id: number;
  text: string;
  fontFamily?: string;
  color?: string;
  emoji?: string;
  imageUrl?: string;
}

interface Banner {
  id: number | string;
  imageUrl: string;
  link?: string; // optional clickable banner
  title?: string;
}

interface RotatingOffersProps {
  onHeroImageUpdate: (imageUrl: string | null) => void;
}

const RotatingOffers: React.FC<RotatingOffersProps> = ({ onHeroImageUpdate }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const requestRef = useRef<number>();
  // DECREASED SPEED to 0.5 (was 1)
  const speed = 0.5; // pixels per frame 

  // normalize helper used for offers & banners
  const normalize = (u?: string | null) => {
    if (!u) return null;
    const s = String(u);
    if (s.startsWith("http") || s.startsWith("//") || s.startsWith("data:")) return s;
    if (s.startsWith("/")) return `${Global_API_BASE}${s}`;
    return Global_API_BASE + `/uploads/${s}`;
  };


    // Fetch offers
  const fetchOffers = async () => {
    try {
      const res = await axios.get<Offer[]>( Global_API_BASE + "/api/offers");
      const offersData = res.data || [];
      setOffers(offersData);

      const offerWithImage = offersData.find((offer) => offer.imageUrl);
      onHeroImageUpdate(offerWithImage ? normalize(offerWithImage.imageUrl) : null);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };


  // Fetch banners
  const fetchBanners = async () => {
    try {
      const res = await axios.get<Banner[]>( Global_API_BASE + "/api/offers/banners");
      const bannersWithFullUrl = (res.data || []).map((b) => ({
        ...b,
        imageUrl: normalize(b.imageUrl) || "",
      }));
      setBanners(bannersWithFullUrl);
    } catch (err) {
      console.error("Error fetching banners:", err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchBanners();
    const interval = setInterval(() => {
      fetchOffers();
      fetchBanners();
    }, 15000);
    return () => clearInterval(interval);
  }, []);


  const animateScroll = () => {
    if (!scrollRef.current || !containerRef.current) return;
    const scrollWidth = scrollRef.current.scrollWidth;
    offsetRef.current -= speed;
    if (-offsetRef.current >= scrollWidth / 2) {
      offsetRef.current = 0;
    }
    scrollRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    requestRef.current = requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    if (offers.length > 0) {
      offsetRef.current = 0;
      requestRef.current = requestAnimationFrame(animateScroll);
    }
    return () => requestRef.current && cancelAnimationFrame(requestRef.current);
  }, [offers]);

  const duplicatedOffers = [...offers];
  if (offers.length) {
    while (
      duplicatedOffers.reduce((sum, o) => sum + (o.text?.length * 10 + 32 || 200), 0) <
      window.innerWidth * 2
    ) {
      duplicatedOffers.push(...offers);
    }
  }

  
  return (
    <div>
      {/* Scrolling Offers */}
      <div
        ref={containerRef}
      className="bg-peach-50 border-t border-b border-peach-300 overflow-hidden h-12 w-full relative"
      >
        {offers.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex whitespace-nowrap absolute top-2 -translate-y-1/2"
            style={{ willChange: "transform" }}
          >
            {duplicatedOffers.map((offer, idx) => (
              <span
                key={idx}
                // INCREASED SPACING: Changed from mr-16 to mr-32
                className="text-lg font-semibold mr-32 inline-block" 
                style={{
                  minWidth: "200px",
                  fontFamily: offer.fontFamily || "Arial",
                  color: offer.color || "#000",
                }}
              >
                {offer.emoji} {offer.text}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center text-lg">Offers Loading ...</p>
          </div>
        )}
      </div>

        {/* Admin Banners - render with original image dimensions (no forced max-width) */}
      {banners.length > 0 && (
        <div className="mt-2 w-full flex justify-center gap-4 flex-wrap items-start">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link || "#"}
              className="inline-block"
              target={banner.link ? "_blank" : "_self"}
              rel="noopener noreferrer"
              style={{ display: "inline-block" }}
            >
              {/* preserve original/native image size by NOT forcing max-w/full */}
              <img
                src={banner.imageUrl}
                alt={banner.title || "Banner"}
                style={{ display: "block", width: "auto", height: "auto" }}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default RotatingOffers;