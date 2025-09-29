import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Upload } from "lucide-react";

interface GalleryItem {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  description?: string;
}

const AdminGallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(""); // for URL upload
  const [description, setDescription] = useState<string>("");

  const API_BASE = "https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/gallery";

  const fetchGallery = async () => {
    try {
      const res = await axios.get<GalleryItem[]>(API_BASE);
      setGallery(res.data);
    } catch (err) {
      console.error("Failed to fetch gallery", err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile && !fileUrl) {
      return alert("Please select a file or enter a URL");
    }

    const formData = new FormData();
    if (selectedFile) formData.append("file", selectedFile);
    if (fileUrl) formData.append("fileUrl", fileUrl);
    formData.append("description", description);

    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      setFileUrl("");
      setDescription("");
      fetchGallery(); // refresh gallery after upload
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchGallery();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Admin Gallery Dashboard
      </h2>

      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-white shadow-md rounded-xl p-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Or enter image/video URL"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className="border p-2 rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 border p-2 rounded-lg text-sm"
        />
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Upload size={18} /> Upload
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={`https://bmytsqa7b3.ap-south-1.awsapprunner.com/${item.fileUrl}`}
              alt={item.fileName}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="font-semibold text-gray-800 truncate">
                {item.fileName}
              </p>
              <p className="text-sm text-gray-600 italic mt-1">
                {item.description || "No description"}
              </p>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1 text-red-600 text-sm font-medium mt-3 hover:text-red-800 transition"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGallery;
