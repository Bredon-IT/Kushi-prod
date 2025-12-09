import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
        User,
        MapPin,
        Calendar,
        ShoppingBag,
        Edit3,
        Save,
        X,
        Package,
        Phone,
        Mail,
        Home,
        User as UserIcon,
        Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Global_API_BASE from '../services/GlobalConstants';

// Custom Type for User data from AuthContext (assuming based on usage)
// NOTE: Must include all fields used in the form/display
interface UserProfile {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        pincode: string;
        joinDate?: string;
}

interface Service {
        service_name: string;
        service_cost: number;
}

interface Order {
        id: number;
        date: string;
        services: Service[];
        amount: number;
        address?: string;
        rating?: number;
        status: string;
}

/**
 * Interface for the data sent to the backend for updating the profile.
 * This is the exact shape of the request body expected by your Spring Boot controller.
 */
interface FormData {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        pincode: string;
}

// NOTE: Retaining the assumption for AuthContextValue
interface AuthContextValue {
        user: UserProfile | null;
        updateProfile: (formData: FormData) => Promise<boolean>;
        isUserLoading: boolean;
}

// --- START: Extracted Helper Components ---

// DataField Component 
const DataField: React.FC<{
        icon: React.ElementType;
        label: string;
        children: React.ReactNode;
        fullWidth?: boolean;
        isEmail?: boolean;
}> = ({ icon: Icon, label, children, fullWidth, isEmail = false }) => (
        <div className={`p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${fullWidth ? 'col-span-full' : ''}`}>
                <label className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        <Icon size={14} className="mr-2 text-peach-300" />
                        {label}
                </label>
                <div className={`${isEmail ? 'text-base font-semibold text-gray-600' : ''}`}>
                        {children}
                </div>
        </div>
);

// DisplayValue Component
const DisplayValue: React.FC<{ value: string | undefined, isEmail?: boolean }> = ({ value, isEmail = false }) => (
        <div className={`text-base font-semibold ${isEmail ? 'text-gray-600' : 'text-navy-700'}`}>
                {value || 'Not specified'}
                {isEmail && <span className="text-sm text-gray-500 ml-2">(Login ID)</span>}
        </div>
);

interface ProfileFormProps {
        isEditing: boolean;
        isLoading: boolean;
        formData: FormData;
        user: UserProfile;
        handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// Memoized Form Content Component
const ProfileFormContent: React.FC<ProfileFormProps> = React.memo(({
        isEditing,
        isLoading,
        formData,
        user,
        handleFormChange,
}) => {
        // If user is null (should be caught by the main Profile guard, but for safety)
        if (!user) return null;

        // The entire form content structure from the original component is moved here.
        return (
                <div className="space-y-6">

                        {/* --- PERSONAL INFO --- */}
                        <h3 className="text-xl font-semibold text-navy-700">Personal Info</h3>
                        <div className="grid md:grid-cols-3 gap-4">

                                {/* FIRST NAME */}
                                <DataField icon={User} label="First Name">
                                        {isEditing ? (
                                                <input
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleFormChange}
                                                        className="w-full px-4 py-2 border border-peach-300 focus:ring-peach-300 focus:border-peach-300 rounded-lg text-navy-700"
                                                        required
                                                        disabled={isLoading}
                                                        key="input-firstName"
                                                />
                                        ) : (
                                                <DisplayValue value={user.firstName} />
                                        )}
                                </DataField>

                                {/* LAST NAME */}
                                <DataField icon={User} label="Last Name">
                                        {isEditing ? (
                                                <input
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleFormChange}
                                                        className="w-full px-4 py-2 border border-peach-300 focus:ring-peach-300 focus:border-peach-300 rounded-lg text-navy-700"
                                                        required
                                                        disabled={isLoading}
                                                        key="input-lastName"
                                                />
                                        ) : (
                                                <DisplayValue value={user.lastName} />
                                        )}
                                </DataField>

                                {/* PHONE */}
                                <DataField icon={Phone} label="Phone Number">
                                        {isEditing ? (
                                                <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleFormChange}
                                                        className="w-full px-4 py-2 border border-peach-300 focus:ring-peach-300 focus:border-peach-300 rounded-lg text-navy-700"
                                                        required
                                                        disabled={isLoading}
                                                        key="input-phone"
                                                />
                                        ) : (
                                                <DisplayValue value={user.phone} />
                                        )}
                                </DataField>
                        </div>

