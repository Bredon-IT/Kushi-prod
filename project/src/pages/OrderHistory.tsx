import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { MapPin, X, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

interface Order {
  booking_id: number;
  booking_service_name: string;
  bookingDate: string;
  booking_time: string;
  totalAmount: number;
  discount?: number;
  bookingStatus: string;
  city: string;
  address_line_1: string;
  worker_assign?: string[] | string;
  rating?: number;
  feedback?: string;
  canceledBy?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const userEmail = user?.email;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    if (!userEmail) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/auth/orders/logged-in/${userEmail}`,
          { withCredentials: true }
        );
        const normalized = response.data.map((o: any) => ({
          ...o,
          worker_assign: Array.isArray(o.worker_assign)
            ? o.worker_assign
            : o.worker_assign
            ? [o.worker_assign]
            : [],
          canceledBy: o.canceledBy || "",
        }));
        setOrders(normalized);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail]);

  const openRatingModal = (order: Order) => {
    setCurrentOrder(order);
    setRating(order.rating || 0);
    setFeedback(order.feedback || "");
    setShowRatingModal(true);
  };

  const openCancelModal = (order: Order) => {
    setCurrentOrder(order);
    setShowCancelModal(true);
  };

  const submitRating = async () => {
    if (!currentOrder) return;
    try {
      await axios.post(
        `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/auth/orders/rate/${currentOrder.booking_id}`,
        { rating, feedback },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.booking_id === currentOrder.booking_id ? { ...o, rating, feedback } : o
        )
      );
      setShowRatingModal(false);
    } catch (err) {
      console.error("Failed to submit rating");
      alert("Failed to submit rating");
    }
  };

  const submitCancel = async () => {
    if (!currentOrder) return;
    try {
      await axios.put(
        `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/bookings/${currentOrder.booking_id}/status`,
        { status: "cancelled", canceledBy: "customer" },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.booking_id === currentOrder.booking_id
            ? { ...o, bookingStatus: "cancelled", canceledBy: "customer" }
            : o
        )
      );
      setShowCancelModal(false);
    } catch (err) {
      console.error("Failed to cancel booking");
      alert("Failed to cancel booking");
    }
  };

  if (loading)
    return <div className="p-6 text-center text-lg font-semibold">Loading bookings...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (orders.length === 0)
    return <div className="text-gray-500 text-center p-6">No bookings found.</div>;

  return (
    <div className="bg-pink-50 min-h-screen py-28">
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Bookings</h1>
      <div className="grid gap-6">
        {orders
          .sort(
            (a, b) =>
              new Date(`${b.bookingDate}T${b.booking_time}`).getTime() -
              new Date(`${a.bookingDate}T${a.booking_time}`).getTime()
          )
          .map((order) => (
            <Card
              key={order.booking_id}
              className="p-6 hover:shadow-lg transition-shadow relative"
            >
              <div className="flex justify-between items-start flex-wrap md:flex-nowrap gap-4">
                {/* Left Section */}
                <div className="flex flex-col gap-2 md:w-1/2">
                  <h2 className="text-xl font-bold text-gray-900">{order.booking_service_name}</h2>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(order.bookingDate).toLocaleDateString()}{" "}
                    <span className="ml-4 font-semibold">Time:</span> {order.booking_time}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {order.bookingStatus.toLowerCase() === "completed" && !order.rating && (
                      <Button onClick={() => openRatingModal(order)}>Rate Service</Button>
                    )}
                    {["pending", "confirmed"].includes(order.bookingStatus.toLowerCase()) && (
                      <Button variant="danger" onClick={() => openCancelModal(order)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col gap-2 md:w-1/2">
                  <p className="text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {order.address_line_1}, {order.city}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <span className="font-semibold">Total Amount:</span> ₹{order.totalAmount}
                  </p>
                  {order.worker_assign && order.worker_assign.length > 0 && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-semibold">Assigned Worker(s):</span>{" "}
                      {Array.isArray(order.worker_assign)
                        ? order.worker_assign.join(", ")
                        : order.worker_assign}
                    </p>
                  )}
                  {order.rating && (
                    <p className="text-gray-700 mt-1">
                      Rating: {order.rating} ⭐ {order.feedback && `- ${order.feedback}`}
                    </p>
                  )}
                  {order.bookingStatus.toLowerCase() === "cancelled" && order.canceledBy && (
                    <p className="text-red-600 font-semibold mt-1">
                      Cancelled by {order.canceledBy === "admin" ? "Admin" : "me"}
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Status Badge */}
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[order.bookingStatus.toLowerCase()]
                }`}
              >
                {order.bookingStatus}
              </span>
            </Card>
          ))}
      </div>

      {/* Rating Modal */}
      {showRatingModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-600"
              onClick={() => setShowRatingModal(false)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Rate {currentOrder.booking_service_name}</h2>
            <div className="mb-4">
              <label className="font-semibold">Rating:</label>
              <div className="flex mt-1 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer text-2xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="font-semibold">Feedback:</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mt-1"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback..."
              />
            </div>
            <Button onClick={submitRating}>Submit</Button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-600"
              onClick={() => setShowCancelModal(false)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Cancel {currentOrder.booking_service_name}</h2>
            <p className="text-gray-700 mb-4">Are you sure you want to cancel this booking?</p>
            <Button variant="danger" onClick={submitCancel}>
              Confirm Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default OrderHistory;
