
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Global_API_BASE from "../services/GlobalConstants";

interface Offer {
  id: number;
  text?: string;
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const speed = 0.5;

  const normalize = (u?: string | null) => {
    if (!u) return null;
    const s = String(u);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/")) return `${Global_API_BASE}${s}`;
    return `${Global_API_BASE}/uploads/${s}`;
  };

  const fetchOffers = async () => {
    try {
      const res = await axios.get<Offer[]>(`${Global_API_BASE}/api/offers`);
      const offersList = res.data.map((o) => ({
        ...o,
        imageUrl: normalize(o.imageUrl)
      }));
      setOffers(offersList);

      const offerWithImage = offersList.find((o) => o.imageUrl);
      onHeroImageUpdate(offerWithImage ? offerWithImage.imageUrl || null : null);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 15000);
    return () => clearInterval(interval);
  }, []);

  const animateScroll = () => {
    if (!scrollRef.current || !containerRef.current) return;

    const width = scrollRef.current.scrollWidth;
    offsetRef.current -= speed;

    if (-offsetRef.current >= width / 2) {
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

  const duplicated = [...offers];
  while (duplicated.length < offers.length * 10) duplicated.push(...offers);

  return (
    <div className="bg-peach-50 border-t border-b border-peach-300 overflow-hidden h-10">
      <div ref={containerRef} className="relative h-full w-full">
        <div
          ref={scrollRef}
          className="absolute top-2 flex whitespace-nowrap -translate-y-1/2"
        >
          {duplicated.map((o, i) => (
            <span
              key={i}
              className="text-lg font-semibold mr-32"
              style={{ fontFamily: o.fontFamily, color: o.color, minWidth: 200 }}
            >
              {o.emoji} {o.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RotatingOffers;