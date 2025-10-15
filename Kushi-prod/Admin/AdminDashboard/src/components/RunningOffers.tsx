import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Trash2, PlusCircle, Edit3, X } from "lucide-react";
import axios from "axios";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface Offer {
  id: number;
  text: string;
  fontFamily?: string;
  color?: string;
  emoji?: string;
  imageUrl?: string;
}

interface RunningOffersCardProps {
  onClose: () => void;
}

const fontOptions = ["Arial","Verdana","Georgia","Courier New","Times New Roman","Trebuchet MS","Impact","Comic Sans MS","Lucida Console","Palatino","Garamond","Bookman","Candara","Tahoma","Helvetica","Franklin Gothic","Futura","Gill Sans","Century Gothic","Roboto"];

export const RunningOffersCard: React.FC<RunningOffersCardProps> = ({ onClose }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({ text:"", fontFamily:"Arial", color:"#000000", emoji:"", imageUrl:"" });
  const [offerType, setOfferType] = useState<"text"|"image"|"both">("text");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/offers");
      setOffers(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch offers");
    } finally { setLoading(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await axios.post("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/offers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewOffer(prev => ({ ...prev, imageUrl: res.data }));
    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Image upload failed: " + (err.response?.data || err.message));
    }
  };

  const handleSaveOffer = async () => {
    if ((offerType === "text" || offerType === "both") && !newOffer.text?.trim() && !newOffer.imageUrl) { alert("Enter text or image"); return; }
    try {
      if (editingId) {
        const res = await axios.put(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/offers/${editingId}`, newOffer);
        setOffers(prev => prev.map(o => o.id === editingId ? {...o, ...res.data} : o));
      } else {
        const res = await axios.post("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/offers", newOffer);
        setOffers(prev => [...prev, res.data]);
      }
      setNewOffer({ text:"", fontFamily:"Arial", color:"#000000", emoji:"", imageUrl:"" });
      setEditingId(null);
      setEmojiPickerOpen(false);
      setOfferType("text");
    } catch (err) { console.error(err); alert("Failed to save offer"); }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm("Delete this offer?")) return;
    try { await axios.delete(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/offers/${id}`); setOffers(prev => prev.filter(o=>o.id!==id)); }
    catch(err){ console.error(err); alert("Failed to delete offer"); }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingId(offer.id);
    setNewOffer({ ...offer });
    setOfferType(offer.text && offer.imageUrl ? "both" : offer.text ? "text" : "image");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <X size={20}/>
        </button>

        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Running Offers</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage offers visible to customers</p>

        <div className="space-y-2 mb-6 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-4 mb-2">
            <label className="text-sm font-medium">Offer Type:</label>
            <select value={offerType} onChange={(e)=>setOfferType(e.target.value as any)} className="border rounded px-3 py-2 text-sm">
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="both">Both</option>
            </select>
          </div>

          {(offerType==="text"||offerType==="both") && <>
            <input type="text" placeholder="Enter offer text..." value={newOffer.text} onChange={e=>setNewOffer(prev=>({...prev,text:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm"/>
            <select value={newOffer.fontFamily} onChange={e=>setNewOffer(prev=>({...prev,fontFamily:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm">
              {fontOptions.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
            </select>
            <div className="flex items-center gap-2"><label>Color:</label><input type="color" value={newOffer.color} onChange={e=>setNewOffer(prev=>({...prev,color:e.target.value}))} className="w-12 h-8"/></div>
            <div className="relative">
              <input type="text" placeholder="Add emoji 🙂" value={newOffer.emoji} onChange={e=>setNewOffer(prev=>({...prev,emoji:e.target.value}))} className="w-full border rounded px-3 py-2"/>
              <button onClick={()=>setEmojiPickerOpen(prev=>!prev)} className="absolute right-2 top-2">😊</button>
              {emojiPickerOpen && <div className="absolute z-50 mt-2"><Picker data={data} onEmojiSelect={emoji=>setNewOffer(prev=>({...prev,emoji:emoji.native}))}/></div>}
            </div>
          </>}

          {(offerType==="image"||offerType==="both") && <>
            <input type="url" placeholder="Image URL..." value={newOffer.imageUrl} onChange={e=>setNewOffer(prev=>({...prev,imageUrl:e.target.value}))} className="w-full border rounded px-3 py-2"/>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm"/>
          </>}

          {(newOffer.text||newOffer.imageUrl) && <div className="p-3 border rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800">
            {newOffer.imageUrl && <img src={newOffer.imageUrl} className="h-12 w-12 rounded object-cover"/>}
            {newOffer.text && <span style={{fontFamily:newOffer.fontFamily,color:newOffer.color}} className="text-lg">{newOffer.emoji} {newOffer.text}</span>}
          </div>}

          <Button onClick={handleSaveOffer} className="flex items-center justify-center space-x-1 w-full mt-2">
            <PlusCircle size={16}/> <span>{editingId?"Update":"Add"}</span>
          </Button>
        </div>

        {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : offers.length===0 ? <p>No offers</p> :
        <ul className="space-y-3">{offers.map(offer=>(
          <li key={offer.id} className="p-3 border rounded-lg flex flex-col gap-2 hover:shadow-lg bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">{offer.imageUrl && <img src={offer.imageUrl} className="h-12 w-12 rounded object-cover"/>}{offer.text && <span style={{fontFamily:offer.fontFamily,color:offer.color}}>{offer.emoji} {offer.text}</span>}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={()=>handleEditOffer(offer)}><Edit3 size={16}/> Edit</Button>
              <Button size="sm" variant="danger" onClick={()=>handleDeleteOffer(offer.id)}><Trash2 size={16}/> Delete</Button>
            </div>
          </li>
        ))}</ul>}
      </div>
    </div>
  );
};
