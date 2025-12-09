import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Trash2, PlusCircle, Edit3, X } from "lucide-react";
import axios from "axios";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import Global_API_BASE from "../../services/admin/GlobalConstants";

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
  imageUrl?: string;
  title?: string;
  link?: string;
}

interface RunningOffersCardProps {
  onClose: () => void;
}

const fontOptions = [
  "Arial", "Verdana", "Georgia", "Courier New", "Times New Roman", "Trebuchet MS", "Impact", "Comic Sans MS",
  "Lucida Console", "Palatino", "Garamond", "Bookman", "Candara", "Tahoma", "Helvetica", "Franklin Gothic",
  "Futura", "Gill Sans", "Century Gothic", "Roboto"
];

export const RunningOffersCard: React.FC<RunningOffersCardProps> = ({ onClose }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({ text: "", fontFamily: "Arial", color: "#000000", emoji: "", imageUrl: "" });
  const [offerType, setOfferType] = useState<"text" | "image" | "both">("text");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newBanner, setNewBanner] = useState<Partial<Banner>>({ title: "", link: "", imageUrl: "" });
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [oRes, bRes] = await Promise.all([
        axios.get(Global_API_BASE + "/api/offers"),
        axios.get(Global_API_BASE + "/api/offers/banners"),
      ]);

      // normalize offer image paths (accept filename or full URL)
      const normalizedOffers = (oRes.data || []).map((o: any) => ({
        ...o,
        imageUrl: o.imageUrl ? (String(o.imageUrl).startsWith("http") ? o.imageUrl : `Global_API_BASE/uploads/${o.imageUrl}`) : "",
        text: o.text ?? "",
        fontFamily: o.fontFamily ?? "Arial",
        color: o.color ?? "#000000",
      }));
      setOffers(normalizedOffers);

      // normalize banner image paths (accept filename or full URL)
      const normalizedBanners = (bRes.data || []).map((b: any) => ({
        ...b,
        imageUrl: b.imageUrl ? (String(b.imageUrl).startsWith("http") ? b.imageUrl : `Global_API_BASE/uploads/${b.imageUrl}`) : "",
      }));
      setBanners(normalizedBanners);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await axios.post(Global_API_BASE + "/api/offers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewOffer(prev => ({ ...prev, imageUrl: res.data }));
    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Image upload failed: " + (err.response?.data || err.message));
    }
  };

  const handleSaveOffer = async () => {
    if ((offerType === "text" || offerType === "both") && !newOffer.text?.trim() && !newOffer.imageUrl) {
      alert("Enter text or image");
      return;
    }
    try {
      if (editingId != null) {
        await axios.put(Global_API_BASE + `/api/offers/${editingId}`, newOffer);
      } else {
        await axios.post(Global_API_BASE + "/api/offers", newOffer);
      }
      // refresh from server to pick up normalized data / ids
      await fetchAll();

      setNewOffer({ text: "", fontFamily: "Arial", color: "#000000", emoji: "", imageUrl: "" });
      setEditingId(null);
      setEmojiPickerOpen(false);
      setOfferType("text");
    } catch (err) {
      console.error(err);
      alert("Failed to save offer");
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await axios.delete(Global_API_BASE + `/api/offers/${id}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete offer");
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingId(offer.id);
    setNewOffer({ ...offer });
    setOfferType(offer.text && offer.imageUrl ? "both" : offer.text ? "text" : "image");
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await axios.post(Global_API_BASE + "/api/offers/banners/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data;
      setNewBanner(prev => ({ ...prev, imageUrl }));
    } catch (err: any) {
      console.error("Banner upload failed:", err.response?.data || err.message);
      alert("Banner upload failed: " + (err.response?.data || err.message));
    }
  };

  const handleSaveBanner = async () => {
    if (!newBanner.imageUrl) { alert("Please provide an image or upload a file"); return; }
    try {
      if (editingBannerId != null) {
        await axios.put(Global_API_BASE + `/api/offers/banners/${editingBannerId}`, newBanner);
      } else {
        await axios.post(Global_API_BASE + "/api/offers/banners", newBanner);
      }
      await fetchAll();
      setNewBanner({ title: "", link: "", imageUrl: "" });
      setEditingBannerId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save banner");
    }
  };

  const handleEditBanner = (b: Banner) => {
    setEditingBannerId(Number(b.id));
    setNewBanner({ title: b.title || "", link: b.link || "", imageUrl: b.imageUrl || "" });
  };

  const handleDeleteBanner = async (id: number | string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await axios.delete(Global_API_BASE + `/api/offers/banners/${id}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete banner");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Running Offers & Banners</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage offers and admin banners visible to customers</p>

        {/* Offers editor */}
        <div className="space-y-2 mb-6 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-4 mb-2">
            <label className="text-sm font-medium">Offer Type:</label>
            <select value={offerType} onChange={(e) => setOfferType(e.target.value as any)} className="border rounded px-3 py-2 text-sm">
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="both">Both</option>
            </select>
          </div>

          {(offerType === "text" || offerType === "both") && <>
            <input type="text" placeholder="Enter offer text..." value={newOffer.text} onChange={e => setNewOffer(prev => ({ ...prev, text: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
            <select value={newOffer.fontFamily} onChange={e => setNewOffer(prev => ({ ...prev, fontFamily: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
              {fontOptions.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <div className="flex items-center gap-2"><label>Color:</label><input type="color" value={newOffer.color} onChange={e => setNewOffer(prev => ({ ...prev, color: e.target.value }))} className="w-12 h-8" /></div>
            <div className="relative">
              <input type="text" placeholder="Add emoji 🙂" value={newOffer.emoji} onChange={e => setNewOffer(prev => ({ ...prev, emoji: e.target.value }))} className="w-full border rounded px-3 py-2" />
              <button onClick={() => setEmojiPickerOpen(prev => !prev)} className="absolute right-2 top-2">😊</button>
              {emojiPickerOpen && <div className="absolute z-50 mt-2"><Picker data={data} onEmojiSelect={emoji => setNewOffer(prev => ({ ...prev, emoji: emoji.native }))} /></div>}
            </div>
          </>}

          {(offerType === "image" || offerType === "both") && <>
            <input type="url" placeholder="Image URL..." value={newOffer.imageUrl} onChange={e => setNewOffer(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full border rounded px-3 py-2" />
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm" />
          </>}

          {(newOffer.text || newOffer.imageUrl) && <div className="p-3 border rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800">
            {newOffer.imageUrl && <img src={newOffer.imageUrl} className="h-12 w-12 rounded object-cover" />}
            {newOffer.text && <span style={{ fontFamily: newOffer.fontFamily, color: newOffer.color }} className="text-lg">{newOffer.emoji} {newOffer.text}</span>}
          </div>}

          <Button onClick={handleSaveOffer} className="flex items-center justify-center space-x-1 w-full mt-2">
            <PlusCircle size={16} /> <span>{editingId ? "Update" : "Add"}</span>
          </Button>
        </div>

        {/* Banner Editor */}
        <div className="space-y-2 mb-6 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <h4 className="font-semibold mb-2">Banners</h4>
          <input type="text" placeholder="Banner title (optional)" value={newBanner.title} onChange={e => setNewBanner(prev => ({ ...prev, title: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mb-2" />
          <input type="url" placeholder="Link (optional)" value={newBanner.link} onChange={e => setNewBanner(prev => ({ ...prev, link: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mb-2" />
          <input type="url" placeholder="Image URL (optional)" value={newBanner.imageUrl} onChange={e => setNewBanner(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" />
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" onChange={handleBannerFileChange} />
            <small className="text-xs text-gray-500">Upload will store banner on server</small>
          </div>

          {newBanner.imageUrl && (
            <div className="mt-3 p-2 border rounded">
              <strong className="block mb-1">{newBanner.title || "Banner preview"}</strong>
              <img src={newBanner.imageUrl} alt={newBanner.title || "Preview"} style={{ display: "block", width: "auto", height: "auto", maxWidth: "100%" }} />
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button onClick={handleSaveBanner}><PlusCircle size={16} /> {editingBannerId ? "Update Banner" : "Add Banner"}</Button>
          </div>
        </div>

        {/* Lists */}
        {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
          <>
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Active Banners</h5>
              {banners.length === 0 ? <p>No banners</p> : (
                <ul className="space-y-3">
                  {banners.map(b => (
                    <li key={String(b.id)} className="p-3 border rounded-lg flex flex-col gap-2 bg-white dark:bg-gray-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {b.imageUrl ? (
                            <img src={b.imageUrl} alt={b.title || "Banner"} style={{ display: "block", width: "auto", height: "auto", maxWidth: "320px" }} />
                          ) : (
                            <div className="w-32 h-16 bg-gray-200 rounded" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{b.title || "Untitled Banner"}</div>
                              <div className="text-sm text-gray-600 break-words">{b.link || "No link"}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditBanner(b)}><Edit3 size={16} /> Edit</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteBanner(b.id)}><Trash2 size={16} /> Delete</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h5 className="font-semibold mb-2">Running Offers</h5>
              {offers.length === 0 ? <p>No offers</p> : (
                <ul className="space-y-3">
                  {offers.map(offer => (
                    <li key={offer.id} className="p-3 border rounded-lg flex flex-col gap-2 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        {offer.imageUrl && <img src={offer.imageUrl} className="h-12 w-12 rounded object-cover" alt="offer" />}
                        {offer.text && <span style={{ fontFamily: offer.fontFamily, color: offer.color }}>{offer.emoji} {offer.text}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditOffer(offer)}><Edit3 size={16} /> Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteOffer(offer.id as number)}><Trash2 size={16} /> Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RunningOffersCard;

