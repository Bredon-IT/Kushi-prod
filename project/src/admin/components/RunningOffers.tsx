import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Trash2, PlusCircle, Edit3, X } from "lucide-react";
import axios from "axios";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import Global_API_BASE from "../services/GlobalConstants";

interface Offer {
  id: number;
  text?: string;
  fontFamily?: string;
  color?: string;
  emoji?: string;
  imageUrl?: string;
}

interface RunningOffersCardProps {
  onClose: () => void;
}

const fontOptions = [
  "Arial", "Verdana", "Georgia", "Courier New", "Times New Roman", "Trebuchet MS",
  "Impact", "Comic Sans MS", "Lucida Console", "Palatino", "Garamond", "Bookman",
  "Candara", "Tahoma", "Helvetica", "Franklin Gothic", "Futura", "Gill Sans",
  "Century Gothic", "Roboto"
];

export const RunningOffersCard: React.FC<RunningOffersCardProps> = ({ onClose }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    text: "",
    fontFamily: "Arial",
    color: "#000000",
    emoji: "",
    imageUrl: ""
  });

  const [offerType, setOfferType] = useState<"text" | "image" | "both">("text");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ----------------------
  // NORMALIZE IMAGE URL
  // ----------------------
  const normalize = (u?: string | null) => {
    if (!u) return "";

    const s = String(u).trim();

    // 1) If it is already a full URL → return as-is
    if (s.startsWith("http")) return s;

    // 2) If backend returned "/uploads/file.jpg"
    if (s.startsWith("/uploads/"))
      return `${Global_API_BASE}${s}`;

    // 3) If backend returned only filename → convert to backend URL
    return `${Global_API_BASE}/${s}`;
  };

  // ----------------------
  // LOAD OFFERS
  // ----------------------
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Global_API_BASE}/api/offers`);
      setOffers(
        (res.data || []).map((o: Offer) => ({
          ...o,
          imageUrl: normalize(o.imageUrl)
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // ----------------------
  // IMAGE UPLOAD
  // ----------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const form = new FormData();
    form.append("file", e.target.files[0]);

    try {
      const res = await axios.post(`${Global_API_BASE}/api/offers/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const url = res.data?.url ?? res.data;

      // ALWAYS use absolute backend path
      const normalizedUrl = normalize(url);

      setNewOffer((prev) => ({ ...prev, imageUrl: normalizedUrl }));
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  // ----------------------
  // SAVE OFFER
  // ----------------------
  const saveOffer = async () => {
    const payload = {
      text: newOffer.text ?? "",
      fontFamily: newOffer.fontFamily ?? "Arial",
      color: newOffer.color ?? "#000000",
      emoji: newOffer.emoji ?? "",
      imageUrl: newOffer.imageUrl ?? ""
    };

    try {
      if (editingId) {
        await axios.put(`${Global_API_BASE}/api/offers/${editingId}`, payload);
      } else {
        await axios.post(`${Global_API_BASE}/api/offers`, payload);
      }

      await fetchOffers();
      setEditingId(null);

      setNewOffer({
        text: "",
        fontFamily: "Arial",
        color: "#000000",
        emoji: "",
        imageUrl: ""
      });

    } catch (err) {
      alert("Failed to save offer");
      console.error(err);
    }
  };

  // ----------------------
  // DELETE OFFER
  // ----------------------
  const deleteOffer = async (id: number) => {
    if (!confirm("Delete this offer?")) return;

    try {
      await axios.delete(`${Global_API_BASE}/api/offers/${id}`);
      await fetchOffers();
    } catch {
      alert("Failed to delete");
    }
  };

  // ----------------------
  // EDIT OFFER
  // ----------------------
  const editOffer = (offer: Offer) => {
    setEditingId(offer.id);

    setNewOffer({
      ...offer,
      imageUrl: normalize(offer.imageUrl)
    });

    setOfferType(
      offer.text && offer.imageUrl
        ? "both"
        : offer.text
          ? "text"
          : "image"
    );
  };

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto p-6">

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold mb-4">Manage Running Offers</h3>

        {/* ======================================
             OFFER EDITOR
        ====================================== */}
        <div className="border p-4 rounded-lg mb-6 bg-gray-50">
          <label className="block mb-2 font-medium">Offer Type</label>
          <select
            className="border rounded px-3 py-2 w-full mb-3"
            value={offerType}
            onChange={(e) => setOfferType(e.target.value as any)}
          >
            <option value="text">Text Only</option>
            <option value="image">Image Only</option>
            <option value="both">Text + Image</option>
          </select>

          {/* TEXT INPUTS */}
          {(offerType === "text" || offerType === "both") && (
            <>
              <input
                type="text"
                placeholder="Offer text"
                value={newOffer.text}
                onChange={(e) => setNewOffer((p) => ({ ...p, text: e.target.value }))}
                className="border rounded w-full px-3 py-2 mb-3"
              />

              <select
                value={newOffer.fontFamily}
                onChange={(e) => setNewOffer((p) => ({ ...p, fontFamily: e.target.value }))}
                className="border rounded w-full px-3 py-2 mb-3"
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>

              <label className="font-medium">Color:</label>
              <input
                type="color"
                className="ml-2"
                value={newOffer.color}
                onChange={(e) => setNewOffer((p) => ({ ...p, color: e.target.value }))}
              />

              <div className="relative mt-3">
                <input
                  type="text"
                  className="border rounded w-full px-3 py-2"
                  value={newOffer.emoji}
                  onChange={(e) => setNewOffer((p) => ({ ...p, emoji: e.target.value }))}
                  placeholder="Emoji"
                />
                <button
                  className="absolute right-3 top-2 text-xl"
                  onClick={() => setEmojiPickerOpen((p) => !p)}
                >
                  😀
                </button>

                {emojiPickerOpen && (
                  <div className="absolute z-50 mt-2">
                    <Picker data={data} onEmojiSelect={(e: any) => setNewOffer((p) => ({ ...p, emoji: e.native }))} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* IMAGE INPUTS */}
          {(offerType === "image" || offerType === "both") && (
            <>
              {offerType === "both" && (
                <input
                  type="text"
                  placeholder="Image URL"
                  className="border w-full px-3 py-2 mt-3"
                  value={newOffer.imageUrl}
                  onChange={(e) =>
                    setNewOffer((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                />
              )}

              {/* Always allow file upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-3"
              />
            </>
          )}

          {/* PREVIEW */}
          {(newOffer.text || newOffer.imageUrl) && (
            <div className="mt-4 p-3 border rounded">
              {newOffer.imageUrl && (
                <img
                  src={normalize(newOffer.imageUrl)}
                  className="h-12 w-12 object-cover rounded mb-2"
                  alt="preview"
                />
              )}
              {newOffer.text && (
                <p style={{ fontFamily: newOffer.fontFamily, color: newOffer.color }}>
                  {newOffer.emoji} {newOffer.text}
                </p>
              )}
            </div>
          )}

          <Button onClick={saveOffer} className="w-full mt-4 flex items-center justify-center">
            <PlusCircle size={16} /> {editingId ? "Update Offer" : "Add Offer"}
          </Button>
        </div>

        {/* ======================================
             OFFER LIST
        ====================================== */}
        <div>
          <h4 className="font-semibold mb-2">Running Offers</h4>

          {loading ? (
            <p>Loading...</p>
          ) : offers.length === 0 ? (
            <p>No offers added.</p>
          ) : (
            <ul className="space-y-3">
              {offers.map((offer, index) => (
                <li
                  key={offer.id ?? `offer_${index}`}
                  className="p-3 border rounded flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {offer.imageUrl && (
                      <img
                        src={normalize(offer.imageUrl)}
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}

                    <span
                      style={{
                        fontFamily: offer.fontFamily,
                        color: offer.color,
                        fontSize: "1.1rem"
                      }}
                    >
                      {offer.emoji} {offer.text}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => editOffer(offer)}>
                      <Edit3 size={16} /> Edit
                    </Button>

                    <Button variant="danger" size="sm" onClick={() => deleteOffer(offer.id)}>
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default RunningOffersCard;