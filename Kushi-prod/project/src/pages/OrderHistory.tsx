import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  MapPin,
  X,
  Trash2,
  Calendar,
  Clock,
  Tag,
  DollarSign,
  User,
  Star,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

// --- Interface ---
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
  pending: "bg-yellow-50 text-yellow-600 border border-yellow-300",
  completed: "bg-indigo-50 text-indigo-600 border border-indigo-300",
  confirmed: "bg-green-50 text-green-600 border border-green-300",
  cancelled: "bg-red-50 text-red-600 border border-red-300",
};

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center space-x-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

// --- Main Component ---
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

  // --- Fetch Orders ---
  useEffect(() => {
    if (!userEmail) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/auth/bookings/logged-in?email=${userEmail}`,
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

  // --- Handlers ---
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
     await axios.put(
  `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/auth/bookings/${currentOrder.booking_id}/rating`,
  { rating, feedback }, // ✅ sends both fields
  { withCredentials: true }
);


      setOrders((prev) =>
        prev.map((o) =>
          o.booking_id === currentOrder.booking_id ? { ...o, rating, feedback } : o
        )
      );
      setShowRatingModal(false);
    } catch (err) {
      console.error("Failed to submit rating", err);
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

  // --- Conditional UI ---
  if (loading)
    return (
      <div className="p-6 text-center text-xl font-semibold text-indigo-600">
        Loading your service history...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center p-6 bg-red-100 border border-red-400 rounded-lg max-w-lg mx-auto">
        {error}
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-gray-500 text-center p-12">
        <Tag className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
        <p className="text-lg">Looks like you haven't placed any bookings yet!</p>
        <p className="text-sm">Start by exploring our services.</p>
      </div>
    );

  // --- Main Render ---
  return (
    <div className="bg-gray-50 min-h-screen py-10 md:py-16">
      <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="text-4xl font-extrabold text-gray-900 border-b-4 border-indigo-400 inline-block pb-1">
          Your Booking History
        </h1>

        <div className="grid gap-6">
          {orders
            .filter((o) => o.bookingStatus) // ✅ ensures cancelled bookings also appear
            .sort((a, b) => {
              const dateA = new Date(`${a.bookingDate}T${a.booking_time}`).getTime() || 0;
              const dateB = new Date(`${b.bookingDate}T${b.booking_time}`).getTime() || 0;
              return dateB - dateA;
            })
            .map((order) => {
              const statusClass = statusColors[order.bookingStatus.toLowerCase()];
              const isCompleted = order.bookingStatus.toLowerCase() === "completed";
              const isCancellable = ["pending", "confirmed"].includes(
                order.bookingStatus.toLowerCase()
              );

              return (
                <Card
                  key={order.booking_id}
                  className="p-6 md:p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-indigo-700">
                        {order.booking_service_name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Booking ID: <span className="font-mono">{order.booking_id}</span>
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass}`}
                    >
                      {order.bookingStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700">
                    <DetailItem icon={<Calendar className="w-4 h-4 text-indigo-500" />} label="Date">
                      {new Date(order.bookingDate).toLocaleDateString()}
                    </DetailItem>
                    <DetailItem icon={<Clock className="w-4 h-4 text-indigo-500" />} label="Time">
                      {order.booking_time}
                    </DetailItem>
                    <DetailItem icon={<DollarSign className="w-4 h-4 text-indigo-500" />} label="Total">
                      <span className="font-bold text-lg text-green-600">
                        ₹{order.totalAmount}
                      </span>
                    </DetailItem>
                    <DetailItem icon={<MapPin className="w-4 h-4 text-indigo-500" />} label="Address">
                      {order.address_line_1}, {order.city}
                    </DetailItem>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    {order.worker_assign && order.worker_assign.length > 0 && (
                      <DetailItem
                        icon={<User className="w-4 h-4 text-gray-500" />}
                        label="Worker(s)"
                      >
                        {Array.isArray(order.worker_assign)
                          ? order.worker_assign.join(", ")
                          : order.worker_assign}
                      </DetailItem>
                    )}

                    {order.rating ? (
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-semibold text-gray-800 mr-2">Your Rating:</span>
                        <StarRatingDisplay rating={order.rating} />
                        {order.feedback && (
                          <span className="text-sm text-gray-600 ml-4 italic mt-1 sm:mt-0">
                            "{order.feedback}"
                          </span>
                        )}
                      </div>
                    ) : order.bookingStatus.toLowerCase() === "cancelled" && (
                      <p className="text-red-600 font-semibold mt-3">
                        This booking was cancelled by{" "}
                        {order.canceledBy === "customer" ? "you" : "the admin"}.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    {isCompleted && !order.rating && (
                      <Button
                        onClick={() => openRatingModal(order)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Star className="w-4 h-4 mr-1" /> Give Feedback & Rate
                      </Button>
                    )}
                    {isCancellable && (
                      <Button variant="outline-danger" onClick={() => openCancelModal(order)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Cancel Booking
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>

        {/* --- Rating Modal --- */}
        {showRatingModal && currentOrder && (
          <Modal
            title={`Rate ${currentOrder.booking_service_name}`}
            onClose={() => setShowRatingModal(false)}
          >
            <div className="mb-6">
              <label className="font-semibold text-gray-700 mb-1 block">
                Your Rating (1-5 Stars):
              </label>
              <div className="flex mt-1 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer text-3xl transition-colors ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="font-semibold text-gray-700 mb-1 block">Feedback:</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts on the service..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowRatingModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitRating}
                disabled={rating === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Submit
              </Button>
            </div>
          </Modal>
        )}

        {/* --- Cancel Modal --- */}
        {showCancelModal && currentOrder && (
          <Modal title="Confirm Cancellation" onClose={() => setShowCancelModal(false)}>
            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel your booking for{" "}
              <span className="font-bold text-indigo-700">
                {currentOrder.booking_service_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Go Back
              </Button>
              <Button variant="danger" onClick={submitCancel}>
                <Trash2 className="w-4 h-4 mr-2" /> Confirm Cancel
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

// --- Helper Components ---
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, children }) => (
  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
    {icon}
    <div>
      <p className="text-xs font-medium uppercase text-gray-500 leading-none">
        {label}
      </p>
      <p className="text-base font-medium text-gray-900 leading-snug">{children}</p>
    </div>
  </div>
);

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all scale-100 opacity-100">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        onClick={onClose}
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>
      <h2 className="text-2xl font-bold text-indigo-800 mb-5 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  </div>
);
