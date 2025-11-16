import React, { useEffect, useState } from "react";
import axios from "axios";
import Global_API_BASE from '../services/GlobalConstants';

interface GalleryItem {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  description: string; 
}

const CustomerGallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const API_BASE = Global_API_BASE + "/api/gallery";

  const fetchGallery = async () => {
    try {
      const res = await axios.get<GalleryItem[]>(API_BASE);
      setGallery(res.data);
    } catch (err) {
      console.error("Failed to fetch gallery", err);
    }
  };

  // Fetch gallery on mount and every 5 seconds
  useEffect(() => {
    fetchGallery();
    const interval = setInterval(fetchGallery, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-10xl mx-auto bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Our Gallery
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={`${Global_API_BASE}/${item.fileUrl}`}
              alt={item.fileName}
              className="w-full h-40 sm:h-48 object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src = "/fallback.jpg"; // local fallback image
              }}
            />
            <div className="p-2 sm:p-4">
              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {item.fileName}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 italic mt-1">
                {item.description || "No description"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerGallery;
