import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
    MapPin, Calendar, Clock, User, Star, IndianRupeeIcon, ClipboardList, X, MessageSquare 
} from "lucide-react";
import Global_API_BASE from "../services/GlobalConstants";

// Assuming these are your components/types
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext"; 

// --- UPDATED INTERFACE ---
// The Order interface is updated to match all relevant fields from the Java Customer entity.
interface Order {
    booking_id: number;
    
    // Core Service Details
    booking_service_name: string;
    bookingDate: string;
    booking_time: string;
    bookingStatus: string;
    
    // Financial Details
    booking_amount?: number; // Base amount before discount
    totalAmount: number;     // totalAmount (from @Column(name="total_amount")
    discount?: number;
    grand_total?: number;    // Final amount after discount
    
    // Payment Details (NEWLY ADDED)
    payment_method?: string;
    payment_status?: string; // e.g., "Paid", "Pending", "Refunded"
    reference_details?: string;
    
    // Location & Logistics
    city: string;
    address_line_1: string;
    address_line_2?: string;
    address_line_3?: string;
    zip_code?: string; // NEWLY ADDED
    worker_assign?: string[] | string;
    
    // Review & Cancellation
    rating?: number;
    feedback?: string;
    canceledBy?: string;
    cancellation_reason?: string;
    
    // Meta Data
    created_date?: string; 
    remarks?: string;
    
    // Related Entities 
    services?: any[] | string[];
}
// --- END OF UPDATED INTERFACE ---

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-yellow-50", text: "text-amber-700", border: "border-amber-500" },
    completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-500" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-500" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-500" },
};

// Simplified DetailItem for this page
const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-2 text-gray-700">
        <div className="flex-shrink-0 text-indigo-500/90 mt-1">{icon}</div>
        <div>
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="text-base font-medium text-gray-900 break-words">{value}</p>
        </div>
    </div>
);

// StarRatingDisplay Component (copied from OrderHistory for self-containment)
const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`w-4 h-4 transition-colors ${
                    star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                }`}
            />
        ))}
    </div>
);


const OrderDetailPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const { user } = useAuth();
    const userEmail = user?.email;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userEmail || !bookingId) return;

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    Global_API_BASE + `/api/bookings/${bookingId}`, 
                    { withCredentials: true }
                );
                
                // Normalization similar to OrderHistory, assuming single order is returned
                const o = response.data;
                const normalized = {
                    ...o,
                    worker_assign: Array.isArray(o.worker_assign) ? o.worker_assign : (o.worker_assign ? [o.worker_assign] : []),
                    canceledBy: o.canceledBy || "",
                    cancellation_reason: o.cancellation_reason || "",
                    services: o.services || [],
                    // Ensure number fields are numbers, or default to 0 for calculations if null
                    totalAmount: o.totalAmount ?? 0,
                    discount: o.discount ?? 0,
                    grand_total: o.grand_total ?? (o.totalAmount - (o.discount ?? 0)),
                };

                setOrder(normalized);
            } catch (err) {
                console.error("Failed to fetch order details", err);
                setError("Failed to load booking details. Please check the ID or network.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [bookingId, userEmail]);

    if (loading) return (
        <div className="p-12 text-center text-xl font-semibold text-indigo-600">Loading Order Details...</div>
    );

    if (error) return (
        <div className="text-red-600 text-center p-6 bg-red-100 border border-red-400 rounded-xl max-w-lg mx-auto mt-10 shadow-lg">Error: {error}</div>
    );

    if (!order) return (
        <div className="text-gray-500 text-center p-16">Booking not found.</div>
    );

    const status = statusColors[order.bookingStatus.toLowerCase()] || statusColors.pending;
    const isCompleted = order.bookingStatus.toLowerCase() === "completed";
    const isCancelled = order.bookingStatus.toLowerCase() === "cancelled";
    const workerNames = Array.isArray(order.worker_assign) ? order.worker_assign.join(", ") : order.worker_assign;
    
    // Calculate final amount as a fallback if grand_total is missing
    const finalAmount = order.grand_total ?? (order.totalAmount - (order.discount || 0));

    return (
        <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-10xl mx-auto space-y-6">

                {/* HEADER & STATUS */}
                <Card className=" bg-gradient-to-r from-peach-300 to-navy-700 p-6 shadow-xl border-l-8 border-indigo-600/90">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{order.booking_service_name}</h1>
                            <p className="text-sm text-gray-500">Booking ID: <span className="font-mono font-bold">{order.booking_id}</span></p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${status.bg} ${status.text} border ${status.border} shadow-md`}
                        >
                            {order.bookingStatus}
                        </span>
                    </div>
                </Card>
                
                {/* --- SECTIONS --- */}
                
                {/* 1. BOOKING & LOCATION DETAILS */}
                <Card className="p-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-bold text-indigo-700">Service Schedule & Location</h2>
                    <hr className="my-2"/>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <DetailItem icon={<Calendar className="w-5 h-5" />} label="Date" value={new Date(order.bookingDate).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                        <DetailItem icon={<Clock className="w-5 h-5" />} label="Time" value={order.booking_time} />
                        <DetailItem icon={<MapPin className="w-5 h-5" />} label="City" value={order.city} />
                        <DetailItem icon={<User className="w-5 h-5" />} label="Service Provider" value={workerNames || "Not Assigned Yet"} />
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Full Address</p>
                        <p className="text-base font-medium text-gray-900">
                            {order.address_line_1}
                            {order.address_line_2 && `, ${order.address_line_2}`}
                            {order.address_line_3 && `, ${order.address_line_3}`}
                            , {order.city}
                            {order.zip_code && ` - ${order.zip_code}`}
                        </p>
                    </div>
                </Card>

                {/* 2. PRICE DETAILS - UPDATED */}
                <Card className="p-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-bold text-indigo-700">Payment Summary</h2>
                    <hr className="my-2"/>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Service Total:</span>
                            <span><IndianRupeeIcon className="w-4 h-4 inline-block -mt-0.5" /> {order.totalAmount.toFixed(2)}</span>
                        </div>
                        {order.discount !== undefined && order.discount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium border-t border-dashed pt-2">
                                <span>Discount Applied:</span>
                                <span>- <IndianRupeeIcon className="w-4 h-4 inline-block -mt-0.5" /> {order.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-green-700 border-t-2 border-green-300 pt-3">
                            <span>Final Amount:</span>
                            {/* Using grand_total from the backend or fallback calculation */}
                            <span><IndianRupeeIcon className="w-5 h-5 inline-block -mt-1" /> {finalAmount.toFixed(2)}</span>
                        </div>
                        
                        {/* NEW PAYMENT STATUS & METHOD FIELDS */}
                        <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-gray-100">
                            <span className="text-gray-600 font-medium">Payment Status:</span>
                            <span className={`font-bold capitalize ${order.payment_status?.toLowerCase() === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                {order.payment_status || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Payment Method:</span>
                            <span className="capitalize">{order.payment_method || 'N/A'}</span>
                        </div>
                        {(order.payment_status?.toLowerCase() === 'paid' && order.reference_details) && (
                             <div className="flex justify-between text-xs text-gray-500">
                                <span>Ref. Details:</span>
                                <span>{order.reference_details}</span>
                            </div>
                        )}
                        
                    </div>
                </Card>

                {/* 3. REVIEW SECTION (If Completed) */}
                {isCompleted && (
                    <Card className="p-6 shadow-xl space-y-4">
                        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
                            <Star className="w-6 h-6 mr-2 text-yellow-500" />
                            Your Review & Feedback
                        </h2>
                        <hr className="my-2"/>
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-700">Rating:</span>
                            {order.rating ? (
                                <StarRatingDisplay rating={order.rating} />
                            ) : (
                                <span className="text-red-500 font-medium">Not Rated Yet</span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-700 flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" /> Feedback:
                            </p>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 italic">
                                {order.feedback || (order.rating ? "No written feedback provided." : "No review submitted.")}
                            </div>
                        </div>
                    </Card>
                )}

                {/* 4. CANCELLATION DETAILS (If Cancelled) */}
                {isCancelled && (
                    <Card className="p-6 shadow-xl space-y-4 bg-red-50 border-red-300">
                        <h2 className="text-xl font-bold text-red-700 flex items-center">
                            <X className="w-6 h-6 mr-2" />
                            Cancellation Information
                        </h2>
                        <hr className="border-red-300 my-2"/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem icon={<User className="w-5 h-5" />} label="Canceled By" value={<span className="capitalize">{order.canceledBy || 'N/A'}</span>} />
                            <DetailItem icon={<ClipboardList className="w-5 h-5" />} label="Reason" value={order.cancellation_reason || 'No reason provided.'} />
                        </div>
                    </Card>
                )}

                {/* TRACKING/LOGS - Placeholder for more advanced tracking info */}
                <Card className="p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-indigo-700">Booking Timeline</h2>
                    <hr className="my-2"/>
                    <p className="text-gray-500 italic">
                        Booking Placed On: {order.created_date ? new Date(order.created_date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-gray-500 italic mt-1">
                        {order.remarks && `Admin Remarks: ${order.remarks}`}
                    </p>
                </Card>
                
            </div>
        </div>
    );
};

export default OrderDetailPage;