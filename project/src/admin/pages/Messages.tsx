import React, { useEffect, useState } from "react";
import axios from "axios";
import Global_API_BASE from "../services/GlobalConstants";
import {
  Mail,
  Phone,
  MapPin,
  User,
  ClipboardList,
  Search,
  Calendar,
  Check,
  MessageCircle
} from "lucide-react";

const Messages: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "read" | "unread">("all");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const fetchAll = async () => {
    try {
      const res = await axios.get(Global_API_BASE + "/api/contact/all");
      setRequests(sortByDateDesc(res.data || []));
    } catch (e) {
      console.error("Fetch all failed", e);
    }
  };

  const fetchRead = async () => {
    try {
      const res = await axios.get(Global_API_BASE + "/api/contact/read");
      setRequests(sortByDateDesc(res.data || []));
    } catch (e) {}
  };

  const fetchUnread = async () => {
    try {
      const res = await axios.get(Global_API_BASE + "/api/contact/unread");
      setRequests(sortByDateDesc(res.data || []));
    } catch (e) {}
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toTimestamp = (dateValue: any) => {
    try {
      if (!dateValue) return 0;

      if (typeof dateValue === "string") {
        const clean = dateValue.split(".")[0];
        const dt = new Date(clean);
        return dt.getTime();
      }

      if (typeof dateValue === "object") {
        const dt = new Date(
          dateValue.year,
          dateValue.month - 1,
          dateValue.day,
          dateValue.hour,
          dateValue.minute,
          dateValue.second
        );
        return dt.getTime();
      }
    } catch {}
    return 0;
  };

  const formatDate = (val: any) => {
    const ts = toTimestamp(val);
    if (!ts) return "Invalid date";
    return new Date(ts).toLocaleString();
  };

  const sortByDateDesc = (arr: any[]) =>
    arr
      .slice()
      .sort(
        (a, b) => toTimestamp(b.submittedAt) - toTimestamp(a.submittedAt)
      );

  const markAsRead = async (id: number) => {
    try {
      await axios.put(Global_API_BASE + `/api/contact/mark-read/${id}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isRead: true } : r))
      );
      if (selectedRequest) {
        setSelectedRequest((prev: any) => ({ ...prev, isRead: true }));
      }
    } catch (e) {}
  };

  const changeTab = (tab: "all" | "read" | "unread") => {
    setActiveTab(tab);
    if (tab === "all") fetchAll();
    if (tab === "read") fetchRead();
    if (tab === "unread") fetchUnread();
  };

  const filteredRequests = requests.filter((r) => {
    const s = search.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.phone.includes(s);

    if (!matchesSearch) return false;

    if (selectedDate) {
      const dt = new Date(toTimestamp(r.submittedAt));
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      if (`${y}-${m}-${d}` !== selectedDate) return false;
    }

    return true;
  });

  const isRead = (r: any) => r.isRead === true || r.read === true;

  // 👉 WhatsApp Redirect
  const openWhatsApp = (req: any) => {
    let phone = req.phone || "";
    phone = phone.replace(/\D/g, ""); // remove non-numbers
    if (phone.length === 10) {
      phone = "91" + phone; // auto-add India code
    }

    const message = `Hello ${req.name}, regarding your service request for ${req.serviceCategory}.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  /* ------------------------------------------------------
     ⭐ MOBILE SCROLL WRAPPER ADDED BELOW
     ------------------------------------------------------ */
  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">

      {/* Force minimum width for mobile scroll */}
      <div className="min-w-[950px]">

        {/* ORIGINAL CONTENT – UNTOUCHED */}
        <div className="p-6">

          <h2 className="text-4xl font-bold text-center mb-6 text-navy-800">
            Customer Service
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

            <div className="relative w-full md:w-1/3">
              <Search
                className="absolute left-3 top-2.5 text-gray-500"
                size={18}
              />
              <input
                className="w-full pl-10 p-2 border rounded-lg shadow-sm"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">

              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-navy-700" />
                <input
                  type="date"
                  className="border p-2 rounded-lg shadow-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                  <button
                    className="px-3 py-1 text-sm bg-gray-200 rounded"
                    onClick={() => setSelectedDate("")}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {(["all", "read", "unread"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => changeTab(t)}
                    className={`px-4 py-2 rounded-lg capitalize font-medium ${
                      activeTab === t
                        ? "bg-navy-700 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                No messages found.
              </p>
            )}

            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-lg border shadow-sm bg-white hover:shadow-md transition cursor-default"
              >
                <div className="grid grid-cols-5 items-center text-sm font-medium gap-2">

                  <span
                    className="text-navy-700 font-semibold cursor-pointer underline"
                    onClick={() => setSelectedRequest(req)}
                  >
                    {req.name}
                  </span>

                  <span>{req.phone}</span>
                  <span>{req.email}</span>
                  <span>{req.location}</span>

                  <span className="text-gray-600 text-xs">
                    {formatDate(req.submittedAt)}
                  </span>
                </div>

                <div className="mt-1">
                  {isRead(req) ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                      Read
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                      Unread
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* MODAL */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl relative">

                <button
                  className="absolute right-4 top-3 text-gray-600 text-xl"
                  onClick={() => setSelectedRequest(null)}
                >
                  ×
                </button>

                <h3 className="text-2xl font-bold mb-4 text-navy-800">
                  Customer Details
                </h3>

                <div className="space-y-2 text-gray-800 text-sm">
                  <p><strong>Name:</strong> {selectedRequest.name}</p>
                  <p><strong>Email:</strong> {selectedRequest.email}</p>
                  <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                  <p><strong>Location:</strong> {selectedRequest.location}</p>
                  <p><strong>Service:</strong> {selectedRequest.serviceCategory}</p>
                  <p><strong>Subcategory:</strong> {selectedRequest.subcategory || "—"}</p>
                  <p><strong>Message:</strong> {selectedRequest.message}</p>
                  <p><strong>Submitted At:</strong> {formatDate(selectedRequest.submittedAt)}</p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {isRead(selectedRequest) ? (
                      <span className="text-green-700 font-semibold">
                        Read
                      </span>
                    ) : (
                      <span className="text-red-700 font-semibold">
                        Unread
                      </span>
                    )}
                  </p>
                </div>

                {/* MARK READ */}
                {!isRead(selectedRequest) && (
                  <button
                    onClick={() => markAsRead(selectedRequest.id)}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Mark as Read
                  </button>
                )}

                {/* WHATSAPP */}
                <button
                  onClick={() => openWhatsApp(selectedRequest)}
                  className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  WhatsApp Customer
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Messages;