                        {/* --- EMAIL (READ ONLY) --- */}
                        <div className="grid md:grid-cols-2 gap-4">
                                <DataField icon={Mail} label="Email Address" isEmail={true}>
                                        <DisplayValue value={user.email} isEmail={true} />
                                </DataField>
                        </div>

                        {/* --- ADDRESS --- */}
                        <h3 className="text-xl font-semibold text-navy-700 mt-6">Shipping Details</h3>

                        {/* ADDRESS */}
                        <DataField icon={MapPin} label="Address Line 1" fullWidth={true}>
                                {isEditing ? (
                                        <textarea
                                                rows={2}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2 border border-peach-300 focus:ring-peach-300 focus:border-peach-300 rounded-lg text-navy-700"
                                                required
                                                disabled={isLoading}
                                                key="input-address"
                                        />
                                ) : (
                                        <DisplayValue value={user.address} />
                                )}
                        </DataField>

                        {/* CITY + PINCODE */}
                        <div className="grid md:grid-cols-3 gap-4">

                                <DataField icon={Home} label="City">
                                        {isEditing ? (
                                                <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleFormChange}
                                                        className="w-full px-4 py-2 border border-peach-300 focus:ring-peach-300 focus:border-peach-300 rounded-lg text-navy-700"
                                                        required
                                                        disabled={isLoading}
                                                        key="input-city"
                                                />
                                        ) : (
                                                <DisplayValue value={user.city} />
                                        )}
                                </DataField>

                                <DataField icon={MapPin} label="Pincode">
                                        {isEditing ? (
                                                <input
                                                        type="text"
                                                        name="pincode"
                                                        value={formData.pincode}
                                                        onChange={handleFormChange}
                                                        className="w-full px-4 py-2 border border-peach-300 focus:ring-peach-300 focus:border-peach-300 rounded-lg text-navy-700"
                                                        required
                                                        key="input-pincode"
                                                />
                                        ) : (
                                                <DisplayValue value={user.pincode} />
                                        )}
                                </DataField>
                                <div></div>
                        </div>
                </div>
        );
});


// --- END: Extracted Helper Components ---

