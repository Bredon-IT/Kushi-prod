import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Upload, Loader2, Image } from "lucide-react";
import Global_API_BASE from "../../services/admin/GlobalConstants";



// --- Interface Definitions ---

interface GalleryItem {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  description?: string;
}

// Helper to determine if the URL points to a video
const isVideoFile = (url: string) => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

// --- Gallery Media Component ---
const GalleryMedia: React.FC<{ item: GalleryItem }> = ({ item }) => {
  const fullUrl = `${Global_API_BASE}/${item.fileUrl}`;
  const isVideo = isVideoFile(item.fileUrl);

  return (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
      {isVideo ? (
        <video
          src={fullUrl}
          className="w-full h-full object-cover"
          controls
          muted
        />
      ) : (
        <img
          src={fullUrl}
          alt={item.fileName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.onerror = null;
            img.src = "/fallback.jpg";   // LOCAL fallback image
          }}
        />
      )}
    </div>
  );
};

// --- AdminGallery Component ---

const AdminGallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const API_BASE = Global_API_BASE + "/api/gallery";

  // --- Data Fetching ---
  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<GalleryItem[]>(API_BASE);

      // Sort by latest upload
      const sortedData = res.data.sort((a, b) => {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });

      setGallery(sortedData);
    } catch (err) {
      console.error("Failed to fetch gallery", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // --- Event Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFileUrl("");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value);
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile && !fileUrl) {
      return alert("Please select a file or enter a URL.");
    }

    setIsUploading(true);
    const formData = new FormData();

    if (selectedFile) {
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);
    } else if (fileUrl) {
      formData.append("fileUrl", fileUrl);
      formData.append(
        "fileName",
        fileUrl.substring(fileUrl.lastIndexOf("/") + 1) || "remote_upload"
      );
    }

    formData.append("description", description);

    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedFile(null);
      setFileUrl("");
      setDescription("");

      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchGallery();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this item?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchGallery();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Deletion failed.");
    }
  };

  // Render
  return (
    <div className="w-full overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
  <div className="min-w-[950px]">
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-2">
        🖼️ Media Gallery Management
      </h1>

      {/* Upload Card */}
      <div className="bg-white p-6 shadow-xl rounded-2xl mb-10 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <Upload size={20} /> Upload New Media
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* File Input */}
          <div className="md:col-span-2">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Select Local File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2
              file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {selectedFile && (
              <p className="mt-1 text-xs text-blue-600 truncate">Selected: {selectedFile.name}</p>
            )}
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="file-url" className="block text-sm font-medium text-gray-700 mb-1">
              Or Media URL (Image/Video)
            </label>
            <input
              id="file-url"
              type="url"
              placeholder="https://example.com/media.jpg"
              value={fileUrl}
              onChange={handleUrlChange}
              disabled={!!selectedFile}
              className="w-full border border-gray-300 p-2 rounded-lg text-sm
              focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              id="description"
              type="text"
              placeholder="Short description for the media"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg text-sm
              focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={isUploading || (!selectedFile && !fileUrl)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5
            rounded-xl text-lg font-medium shadow-md hover:bg-blue-700 transition
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload size={20} /> Finalize Upload
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Display Section */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Current Gallery Items ({gallery.length})
      </h2>

      {isLoading && (
        <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <span className="ml-3 text-lg text-gray-600">Loading gallery...</span>
        </div>
      )}

      {!isLoading && gallery.length === 0 && (
        <div className="text-center p-12 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
          <Image size={36} className="text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-700">Gallery is Empty</p>
          <p className="text-sm text-gray-500">Use the form above to start adding media files.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl
            transition duration-300 overflow-hidden border border-gray-200"
          >
            <GalleryMedia item={item} />

            <div className="p-4 flex flex-col justify-between min-h-[100px]">
              <div className="mb-3">
                <p className="font-bold text-base text-gray-900 truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">
                  {item.description || "No description provided."}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 text-red-600 text-sm font-medium
                  hover:text-red-800 transition p-1 rounded-md hover:bg-red-50"
                  title={`Delete ${item.fileName}`}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
  );
};

export default AdminGallery;











