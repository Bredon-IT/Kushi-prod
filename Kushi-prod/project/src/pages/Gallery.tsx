import React, { useEffect, useState } from "react";
import axios from "axios";

interface GalleryItem {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  description: string; 
}

const CustomerGallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const API_BASE = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/gallery";

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
    const interval = setInterval(fetchGallery, 5000); // poll every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-pink-50">
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
              src={`https://bmytsqa7b3.ap-south-1.awsapprunner.com/${item.fileUrl}`}
              alt={item.fileName}
              className="w-full h-40 sm:h-48 object-cover"
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
