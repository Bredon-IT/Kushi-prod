import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Edit3,
  Save,
  X,
  Package,
  Star,
   Phone,
  Mail,
  Home,
   User as UserIcon, // Use a different alias for the default User icon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Global_API_BASE from '../services/GlobalConstants';

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

const Profile: React.FC = () => {

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);

  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  // Sync form data whenever user changes
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
  }, [user, location.pathname]);

  // Handle query param ?tab=orders
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'orders') setActiveTab('orders');
  }, [location.search]);

  // Fetch order history
  useEffect(() => {
    if (!user) return;

    fetch( Global_API_BASE + `/api/auth/orders/logged-in/${user.email}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data: any[]) => {
        console.log('Fetched orders:', data);

        const mappedOrders = data.map((order) => ({
          id: order.booking_id,
          date: order.bookingDate,
          services: [
            {
              service_name: order.booking_service_name,
              service_cost: order.totalAmount,
            },
          ],
          amount: order.totalAmount,
          address: `${order.address_line_1}, ${order.city}`,
          rating: order.rating,
          status: order.bookingStatus,
        }));

        setOrderHistory(mappedOrders);

        
      })
      .catch(() => setOrderHistory([]));

    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const success = await updateProfile(formData);
      if (success) setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      pincode: user?.pincode || '',
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="py-28 bg-gradient-to-br from-peach-50 to-navy-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-peach-300 p-12 text-center">
            <h1 className="text-2xl font-bold text-navy-700 mb-4">
              Please log in to view your profile
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();

  // Redesigned DataField component for better aesthetics
  const DataField: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string | number | undefined;
    isEditing: boolean;
    isEmail?: boolean;
    children?: React.ReactNode;
    fullWidth?: boolean;
  }> = ({ icon: Icon, label, value, isEditing, isEmail = false, children, fullWidth = false }) => (
    <div className={`p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-shadow hover:shadow-md ${fullWidth ? 'col-span-full' : ''}`}>
      <label className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        <Icon size={14} className="mr-2 text-peach-300" />
        {label}
      </label>
      {isEditing && !isEmail ? (
        children
      ) : (
        <div
          className={`text-base font-semibold ${
            isEmail ? 'text-gray-600' : 'text-navy-700'
          }`}
        >
          {value || 'Not specified'}
          {isEmail && <span className="text-sm text-gray-500 ml-2">(Login ID)</span>}
        </div>
      )}
    </div>
  );

  return (
<div className="bg-gray-50  py-10 sm:py-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Profile Header (REVISED FOR COMPACT LAYOUT) */}
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-6 py-8 relative">
        <div className="relative z-10 flex items-center sm:items-start space-x-4">
          {/* Icon */}
          <div className="bg-white/30 backdrop-blur-sm w-20 h-20 flex items-center justify-center rounded-full shadow-lg border-2 border-white flex-shrink-0">
            <UserIcon size={40} className="text-white" />
          </div>
          
          {/* User Info */}
          <div className="text-left text-white/95 flex-grow">
            <h1 className="text-xl font-extrabold mb-0.5">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-peach-300 text-sm font-medium flex items-center mb-1">
              <Mail size={14} className="mr-2 opacity-75" />
              {user.email}
            </p>
            <div className="flex items-center text-xs text-white/80">
              <Calendar size={14} className="mr-2 text-peach-300" />
              Member Since: {joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>

          {/* Tab Navigation (Minor adjustment for consistency) */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex justify-start sm:justify-center">
          <button
            onClick={() => {
              setActiveTab('profile');
              navigate('/profile');
            }}
            className={`px-6 py-4 font-semibold transition-all flex items-center text-sm sm:text-base ${
              activeTab === 'profile'
                ? 'text-navy-700 border-b-4 border-peach-300'
                : 'text-gray-600 hover:text-navy-700'
            }`}
          >
            <UserIcon size={18} className="mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              navigate('/orderhistory');
            }}
            className={`px-6 py-4 font-semibold transition-all flex items-center text-sm sm:text-base ${
              activeTab === 'orders'
                ? 'text-navy-700 border-b-4 border-peach-300'
                : 'text-gray-600 hover:text-navy-700'
            }`}
          >
            <ShoppingBag size={18} className="mr-2" />
            Order History
           
          </button>
        </div>
      </div>
    </div>
        {/* Profile Tab */}
     {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
              <div className="flex items-start justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-navy-700 flex items-center">
                  <UserIcon size={24} className="mr-3 text-peach-300" />
                  Account Details
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-peach-300 text-white px-4 py-2 rounded-xl font-medium hover:bg-peach-300 transition-all shadow-lg shadow-peach-300/50"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      form="profile-form"
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-navy-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-navy-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <h3 className="text-xl font-semibold text-navy-700">Personal Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <DataField
                    icon={User}
                    label="First Name"
                    value={user.firstName}
                    isEditing={isEditing}
                  >
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-peach-300 rounded-lg focus:ring-1 focus:ring-peach-300 focus:border-peach-300 bg-peach-50/50 text-navy-700 font-medium transition duration-200"
                      required
                    />
                  </DataField>

                  <DataField
                    icon={User}
                    label="Last Name"
                    value={user.lastName}
                    isEditing={isEditing}
                  >
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-peach-300 rounded-lg focus:ring-1 focus:ring-peach-300 focus:border-peach-300 bg-peach-50/50 text-navy-700 font-medium transition duration-200"
                      required
                    />
                  </DataField>

                    <DataField
                    icon={Phone}
                    label="Phone Number"
                    value={user.phone}
                    isEditing={isEditing}
                  >
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-peach-300 rounded-lg focus:ring-1 focus:ring-peach-300 focus:border-peach-300 bg-peach-50/50 text-navy-700 font-medium transition duration-200"
                      required
                    />
                  </DataField>

                    </div>

                
                 {/* Email Address (Kept separate as it's not editable) */}
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DataField
                            icon={Mail}
                            label="Email Address"
                           value={user.email}
                            isEditing={isEditing}
                                  isEmail={true}
                                        />
                                     </div>

                
              
                {/* Address Section */}
                <h3 className="text-xl font-semibold text-navy-700 mt-8 pt-4 border-t border-gray-100">
                  Shipping Details
                </h3>

                <DataField
                  icon={MapPin}
                  label="Address Line 1"
                  value={user.address}
                  isEditing={isEditing}
                  fullWidth={true} // Full width for address text area
                >
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-peach-300 rounded-lg focus:ring-1 focus:ring-peach-300 focus:border-peach-300 bg-peach-50/50 text-navy-700 font-medium transition duration-200"
                    placeholder="Enter your complete address"
                  />
                </DataField>

                <div className="grid md:grid-cols-3 gap-4">
                  <DataField
                    icon={Home}
                    label="City"
                    value={user.city}
                    isEditing={isEditing}
                  >
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-peach-300 rounded-lg focus:ring-1 focus:ring-peach-300 focus:border-peach-300 bg-peach-50/50 text-navy-700 font-medium transition duration-200"
                      placeholder="Bangalore"
                    />
                  </DataField>

                  <DataField
                    icon={MapPin}
                    label="Pincode"
                    value={user.pincode}
                    isEditing={isEditing}
                  >
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-peach-300 rounded-lg focus:ring-1 focus:ring-peach-300 focus:border-peach-300 bg-peach-50/50 text-navy-700 font-medium transition duration-200"
                      placeholder="560001"
                    />
                  </DataField>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- REVISED PROFILE TAB END --- */}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-peach-300 p-8">
              <h2 className="text-2xl font-bold text-navy-700 mb-8">
                Order History
              </h2>

              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="text-navy-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-navy-700 mb-2">
                    No Orders Yet
                  </h3>
                  <p className="text-navy-700 mb-6">
                    You haven't placed any orders yet. Start by browsing our
                    services!
                  </p>
                  <button
                    onClick={() => navigate('/booking')}
                    className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-6 py-3 rounded-lg font-medium hover:from-peach-300 hover:to-navy-700 transition-all"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orderHistory.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gradient-to-r from-peach-50 to-navy-50 rounded-xl p-6 border border-peach-300"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-navy-700">
                            {order.services[0].service_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(order.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Address: {order.address}
                          </p>
                          {order.rating && (
                            <p className="text-yellow-600">
                              Rating: {order.rating} ⭐
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">
                        Total: ₹{order.amount.toLocaleString('en-IN')}
                      </p>
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
