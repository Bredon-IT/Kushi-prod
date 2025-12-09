import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    X,
    Trash2,
    Calendar,
    Clock,
    User,
    Star,
    ClipboardList,
    IndianRupeeIcon,
    ChevronRight,
    MessageSquare,
    // CheckCircle, // Not used in the provided snippet
} from "lucide-react";
// Assuming Card and Button are imported from your custom UI library
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import Global_API_BASE from "../services/GlobalConstants";

// --- Interface Placeholder for Service ---
interface Service {
    serviceId: string; // Or whatever property you use for the URL path
    serviceName: string;
    // ...other service properties
}

// --- Interface (UPDATED) ---
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
    cancellation_reason?: string;
    services?: Service[] | string[];
}

//  ENHANCED Status Colors for vibrancy (ALREADY IMPLEMENTED)
const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-yellow-50", text: "text-amber-700", border: "border-amber-500" },
    completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-500" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-500" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-500" },
};

// StarRatingDisplay
const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`w-4 h-4 transition-colors ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
            />
        ))}
    </div>
);

// --- Helper Components: DetailItem is simplified for the new condensed layout ---
interface DetailItemProps {
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, children, className = "" }) => (
    <div className={`flex items-center space-x-1 text-sm text-gray-700 min-w-[70px] ${className}`}>
        <div className="flex-shrink-0 text-indigo-500/90">{icon}</div>
        <p className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">{children}</p>
    </div>
);

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all scale-100 opacity-100">
            <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                onClick={onClose}
                aria-label="Close modal"
            >
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-indigo-800 mb-5 border-b pb-2">{title}</h2>
            {children}
        </div>
    </div>
);

// ----------------------------------------------------------------------------------
// --- Main Component ---
// ----------------------------------------------------------------------------------
const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const userEmail = user?.email;
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");
    const [cancelReason, setCancelReason] = useState<string>("");

    // --- Fetch Orders ---
    useEffect(() => {
        if (!userEmail) return;
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    Global_API_BASE + `/api/auth/bookings/logged-in?email=${userEmail}`,
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
                    cancellation_reason: o.cancellation_reason || "",
                    services: o.services || [],
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

    // Handler for Card *body* click (navigates to service description/details)
    const handleServiceClick = (order: Order) => {
        if (order.services && order.services.length > 1) {
            // Navigate to a page that displays all services in the booking
            navigate("/booking-services", { state: { services: order.services, orderId: order.booking_id, categoryName: order.booking_service_name } });
        } else {
            // Navigate directly to service details
            const serviceIdentifier =
                order.services && order.services.length > 0
                    ? (typeof order.services[0] === 'string'
                        ? order.services[0]
                        : (order.services[0] as Service).serviceId || (order.services[0] as Service).serviceName
                    )
                    : order.booking_service_name;

            // Simple sanitation for URL path
            const safeIdentifier = serviceIdentifier.replace(/\s+/g, '-').toLowerCase();

            navigate(`/service-details/${safeIdentifier}`, {
                state: { openDirectly: true, services: [serviceIdentifier], categoryName: order.booking_service_name },
            });
        }
    };


    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);



    // Handler for the 'View' button click (navigates to the Order Details page)
    const handleOrderDetailsClick = (orderId: number) => {
        // Navigate to the new detailed order page
        navigate(`/order-details/${orderId}`);
    };

    const openRatingModal = (order: Order) => {
        setCurrentOrder(order);
        setRating(order.rating || 0);
        setFeedback(order.feedback || "");
        setShowRatingModal(true);
    };

    const openCancelModal = (order: Order) => {
        setCurrentOrder(order);
        setCancelReason(order.cancellation_reason || "");
        setShowCancelModal(true);
    };

    const submitRating = async () => {
        if (!currentOrder) return;
        try {
            await axios.put(
                Global_API_BASE + `/api/auth/bookings/${currentOrder.booking_id}/rating`,
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
            console.error("Failed to submit rating", err);
            alert("Failed to submit rating");
        }
    };

    const submitCancel = async () => {
        if (!currentOrder) return;
        if (!cancelReason.trim()) {
            alert("Please provide a reason for cancellation.");
            return;
        }
        try {
            await axios.put(
                Global_API_BASE + `/api/bookings/${currentOrder.booking_id}/status`,
                { status: "cancelled", canceledBy: "customer", cancellation_reason: cancelReason },
                { withCredentials: true }
            );
            setOrders((prev) =>
                prev.map((o) =>
                    o.booking_id === currentOrder.booking_id
                        ? { ...o, bookingStatus: "cancelled", canceledBy: "customer", cancellation_reason: cancelReason }
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
            <div className="p-12 text-center text-xl font-semibold text-indigo-600">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
                Fetching your service history...
            </div>
        );

    if (error)
        return (
            <div className="text-red-600 text-center p-6 bg-red-100 border border-red-400 rounded-xl max-w-lg mx-auto mt-10 shadow-lg">
                Error: {error}
            </div>
        );

    if (orders.length === 0)
        return (
            <div className="text-gray-500 text-center p-16 bg-white rounded-2xl shadow-xl max-w-xl mx-auto mt-10">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                <p className="text-2xl font-bold text-gray-800">No Bookings Yet! 🎉</p>
                <p className="text-md mt-2">Start by exploring our services and make your first booking.</p>
            </div>
        );

    // --- Main Render (Redesigned) ---
    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* VIBRANT PAGE HEADER */}
                <div className="bg-gradient-to-r from-peach-300 to-navy-700 p-6 rounded-2xl shadow-xl border-l-8 border-indigo-600/90 flex items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Your Service History </h1>



                    <p className="text-gray-500 text-sm ml-4 hidden sm:block">{orders.length} total services found.</p>
                </div>

                {/* ORDERS LIST - Single Card per Row */}
                <div className="space-y-4">
                    {orders
                        .filter((o) => o.bookingStatus)
                        .sort((a, b) => {
                            // Sort by newest first
                            const dateA = new Date(`${a.bookingDate}T${a.booking_time}`).getTime() || 0;
                            const dateB = new Date(`${b.bookingDate}T${b.booking_time}`).getTime() || 0;
                            return dateB - dateA;
                        })
                        .map((order) => {
                            const status = statusColors[order.bookingStatus.toLowerCase()] || statusColors.pending;
                            const isCompleted = order.bookingStatus.toLowerCase() === "completed";
                            const isCancelled = order.bookingStatus.toLowerCase() === "cancelled"; // <-- NEW constant
                            const isCancellable = ["pending", "confirmed"].includes(
                                order.bookingStatus.toLowerCase()
                            );

                            return (
                                <Card
                                    key={order.booking_id}
                                    className="p-0 shadow-lg border border-gray-200 bg-white hover:border-indigo-400 transition-all duration-300 overflow-hidden"
                                >
                                    {/* MAIN ROW: Service Name, Details, Amount, and Action Button */}
                                    <div
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer"
                                        onClick={() => handleServiceClick(order)} // Click the body navigates to Service Details
                                    >

                                        {/* 1. SERVICE NAME & STATUS (Left) */}
                                        <div className="flex-1 min-w-0 mb-3 sm:mb-0 sm:mr-4">
                                            <div className="flex items-center space-x-2">
                                                <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                    {order.booking_service_name}
                                                </h2>
                                                {/* STATUS PILL (Color based on statusColors) */}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.bg} ${status.text} border ${status.border}`}
                                                >
                                                    {order.bookingStatus}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Booking ID: <span className="font-mono">{order.booking_id}</span>
                                            </p>
                                        </div>

                                        {/* 2. DETAILS (Middle) */}
                                        <div className="flex flex-wrap items-center space-x-4 divide-x divide-gray-200 text-sm mb-3 sm:mb-0 sm:mr-4">
                                            <DetailItem icon={<Calendar className="w-4 h-4" />}>
                                                {new Date(order.bookingDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                            </DetailItem>
                                            <DetailItem icon={<Clock className="w-4 h-4" />} className="pl-4">
                                                {order.booking_time}
                                            </DetailItem>
                                            <DetailItem icon={<MapPin className="w-4 h-4" />} className="pl-4">
                                                {order.city}
                                            </DetailItem>
                                        </div>

                                        {/* 3. AMOUNT & ACTION BUTTONS (Right) */}
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            {/* Total Amount */}
                                            <div className="flex items-center space-x-1 flex-shrink-0">
                                                <IndianRupeeIcon className="w-4 h-4 text-green-600" />
                                                <span className="text-lg font-extrabold text-green-700">
                                                    {order.totalAmount}
                                                </span>
                                            </div>

                                            {/* ACTION BUTTONS (ALWAYS VISIBLE IN MAIN ROW FOR ALL SCREENS) */}
                                            <div className="flex items-center space-x-2">
                                                {/* Cancel Button - Displayed if cancellable */}
                                                {isCancellable && (
                                                    <Button
                                                        variant="danger-outline"
                                                        size="sm"
                                                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); openCancelModal(order); }}
                                                        className="text-red-600 border-red-300 hover:bg-red-50 font-semibold text-xs flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" /> Cancel
                                                    </Button>
                                                )}

                                                {/* View Details Button - MODIFIED CLICK HANDLER */}
                                                {/* View Details Button - MODIFIED CLICK HANDLER */}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
                                                    // *** MODIFIED CLICK HANDLER ***
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        handleOrderDetailsClick(order.booking_id); // Navigate to new Order Details page
                                                    }}
                                                >
                                                    View <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FOOTER ROW: Worker/Rating/Action Buttons/Cancellation Info */}
                                    <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-200 flex flex-wrap justify-between items-center gap-2">

                                        {/* Worker & Rating Status */}
                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                                            {order.worker_assign && order.worker_assign.length > 0 && (
                                                <div className="flex items-center text-gray-600">
                                                    <User className="w-4 h-4 mr-1 text-indigo-500" />
                                                    <span className="font-medium truncate max-w-[150px]">
                                                        {Array.isArray(order.worker_assign) ? order.worker_assign.join(", ") : order.worker_assign}
                                                    </span>
                                                </div>
                                            )}

                                            {isCompleted && order.rating && (
                                                <div className="flex items-center text-gray-600">
                                                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-bold text-yellow-600">{order.rating} / 5</span>
                                                </div>
                                            )}

                                            {/*  NEW: Cancellation Details for cancelled orders */}
                                            {isCancelled && (
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center text-red-700 font-semibold">
                                                    <div className="flex items-center">
                                                        <X className="w-4 h-4 mr-1" />
                                                        Canceled by: <span className="ml-1 font-bold capitalize">{order.canceledBy || 'N/A'}</span>
                                                    </div>
                                                    {order.cancellation_reason && (
                                                        <p className="sm:ml-4 mt-1 sm:mt-0 text-xs font-normal text-red-600 italic line-clamp-1">
                                                            Reason: {order.cancellation_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {/*  END NEW */}
                                        </div>

                                        {/* Rating/Feedback Buttons (Only in footer) */}
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {isCompleted && !order.rating && (
                                                <Button
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); openRatingModal(order); }}
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                                                >
                                                    <Star className="w-3 h-3 mr-1" /> Rate Service
                                                </Button>
                                            )}
                                            {isCompleted && order.rating && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); openRatingModal(order); }}
                                                    className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 font-semibold text-xs"
                                                >
                                                    <MessageSquare className="w-3 h-3 mr-1" /> View Feedback
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                </Card>
                            );
                        })}
                </div>

                {/* --- Modals --- */}
                {showRatingModal && currentOrder && (
                    <Modal
                        title={`Rate ${currentOrder.booking_service_name}`}
                        onClose={() => setShowRatingModal(false)}
                    >
                        {/* Rating Modal Content */}
                        <div className="space-y-4">
                            <p className="text-gray-600">Please rate your experience with this service.</p>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-700">Rating:</span>
                                <StarRatingDisplay rating={rating} />
                                <span className="text-xl font-bold text-yellow-600">{rating} / 5</span>
                            </div>
                            {/* Simple rating input placeholder */}
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="1"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                            />
                            {/* Feedback textarea placeholder */}
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Share your feedback (optional)..."
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <Button onClick={submitRating} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Submit Rating
                            </Button>
                        </div>
                    </Modal>
                )}

                {showCancelModal && currentOrder && (
                    <Modal title="Confirm Cancellation" onClose={() => setShowCancelModal(false)}>
                        {/* Cancel Modal Content */}
                        <div className="space-y-4">
                            <p className="text-red-700 font-medium">
                                Are you sure you want to cancel the booking for {currentOrder.booking_service_name} on {new Date(currentOrder.bookingDate).toLocaleDateString()} at {currentOrder.booking_time}?
                            </p>
                            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700">Reason for Cancellation (Required)</label>
                            {/* Cancellation reason textarea placeholder */}
                            <textarea
                                id="cancel-reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Enter reason for cancellation..."
                                rows={3}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                            />
                            <Button onClick={submitCancel} variant="danger" className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50" disabled={!cancelReason.trim()}>
                                Yes, Cancel Booking
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;