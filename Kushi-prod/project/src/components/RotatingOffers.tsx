import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Offer {
  id: number;
  text: string;
  fontFamily?: string;
  color?: string;
  emoji?: string;
  imageUrl?: string;
}

interface Banner {
  id: number;
  imageUrl: string;
  link?: string; // optional clickable banner
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
  const speed = 1; // pixels per frame

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const res = await axios.get<Offer[]>("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/offers");
      setOffers(res.data);

      const offerWithImage = res.data.find((offer) => offer.imageUrl);
      onHeroImageUpdate(offerWithImage ? offerWithImage.imageUrl! : null);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const res = await axios.get<Banner[]>("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/banners");
      // Prepend backend URL if imageUrl is just a filename
      const bannersWithFullUrl = res.data.map((b) => ({
        ...b,
        imageUrl: b.imageUrl.startsWith("http")
          ? b.imageUrl
          : `https://bmytsqa7b3.ap-south-1.awsapprunner.com/uploads/${b.imageUrl}`,
      }));
      console.log("Fetched banners:", bannersWithFullUrl);
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

  if (offers.length === 0) {
    return (
      <div className="bg-peach-50 border-t border-b border-peach-300 py-4 flex items-center justify-center">
        <p className="text-gray-500 text-center text-lg">No current offers</p>
      </div>
    );
  }

  // Duplicate offers enough times to fill the screen
  const duplicatedOffers = [...offers];
  while (
    duplicatedOffers.reduce((sum, o) => sum + (o.text.length * 10 + 32), 0) <
    window.innerWidth * 2
  ) {
    duplicatedOffers.push(...offers);
  }

  return (
    <div>
      {/* Scrolling Offers */}
      <div
        ref={containerRef}
        className="bg-peach-50 border-t border-b border-peach-300 overflow-hidden h-12 w-full relative"
      >
        <div
          ref={scrollRef}
          className="flex whitespace-nowrap absolute top-1/2 -translate-y-1/2"
          style={{ willChange: "transform" }}
        >
          {duplicatedOffers.map((offer, idx) => (
            <span
              key={idx}
              className="text-lg font-semibold mr-16 inline-block"
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
      </div>

      {/* Admin Banners */}
      {banners.length > 0 && (
        <div className="mt-2 w-full flex justify-center gap-4 flex-wrap">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link || "#"}
              className="inline-block"
              target={banner.link ? "_blank" : "_self"}
              rel="noopener noreferrer"
            >
              <img
                src={banner.imageUrl}
                alt="Banner"
                className="max-w-full h-auto rounded-md shadow-md"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default RotatingOffers;
