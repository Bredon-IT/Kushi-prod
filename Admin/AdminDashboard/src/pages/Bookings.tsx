import React, { useState, useEffect } from "react";
import axios from "axios";
import BookingsAPIService from "../services/BookingAPIService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Edit, Trash2, Search, Mail, User, IndianRupee } from "lucide-react";

export function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [workerInputs, setWorkerInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    BookingsAPIService.getAllBookings()
      .then((res) => {
        const normalized = res.data.map((b: any) => ({
          booking_id: b.booking_id,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_number: b.customer_number,
          booking_service_name: b.booking_service_name,
          booking_amount: b.booking_amount,
          grand_total: b.grand_total,
          booking_date: b.booking_date || b.bookingDate,
          booking_time: b.booking_time,
          bookingStatus: b.bookingStatus || b.booking_status,
          address: b.address,
          city: b.city,
          pincode: b.pincode || "",
          duration: b.duration || "60",
          worker_assign: b.worker_assign || [],
        }));
        setBookings(normalized);
      })
      .finally(() => setLoading(false));
  };

  const assignWorker = async (bookingId: number) => {
    const workerName = workerInputs[bookingId];
    if (!workerName) return alert("Enter worker name first!");
    try {
      await axios.put(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/admin/${bookingId}/assign-worker`, {
        workername: workerName,
      });
      alert("✅ Worker assigned!");
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId
            ? { ...b, worker_assign: [...b.worker_assign, workerName] }
            : b
        )
      );
      setWorkerInputs((prev) => ({ ...prev, [bookingId]: "" }));
    } catch {
      alert("❌ Failed to assign worker");
    }
  };

  const updateStatus = async (booking: any, status: string) => {
    const original = booking.bookingStatus;
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === booking.booking_id ? { ...b, bookingStatus: status } : b
      )
    );
    try {
      await BookingsAPIService.updateBookingStatus(booking.booking_id, status);
      alert(`✅ Booking ${status}`);
    } catch {
      alert("❌ Failed to update");
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === booking.booking_id ? { ...b, bookingStatus: original } : b
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await BookingsAPIService.deleteBooking(id);
      alert("✅ Deleted");
      fetchBookings();
    } catch {
      alert("❌ Failed to delete");
    }
  };

  const filtered = bookings
    .filter((b) => (filter === "all" ? true : b.bookingStatus?.toLowerCase() === filter))
    .filter((b) => {
      const term = searchTerm.toLowerCase();
      return (
        b.customer_name?.toLowerCase().includes(term) ||
        b.booking_service_name?.toLowerCase().includes(term) ||
        b.customer_number?.toLowerCase().includes(term)
      );
    });

  if (loading) return <div className="text-center p-6 text-gray-700">Loading...</div>;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 text-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold drop-shadow-lg">Booking Dashboard</h1>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="flex items-center w-full sm:w-1/2 relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filtered.map((b) => (
          <Card
            key={b.booking_id}
            className="p-4 rounded-2xl shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-all"
          >
            {/* Row 1: Main info with headings */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm items-start">
              <div>
                <div className="text-gray-500 text-xs">Name</div>
                <div className="font-semibold">{b.customer_name}</div>
                <div className="text-gray-500 text-xs mt-1 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {b.customer_email}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3"/> {b.customer_number}</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Service</div>
                <div className="font-semibold">{b.booking_service_name}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Amount</div>
                <div className="font-semibold flex items-center gap-1 text-green-600">
                  <IndianRupee className="w-4 h-4"/> {b.grand_total || b.booking_amount}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Location</div>
                <div className="font-semibold">{b.address}, {b.city} {b.pincode}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Date & Time</div>
                <div className="font-semibold">{new Date(b.booking_date).toLocaleDateString()} {b.booking_time}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Duration</div>
                <div className="font-semibold">{b.duration} mins</div>
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

     {/* Row 2: Booking Status + Action Buttons + Worker Assign */}
<div className="flex flex-wrap md:flex-nowrap justify-start items-center gap-4">
  {/* Booking Status + Action Buttons */}
  <div className="flex items-center gap-2 flex-wrap">
    <span
      className={`px-2 py-1 rounded font-medium w-fit ${
        b.bookingStatus === "completed"
          ? "bg-blue-100 text-blue-700"
          : b.bookingStatus === "confirmed"
          ? "bg-green-100 text-green-700"
          : b.bookingStatus === "cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {b.bookingStatus}
    </span>

    <Button
      size="sm"
      className="bg-green-500/20 hover:bg-green-500/40"
      onClick={() => updateStatus(b, "confirmed")}
    >
      Confirmed
    </Button>
    <Button
      size="sm"
      className="bg-blue-500/20 hover:bg-blue-500/40"
      onClick={() => updateStatus(b, "completed")}
    >
      Completed
    </Button>
    <Button
      size="sm"
      className="bg-red-500/20 hover:bg-red-500/40"
      onClick={() => updateStatus(b, "cancelled")}
    >
      Declined
    </Button>
  </div>

  {/* Worker Assign Input + Assign Button */}
  <div className="flex items-center gap-2 flex-wrap ml-4">
    <input
      type="text"
      placeholder="Worker name"
      value={workerInputs[b.booking_id] ?? ""}
      onChange={(e) =>
        setWorkerInputs((p) => ({ ...p, [b.booking_id]: e.target.value }))
      }
      className="border border-gray-300 bg-transparent text-gray-900 px-2 py-1 rounded"
    />
    <Button
      size="sm"
      className="bg-purple-500/30 hover:bg-purple-500/50"
      onClick={() => assignWorker(b.booking_id)}
    >
      Assign
    </Button>
  </div>

  {/* Assigned Workers Text */}
  {b.worker_assign?.length > 0 && (
    <div className="text-xs text-gray-600 ml-2">
      👷 {b.worker_assign.join(", ")}
    </div>
  )}

 {/* Edit / Delete Buttons */}
<div className="flex items-center gap-2 ml-4 flex-wrap">
  <Button
    size="sm"
    className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900"
  >
    Edit
  </Button>
  <Button
    size="sm"
    className="bg-red-500 hover:bg-red-600 text-white"
    onClick={() => handleDelete(b.booking_id)}
  >
    Delete
  </Button>
</div>

</div>


          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="p-10 text-center text-gray-500 bg-white border border-gray-200">
            No bookings found.
          </Card>
        )}
      </div>
    </div>
  );
}
