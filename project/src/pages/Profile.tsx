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
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

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

    fetch(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/auth/orders/logged-in/${user.email}`)
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

        const totalSpentCalc = mappedOrders.reduce((sum, order) => {
          const orderTotal =
            order.services?.reduce(
              (s, service) => s + (service.service_cost ?? 0),
              0
            ) ?? 0;
          return sum + orderTotal;
        }, 0);

        setTotalSpent(totalSpentCalc);
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
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-peach-200 p-12 text-center">
            <h1 className="text-2xl font-bold text-navy-900 mb-4">
              Please log in to view your profile
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const totalBookings = orderHistory.length;
  const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();

  return (
    <div className="bg-pink-50 min-h-screen py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-peach-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-8 py-12 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-peach-400/20 to-navy-600/20"></div>
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-peach-100 text-lg">{user.email}</p>
              <div className="flex justify-center gap-6 mt-6 text-white/90">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <div className="text-sm">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {joinDate.getFullYear()}
                  </div>
                  <div className="text-sm">Member Since</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-peach-200">
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  navigate('/profile');
                }}
                className={`px-6 py-4 font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'text-peach-600 border-b-2 border-peach-600'
                    : 'text-navy-600 hover:text-peach-600'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  navigate('/orderhistory');
                }}
                className={`px-6 py-4 font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'text-peach-600 border-b-2 border-peach-600'
                    : 'text-navy-600 hover:text-peach-600'
                }`}
              >
                Order History
              </button>
            </div>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-peach-200 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-navy-900">
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-peach-300 to-navy-700 text-white px-4 py-2 rounded-lg font-medium hover:from-peach-600 hover:to-navy-700 transition-all"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First/Last Name */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-700 mb-3">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 bg-peach-50/50"
                          required
                        />
                      ) : (
                        <div className="px-4 py-3 bg-peach-50 rounded-xl text-navy-700 font-medium">
                          {user.firstName}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-700 mb-3">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 bg-peach-50/50"
                          required
                        />
                      ) : (
                        <div className="px-4 py-3 bg-peach-50 rounded-xl text-navy-700 font-medium">
                          {user.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-3">
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
                      {user.email} (Cannot be changed)
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-3">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 bg-peach-50/50"
                        required
                      />
                    ) : (
                      <div className="px-4 py-3 bg-peach-50 rounded-xl text-navy-700 font-medium">
                        {user.phone}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-3">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 bg-peach-50/50"
                        placeholder="Enter your complete address"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-peach-50 rounded-xl text-navy-700 font-medium min-h-[80px]">
                        {user.address || 'No address provided'}
                      </div>
                    )}
                  </div>

                  {/* City/Pincode */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-700 mb-3">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 bg-peach-50/50"
                          placeholder="Bangalore"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-peach-50 rounded-xl text-navy-700 font-medium">
                          {user.city || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-700 mb-3">
                        Pincode
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) =>
                            setFormData({ ...formData, pincode: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 bg-peach-50/50"
                          placeholder="560001"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-peach-50 rounded-xl text-navy-700 font-medium">
                          {user.pincode || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Changes */}
                  {isEditing && (
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-peach-600 to-navy-700 text-white py-4 rounded-xl text-lg font-bold hover:from-peach-700 hover:to-navy-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-peach-200 p-6">
                <h3 className="text-lg font-bold text-navy-900 mb-6">
                  Account Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-peach-50 rounded-lg">
                    <Calendar className="text-peach-600" size={20} />
                    <div>
                      <div className="text-sm text-navy-600">Member Since</div>
                      <div className="font-semibold text-navy-800">
                        {joinDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg">
                    <ShoppingBag className="text-navy-600" size={20} />
                    <div>
                      <div className="text-sm text-navy-600">Total Bookings</div>
                      <div className="font-semibold text-navy-800">
                        {totalBookings} services
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CreditCard className="text-green-600" size={20} />
                    <div>
                      <div className="text-sm text-navy-600">Total Spent</div>
                      <div className="font-semibold text-navy-800">
                        ₹{totalSpent.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-peach-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-8">
                Order History
              </h2>

              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="text-navy-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    No Orders Yet
                  </h3>
                  <p className="text-navy-600 mb-6">
                    You haven't placed any orders yet. Start by browsing our
                    services!
                  </p>
                  <button
                    onClick={() => navigate('/booking')}
                    className="bg-gradient-to-r from-peach-600 to-navy-700 text-white px-6 py-3 rounded-lg font-medium hover:from-peach-700 hover:to-navy-800 transition-all"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orderHistory.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gradient-to-r from-peach-50 to-navy-50 rounded-xl p-6 border border-peach-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-navy-900">
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
