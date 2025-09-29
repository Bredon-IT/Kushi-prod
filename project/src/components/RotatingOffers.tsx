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

interface RotatingOffersProps {
  onHeroImageUpdate: (imageUrl: string | null) => void;
}

const RotatingOffers: React.FC<RotatingOffersProps> = ({ onHeroImageUpdate }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const requestRef = useRef<number>();

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

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 15000);
    return () => clearInterval(interval);
  }, []);

  const speed = 1; // pixels per frame

  const animateScroll = () => {
    if (!scrollRef.current) return;

    const scrollWidth = scrollRef.current.scrollWidth / 2; // only reset after half (original offers)

    offsetRef.current -= speed;
    if (-offsetRef.current >= scrollWidth) offsetRef.current = 0;

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

  return (
    <div className="bg-peach-50 border-t border-b border-peach-300 overflow-hidden h-12 w-full relative">
      <div
        ref={scrollRef}
        className="flex whitespace-nowrap gap-16 absolute top-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        {/* Duplicate offers for seamless loop */}
        {[...offers, ...offers].map((offer, idx) => (
          <span
            key={idx}
            className="text-lg font-semibold"
            style={{
              fontFamily: offer.fontFamily || "Arial",
              color: offer.color || "#000",
            }}
          >
            {offer.emoji} {offer.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RotatingOffers;
