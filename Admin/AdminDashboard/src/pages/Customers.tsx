import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Ban,
  Gift,
  Ticket,
  Users,
  CheckCircle,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  X,
  User,
} from 'lucide-react';
import CustomerAPIService from '../services/CustomerAPIService';
import { Button } from '../components/ui/Button';

// --- Type Definition ---
export interface Customer {
  booking_id: number;
  customer_id: number;
  userId?: number | null;
  customer_name: string;
  customer_email: string;
  customer_number: string;
  address_line_1?: string;
  city?: string;
  totalAmount?: number;
  bookingDate?: string;
  bookingStatus: string | null;
  booking_time?: string;
  booking_service_name?: string;
  booking_amount?: number;
  grand_total?: number;
  discount?: number;
  rewards?: string[];
  coupons?: string[];

  // ✅ Worker assigned field from backend
  worker_assign?: string | null;
}

// --- Customer Component ---
export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  // ✅ Fetch Customers
  const fetchCustomers = async (statusFilter: string) => {
    setLoading(true);
    try {
      let data;
      if (statusFilter === 'all') data = await CustomerAPIService.getAllCustomers();
      else if (statusFilter === 'loggedIn') data = await CustomerAPIService.getLoggedInCustomers();
      else if (statusFilter === 'guest') data = await CustomerAPIService.getGuestCustomers();
      else if (statusFilter === 'completed') data = await CustomerAPIService.getCompletedCustomers();
      else data = await CustomerAPIService.getCustomersByBookingStatus(statusFilter);

      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(filter);
  }, [filter]);

  // ✅ Aggregate data
  const customerDataMap = useMemo(() => {
    type AggregatedCustomer = Customer & { bookings: Customer[]; totalRevenue: number; totalBookings: number };
    const map = new Map<string, AggregatedCustomer>();
    customers.forEach((customer) => {
      if (!customer.customer_email) return;
      if (!map.has(customer.customer_email)) {
        map.set(customer.customer_email, {
          ...customer,
          bookings: [],
          totalRevenue: 0,
          totalBookings: 0,
        } as AggregatedCustomer);
      }
      const data = map.get(customer.customer_email)!;
      data.bookings.push(customer);
      const amount = customer.grand_total ?? customer.booking_amount ?? 0;
      data.totalRevenue += amount;
      data.totalBookings += 1;
    });
    return map;
  }, [customers]);

  // ✅ Filter customers
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const uniqueCustomers = Array.from(customerDataMap.values());

    return uniqueCustomers
      .filter((customer) => {
        const matchesSearch =
          customer.customer_name?.toLowerCase().includes(term) ||
          customer.customer_email?.toLowerCase().includes(term) ||
          customer.customer_number?.toString().includes(term);
        return matchesSearch;
      })
      .filter((customer) => {
        if (filter === 'all') return true;
        const latestBooking = customer.bookings.reduce((latest, current) => {
          const latestDate = latest.bookingDate ? new Date(latest.bookingDate) : new Date(0);
          const currentDate = current.bookingDate ? new Date(current.bookingDate) : new Date(0);
          return currentDate > latestDate ? current : latest;
        }, customer.bookings[0]);

        const latestStatus = latestBooking?.bookingStatus?.toLowerCase();
        if (filter === 'completed') return latestStatus === 'completed';
        if (filter === 'confirmed') return latestStatus === 'confirmed';
        if (filter === 'cancelled') return latestStatus === 'cancelled';
        if (filter === 'loggedIn') return !!customer.userId;
        if (filter === 'guest') return customer.userId == null;
        return true;
      });
  }, [customerDataMap, searchTerm, filter]);

  // ✅ Manage selected customer
  useEffect(() => {
    if (
      filteredCustomers.length > 0 &&
      (!selectedCustomerEmail || !customerDataMap.has(selectedCustomerEmail))
    ) {
      setSelectedCustomerEmail(filteredCustomers[0].customer_email);
    } else if (filteredCustomers.length === 0) {
      setSelectedCustomerEmail(null);
    }
  }, [filteredCustomers, customerDataMap, selectedCustomerEmail, filter]);

  const selectedCustomer = useMemo(() => {
    return customerDataMap.get(selectedCustomerEmail!) || null;
  }, [customerDataMap, selectedCustomerEmail]);

  // --- Action Handlers ---
  const handleBlock = async (id?: number | null) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to block this customer?')) return;
    try {
      await CustomerAPIService.blockCustomer(id);
      alert('Customer blocked successfully!');
      fetchCustomers(filter);
    } catch (err) {
      console.error('Failed to block customer:', err);
      alert('Failed to block customer.');
    }
  };

  const handleReward = async (id: number) => {
    if (!window.confirm('Are you sure you want to grant a Reward?')) return;
    try {
      await CustomerAPIService.addReward(id);
      alert('Reward added successfully!');
    } catch (err) {
      console.error('Failed to add reward:', err);
      alert('Failed to add reward.');
    }
  };

  const handleCoupon = async (id: number) => {
    if (!window.confirm('Are you sure you want to grant a Coupon?')) return;
    try {
      await CustomerAPIService.addCoupon(id);
      alert('Coupon added successfully!');
    } catch (err) {
      console.error('Failed to add coupon:', err);
      alert('Failed to add coupon.');
    }
  };

  const getInitials = (name: string) => (name ? name.split(' ').map((n) => n[0]).join('') : '?');

  const getStatusBadge = (status?: string | null) => {
    const s = status?.toLowerCase();
    let color = 'bg-gray-200 text-gray-700';
    if (s === 'completed') color = 'bg-green-100 text-green-700';
    else if (s === 'confirmed') color = 'bg-blue-100 text-blue-700';
    else if (s === 'cancelled') color = 'bg-red-100 text-red-700';
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color} uppercase`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl font-semibold text-gray-600">
        Loading customer data...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight font-serif-like">
        Customer Relationship Management
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            className="flex-1 min-w-[120px]"
          >
            <Users className="w-4 h-4 mr-1" /> All
          </Button>
          <Button
            variant={filter === 'loggedIn' ? 'primary' : 'secondary'}
            onClick={() => setFilter('loggedIn')}
            className="flex-1 min-w-[120px]"
          >
            <UserCheck className="w-4 h-4 mr-1" /> Logged In
          </Button>
          <Button
            variant={filter === 'guest' ? 'primary' : 'secondary'}
            onClick={() => setFilter('guest')}
            className="flex-1 min-w-[120px]"
          >
            <UserX className="w-4 h-4 mr-1" /> Guest
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('completed')}
            className="flex-1 min-w-[120px]"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Completed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-md flex flex-col">
          <div className="font-bold text-lg text-gray-700 pb-3 border-b mb-3">
            Found ({filteredCustomers.length}) Customers
          </div>
          <div
            className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow"
            style={{ maxHeight: '60vh' }}
          >
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => {
                const isSelected = selectedCustomerEmail === customer.customer_email;
                const customerInfo = customerDataMap.get(customer.customer_email)!;
                return (
                  <div
                    key={customer.customer_email}
                    className={`flex flex-col p-4 border rounded-xl shadow-sm transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => {
                      setSelectedCustomerEmail(customer.customer_email);
                      if (window.innerWidth < 1024) setIsMobileDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                        {getInitials(customer.customer_name)}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 truncate">
                          {customer.customer_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Bookings:{' '}
                          <span className="font-medium text-blue-600">
                            {customerInfo.totalBookings}
                          </span>{' '}
                          | Revenue:{' '}
                          <span className="font-medium text-green-600">
                            ₹{customerInfo.totalRevenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-md">
                No customers match your criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:block lg:col-span-2 bg-white p-6 rounded-xl shadow-md space-y-6">
          {selectedCustomer ? (
            <CustomerDetails
              selectedCustomer={selectedCustomer}
              handleBlock={handleBlock}
              handleReward={handleReward}
              handleCoupon={handleCoupon}
              getInitials={getInitials}
              getStatusBadge={getStatusBadge}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-10 min-h-[400px]">
              <Users className="w-12 h-12 mb-4 text-blue-400" />
              <p className="text-lg font-medium">
                Select a customer from the left to view details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Popup */}
      {isMobileDetailsOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-y-auto max-h-[50vh] p-4 relative">
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              onClick={() => setIsMobileDetailsOpen(false)}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <CustomerDetails
              selectedCustomer={selectedCustomer}
              handleBlock={handleBlock}
              handleReward={handleReward}
              handleCoupon={handleCoupon}
              getInitials={getInitials}
              getStatusBadge={getStatusBadge}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Customer Details Component ---
interface CustomerDetailsProps {
  selectedCustomer: Customer & { bookings: Customer[]; totalRevenue: number; totalBookings: number };
  handleBlock: (id?: number | null) => void;
  handleReward: (id: number) => void;
  handleCoupon: (id: number) => void;
  getInitials: (name: string) => string;
  getStatusBadge: (status?: string | null) => JSX.Element;
}

function CustomerDetails({
  selectedCustomer,
  handleBlock,
  handleReward,
  handleCoupon,
  getInitials,
  getStatusBadge,
}: CustomerDetailsProps) {
  return (
    <>
      {/* Header */}
      <div className="border-b pb-4 mb-4 flex items-center space-x-4">
        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
          {getInitials(selectedCustomer.customer_name)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.customer_name}</h2>
          <p className="text-sm text-gray-500">
            {selectedCustomer.userId ? 'Registered User' : 'Guest User'} | Customer ID:{' '}
            <span className="font-medium">{selectedCustomer.customer_id}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Email: <span className="font-medium">{selectedCustomer.customer_email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Phone: <span className="font-medium">{selectedCustomer.customer_number}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 p-3 bg-gray-50 border rounded-lg">
        <Button
          variant="destructive"
          onClick={() => handleBlock(selectedCustomer.customer_id)}
          className="flex-1 min-w-[100px]"
        >
          <Ban className="w-4 h-4 mr-1" /> Block Customer
        </Button>
        <Button
          variant="success"
          onClick={() => handleReward(selectedCustomer.customer_id)}
          className="flex-1 min-w-[100px]"
        >
          <Gift className="w-4 h-4 mr-1" /> Grant Reward
        </Button>
        <Button
          variant="success"
          onClick={() => handleCoupon(selectedCustomer.customer_id)}
          className="flex-1 min-w-[100px]"
        >
          <Ticket className="w-4 h-4 mr-1" /> Grant Coupon
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-700">
            {selectedCustomer.totalBookings}
          </div>
          <div className="text-xs text-blue-500">Total Bookings</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-700">
            ₹{selectedCustomer.totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-green-500">Total Revenue</div>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-lg font-bold text-yellow-700">
            {selectedCustomer.rewards?.length ?? 0}
          </div>
          <div className="text-xs text-yellow-500">Rewards Used</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-red-700">
            {selectedCustomer.coupons?.length ?? 0}
          </div>
          <div className="text-xs text-red-500">Coupons Used</div>
        </div>
      </div>

      {/* Booking History */}
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mt-4">
        Booking History
      </h3>
      <div className="overflow-x-auto max-h-[30vh] custom-scrollbar">
        <table className="min-w-full table-auto text-sm">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-gray-600">ID</th>
              <th className="p-3 text-left font-medium text-gray-600">Service</th>
              <th className="p-3 text-left font-medium text-gray-600">Worker</th>
              <th className="p-3 text-left font-medium text-gray-600">Date & Time</th>
              <th className="p-3 text-left font-medium text-gray-600">Amount</th>
              <th className="p-3 text-left font-medium text-gray-600">Discount</th>
              <th className="p-3 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {selectedCustomer.bookings
              .sort((a, b) => b.booking_id - a.booking_id)
              .map((b, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-blue-600">{b.booking_id}</td>
                  <td
                    className="p-3 truncate max-w-[150px]"
                    title={b.booking_service_name ?? ''}
                  >
                    {b.booking_service_name ?? '-'}
                  </td>

                  {/* ✅ Worker column */}
                  <td className="p-3 text-gray-700 whitespace-nowrap">
                    {b.worker_assign ? (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{b.worker_assign}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="p-3 text-gray-600 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {b.bookingDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {b.booking_time}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-green-700">
                    ₹{(b.grand_total ?? b.booking_amount ?? 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-gray-700">
                    {b.discount ? `₹${b.discount.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-3">{getStatusBadge(b.bookingStatus)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