const Profile: React.FC = () => {
        useEffect(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
        }, []);

        // Destructure with the assumed loading state from context
        const { user, updateProfile, isUserLoading } = useAuth() as AuthContextValue;

        const [isEditing, setIsEditing] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
        const [orderHistory, setOrderHistory] = useState<Order[]>([]);
        const navigate = useNavigate();

        const [formData, setFormData] = useState<FormData>({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                pincode: '',
        });

        // 1. Sync form with user data whenever the user object changes (initial load/refresh)
        useEffect(() => {
                if (user) {
                        setFormData({
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                email: user.email || '',
                                phone: user.phone || '',
                                address: user.address || '',
                                city: user.city || '',
                                pincode: user.pincode || '',
                        });
                }
        }, [user]);

        // 2. Fetch order history (logic remains correct)
        useEffect(() => {
                if (!user || isUserLoading) {
                        setOrderHistory([]);
                        return;
                }

                interface FetchedOrder {
                        booking_id: number;
                        bookingDate: string;
                        booking_service_name: string;
                        totalAmount: number;
                        address_line_1: string;
                        city: string;
                        rating?: number;
                        bookingStatus: string;
                }

                // NOTE: Assuming your Spring Boot endpoint is correctly configured to use email via path variable or query param
                fetch(Global_API_BASE + `/api/auth/bookings/logged-in?email=${user.email}`)
                        .then((res) => {
                                if (res.status === 204) return []; // Handle No Content
                                if (!res.ok) throw new Error('Network response was not ok');
                                return res.json();
                        })
                        .then((data: FetchedOrder[]) => {
                                const mappedOrders: Order[] = data.map((order) => ({
                                        id: order.booking_id,
                                        date: order.bookingDate,
                                        services: [
                                                {
                                                        service_name: order.booking_service_name,
                                                        service_cost: order.totalAmount,
                                                },
                                        ],
                                        amount: order.totalAmount,
                                        address: `${order.address_line_1 || ''}, ${order.city || ''}`.trim(),
                                        rating: order.rating,
                                        status: order.bookingStatus,
                                }));
                                setOrderHistory(mappedOrders);
                        })
                        .catch((error) => {
                                console.error("Error fetching orders:", error);
                                setOrderHistory([]);
                        });
        }, [user, isUserLoading]);

        // Stable handler for form change
        const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value } = e.target;
                setFormData((prev) => ({
                        ...prev,
                        [name]: value,
                }));
        }, []);

        /** * FIX: Uses updateProfile from AuthContext to send data to backend. 
          */
        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!user) return;
                setIsLoading(true);

                try {
                        // Call the AuthContext function which handles the API PUT call
                        const success = await updateProfile(formData);

                        if (success) {
                                setIsEditing(false);
                                // Note: The AuthContext's updateProfile should already have updated the 'user' state upon success.
                        } else {
                                // Handle error notification here (e.g., toast message)
                                console.error("Profile update failed in context.");
                        }
                } catch (error) {
                        console.error("Profile update failed:", error);
                } finally {
                        setIsLoading(false);
                }
        };

        // Stable handler for cancel
        const handleCancel = useCallback(() => {
                if (!user) return;
                // Reset form data to current user data
                setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || '',
                        city: user.city || '',
                        pincode: user.pincode || '',
                });
                setIsEditing(false);
        }, [user]);

        const joinDate = useMemo(() => (user?.joinDate ? new Date(user.joinDate) : new Date()), [user?.joinDate]);

        /* --- Primary Loading Guard --- */
        if (isUserLoading) {
                return (
                        <div className="text-center py-20 bg-gray-50 min-h-screen flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-navy-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className='ml-3 text-lg text-navy-700'>Loading user profile...</p>
                        </div>
                );
        }

        /* --- Not Logged In Guard (After loading check) --- */
        if (!user && !isUserLoading) {
                return (
                        <div className="text-center py-20 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                                <UserIcon size={64} className="text-peach-300 mb-4" />
                                <h3 className="text-xl font-bold text-navy-700 mb-2">Please log in to view your profile.</h3>
                                <button
                                        onClick={() => navigate('/login')}
                                        className="bg-navy-700 text-white px-6 py-3 rounded-full font-semibold mt-4 shadow-lg hover:bg-navy-800 transition duration-300"
                                >
                                        Go to Login
                                </button>
                        </div>
                );
        }

        return (
                <div className="bg-gray-50 py-10 sm:py-8">
                        <div className="max-w-7xl mx-auto px-4">
                                {/* --- HEADER --- */}
                                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
                                        <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-6 py-8">
                                                <div className="flex items-center space-x-4">
                                                        <div className="bg-white/30 w-20 h-20 flex items-center justify-center rounded-full border-2 border-white">
                                                                <UserIcon size={40} className="text-white" />
                                                        </div>

                                                        <div className="text-white">
                                                                <h1 className="text-xl font-extrabold">{user?.firstName} {user?.lastName}</h1>
                                                                <p className="text-peach-300 text-sm flex items-center">
                                                                        <Mail size={14} className="mr-2" /> {user?.email}
                                                                </p>
                                                                <p className="text-sm flex items-center">
                                                                        <Calendar size={14} className="mr-2" />
                                                                        Member Since: {joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                                </p>
                                                        </div>
                                                </div>
                                        </div>

                                        {/* --- TABS --- */}
                                        <div className="bg-white border-b flex justify-center">
                                                <button
                                                        onClick={() => setActiveTab('profile')}
                                                        className={`px-6 py-4 font-semibold ${activeTab === 'profile' ? 'text-navy-700 border-b-4 border-peach-300' : 'text-gray-600'}`}
                                                >
                                                        Profile Information
                                                </button>
                                                <button
                                                        onClick={() => setActiveTab('orders')}
                                                        className={`px-6 py-4 font-semibold ${activeTab === 'orders' ? 'text-navy-700 border-b-4 border-peach-300' : 'text-gray-600'}`}
                                                >
                                                        Order History
                                                </button>
                                        </div>
                                </div>

                                {/* =================== PROFILE TAB =================== */}
                                {activeTab === 'profile' && user && (
                                        <form
                                                onSubmit={handleSubmit}
                                                id="profile-form"
                                                className="bg-white rounded-3xl shadow-2xl p-8"
                                                key={isEditing ? 'edit-mode-stable' : 'view-mode-stable'}
                                        >

                                                {/* ACCOUNT HEADER */}
                                                <div className="flex justify-between pb-4 border-b mb-6">
                                                        <h2 className="text-2xl font-bold text-navy-700 flex items-center">
                                                                <UserIcon size={24} className="mr-3 text-peach-300" /> Account Details
                                                        </h2>

                                                        {!isEditing ? (
                                                                <button
                                                                        onClick={() => setIsEditing(true)}
                                                                        type="button"
                                                                        className="bg-peach-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300 hover:bg-peach-400"
                                                                >
                                                                        <Edit3 size={16} /> Edit Profile
                                                                </button>
                                                        ) : (
                                                                <div className="flex gap-3">
                                                                        <button
                                                                                onClick={handleCancel}
                                                                                type="button"
                                                                                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 transition duration-300 hover:bg-gray-100"
                                                                        >
                                                                                <X size={16} /> Cancel
                                                                        </button>

                                                                        <button
                                                                                type="submit"
                                                                                disabled={isLoading}
                                                                                className="px-4 py-2 bg-navy-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition duration-300 hover:bg-navy-800"
                                                                        >
                                                                                {isLoading ? (
                                                                                        <>
                                                                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                                </svg>
                                                                                                Saving...
                                                                                        </>
                                                                                ) : (
                                                                                        <>
                                                                                                <Save size={16} /> Save Changes
                                                                                        </>
                                                                                )}
                                                                        </button>
                                                                </div>
                                                        )}
                                                </div>

                                                {/* Render the Memoized Form Content Component */}
                                                <ProfileFormContent
                                                        isEditing={isEditing}
                                                        isLoading={isLoading}
                                                        formData={formData}
                                                        user={user}
                                                        handleFormChange={handleFormChange}
                                                />

                                        </form>
                                )}

                                {/* =================== ORDER HISTORY TAB =================== */}
                                {activeTab === 'orders' && (
                                        <div className="space-y-6">
                                                <div className="bg-white rounded-3xl shadow-2xl p-8">
                                                        <h2 className="text-2xl font-bold text-navy-700 mb-8 flex items-center">
                                                                <ShoppingBag size={24} className="mr-3 text-peach-300" /> Order History
                                                        </h2>

                                                        {orderHistory.length === 0 ? (
                                                                <div className="text-center py-12">
                                                                        <Package size={64} className="text-navy-700 mx-auto mb-4" />
                                                                        <h3 className="text-xl font-bold text-navy-700 mb-2">No Orders Yet</h3>
                                                                        <p className="text-gray-600 mb-4">Start your first booking now!</p>
                                                                        <button
                                                                                onClick={() => navigate('/booking')}
                                                                                className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition duration-300"
                                                                        >
                                                                                Browse Services
                                                                        </button>
                                                                </div>
                                                        ) : (
                                                                <div className="space-y-6">
                                                                        {orderHistory.map((order) => (
                                                                                <div key={order.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-md transition duration-300 hover:shadow-lg">

                                                                                        <div className="flex justify-between items-start mb-4 border-b pb-3">
                                                                                                <div>
                                                                                                        <h3 className="text-xl font-bold text-navy-700 mb-1">{order.services[0].service_name}</h3>
                                                                                                        <p className="text-sm text-gray-500 flex items-center">
                                                                                                                <Calendar size={14} className="mr-2" />
                                                                                                                Booked On: <strong>{new Date(order.date).toLocaleDateString()}</strong>
                                                                                                        </p>
                                                                                                </div>

                                                                                                <div className={`px-4 py-1 rounded-full text-sm font-semibold 
                            ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`
                                                                                                }>
                                                                                                        {order.status}
                                                                                                </div>
                                                                                        </div>

                                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                                                <p className="flex items-center text-gray-700 font-medium">
                                                                                                        <MapPin size={16} className="mr-2 text-peach-300" />
                                                                                                        Address: {order.address}
                                                                                                </p>
                                                                                                <p className="font-bold text-lg text-gray-900 text-right">
                                                                                                        Total: <strong>₹{order.amount.toLocaleString('en-IN')}</strong>
                                                                                                </p>
                                                                                        </div>

                                                                                        {order.status === 'Completed' && (
                                                                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center">
                                                                                                        <Star size={18} className="text-yellow-400 mr-2" fill="yellow" />
                                                                                                        <span className="text-sm font-medium text-gray-700">
                                                                                                                Rating: <strong>{order.rating || 'No rating provided'}</strong>
                                                                                                        </span>
                                                                                                </div>
                                                                                        )}

                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                )}

                        </div>
                </div>
        );
};

export default Profile;