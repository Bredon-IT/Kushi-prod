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
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
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
  worker_assign?: string | null;
}

type AggregatedCustomer = Customer & {
  bookings: Customer[];
  totalRevenue: number;
  totalBookings: number;
};

// --- Pagination Hook ---
const usePagination = (data: AggregatedCustomer[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = data.length;
  const maxPage = Math.ceil(totalItems / itemsPerPage);

  const currentData = useMemo(() => {
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return data.slice(begin, end);
  }, [data, currentPage, itemsPerPage]);

  const jump = (page: number) => {
    const pageNumber = Math.max(1, page);
    setCurrentPage(Math.min(pageNumber, maxPage));
  };

  const next = () => jump(currentPage + 1);
  const prev = () => jump(currentPage - 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return { jump, next, prev, currentData, currentPage, maxPage, totalItems };
};

// --- Utility Functions ---
const getInitials = (name: string) =>
  name ? name.split(' ').map((n) => n[0]).join('') : '?';

const getStatusBadge = (status?: string | null) => {
  const s = status?.toLowerCase();
  let color = 'bg-gray-200 text-gray-700';
  if (s === 'completed')
    color = 'bg-green-100 text-green-700 border-green-300';
  else if (s === 'confirmed')
    color = 'bg-blue-100 text-blue-700 border-blue-300';
  else if (s === 'cancelled')
    color = 'bg-red-100 text-red-700 border-red-300';
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${color} uppercase whitespace-nowrap border`}
    >
      {status}
    </span>
  );
};

// --- Grid Layout Definition ---
const CUSTOMER_GRID_COLS =
  'grid-cols-[250px_1.5fr_1.2fr_80px_100px_120px_120px]';

// --- Customer Card Component ---
interface CustomerCardProps {
  customer: AggregatedCustomer;
  onClick: (email: string) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  return (
    <div
      className={`grid ${CUSTOMER_GRID_COLS} items-center p-3 border-b border-gray-100 bg-white hover:bg-gray-50 transition cursor-pointer text-sm`}
      onClick={() => onClick(customer.customer_email)}
      style={{
        gridTemplateColumns: '250px 1.5fr 1.2fr 80px 100px 120px 120px',
      }}
    >
      {/* 1. Name */}
      <div className="flex items-center space-x-3 truncate">
        <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {getInitials(customer.customer_name)}
        </div>
        <div className="flex flex-col truncate">
          <span className="font-semibold text-gray-900 truncate mb-0.5">
            {customer.customer_name}
          </span>
          <span className="text-xs text-gray-500 flex items-center">
            {customer.userId ? (
              <UserCheck className="w-3 h-3 mr-1" />
            ) : (
              <UserX className="w-3 h-3 mr-1" />
            )}
            {customer.userId ? 'Registered' : 'Guest'}
          </span>
        </div>
      </div>

      {/* 2. Email */}
      <div className="flex items-center text-gray-600 truncate">
        <Mail className="w-4 h-4 mr-1 text-gray-400 hidden md:inline" />
        <span className="truncate" title={customer.customer_email}>
          {customer.customer_email}
        </span>
      </div>

      {/* 3. Phone */}
      <div className="flex items-center text-gray-600 truncate">
        <Phone className="w-4 h-4 mr-1 text-gray-400 hidden md:inline" />
        <span className="font-medium truncate">{customer.customer_number}</span>
      </div>

      {/* 4. ID */}
      <div className="text-gray-700 text-center truncate">
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {customer.customer_id}
        </span>
      </div>

      {/* 5. Bookings */}
      <div className="text-blue-600 font-extrabold text-center">
        {customer.totalBookings}
      </div>

      {/* 6. Revenue */}
      <div className="text-green-700 font-bold text-right truncate">
        ₹{customer.totalRevenue.toFixed(2)}
      </div>

      {/* 7. Status */}
      <div className="flex justify-end">
        {(() => {
          const latestBooking = customer.bookings.reduce((latest, current) => {
            const latestDate = latest.bookingDate
              ? new Date(latest.bookingDate)
              : new Date(0);
            const currentDate = current.bookingDate
              ? new Date(current.bookingDate)
              : new Date(0);
            return currentDate > latestDate ? current : latest;
          }, customer.bookings[0]);
          return getStatusBadge(latestBooking?.bookingStatus);
        })()}
      </div>
    </div>
  );
};

// --- Customer Detail View (Modal) ---
interface CustomerDetailViewProps {
  selectedCustomer: AggregatedCustomer;
  onClose: () => void;
  handleBlock: (id?: number | null) => void;
  handleReward: (id: number) => void;
  handleCoupon: (id: number) => void;
}

function CustomerDetailView({
  selectedCustomer,
  onClose,
  handleBlock,
  handleReward,
  handleCoupon,
}: CustomerDetailViewProps) {
  const sortedBookings = useMemo(() => {
    return [...selectedCustomer.bookings].sort(
      (a, b) =>
        new Date(b.bookingDate ?? 0).getTime() -
        new Date(a.bookingDate ?? 0).getTime()
    );
  }, [selectedCustomer.bookings]);

  return (
    <div className="bg-white w-full max-w-4xl mx-auto rounded-xl shadow-2xl overflow-y-auto max-h-[95vh] p-6 relative">
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 z-10 text-gray-700"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="border-b pb-4 mb-4 flex items-center space-x-4">
        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl">
          {getInitials(selectedCustomer.customer_name)}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCustomer.customer_name}
          </h2>
          <p className="text-md text-gray-500 mt-1">
            {selectedCustomer.userId ? 'Registered User' : 'Guest User'} | ID:{' '}
            <span className="font-medium text-gray-700">
              {selectedCustomer.customer_id}
            </span>
          </p>
          <p className="text-md text-gray-500">
            <Mail className="w-4 h-4 inline-block mr-1 align-sub" />{' '}
            {selectedCustomer.customer_email}
          </p>
          <p className="text-md text-gray-500">
            <Phone className="w-4 h-4 inline-block mr-1 align-sub" />{' '}
            {selectedCustomer.customer_number}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-3 bg-gray-50 border rounded-lg mb-6">
        <Button
          onClick={() => handleBlock(selectedCustomer.customer_id)}
          variant="danger"
          className="flex-1 min-w-[150px]"
        >
          <Ban className="w-4 h-4 mr-2" /> Block Customer
        </Button>
        <Button
          onClick={() => handleReward(selectedCustomer.customer_id)}
          variant="success"
          className="flex-1 min-w-[150px]"
        >
          <Gift className="w-4 h-4 mr-2" /> Grant Reward
        </Button>
        <Button
          onClick={() => handleCoupon(selectedCustomer.customer_id)}
          variant="success"
          className="flex-1 min-w-[150px]"
        >
          <Ticket className="w-4 h-4 mr-2" /> Grant Coupon
        </Button>
      </div>

      {/* Booking History */}
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
        Booking History ({selectedCustomer.totalBookings})
      </h3>
      <div className="overflow-x-auto max-h-[40vh] custom-scrollbar rounded-lg border">
        <table className="min-w-full table-auto text-sm divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-gray-600">ID</th>
              <th className="p-3 text-left font-medium text-gray-600">Service</th>
              <th className="p-3 text-left font-medium text-gray-600">
                Date & Time
              </th>
              <th className="p-3 text-left font-medium text-gray-600">
                Revenue
              </th>
              <th className="p-3 text-left font-medium text-gray-600">
                Worker
              </th>
              <th className="p-3 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((b, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-blue-600">{b.booking_id}</td>
                <td className="p-3 text-gray-800 truncate max-w-[120px]">
                  {b.booking_service_name ?? '-'}
                </td>
                <td className="p-3 text-gray-600 text-xs whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {b.bookingDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {b.booking_time}
                  </span>
                </td>
                <td className="p-3 font-semibold text-green-700 whitespace-nowrap">
                  ₹{(b.grand_total ?? b.booking_amount ?? 0).toFixed(2)}
                </td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  {b.worker_assign ?? (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="p-3">{getStatusBadge(b.bookingStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Customers Component ---
const ITEMS_PER_PAGE = 50;

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerEmail, setSelectedCustomerEmail] =
    useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchCustomers = async (statusFilter: string) => {
    setLoading(true);
    try {
      let data;
      if (statusFilter === 'all')
        data = await CustomerAPIService.getAllCustomers();
      else if (statusFilter === 'loggedIn')
        data = await CustomerAPIService.getLoggedInCustomers();
      else if (statusFilter === 'guest')
        data = await CustomerAPIService.getGuestCustomers();
      else if (statusFilter === 'completed')
        data = await CustomerAPIService.getCompletedCustomers();
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

  const customerDataMap = useMemo(() => {
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
      const amount = customer.grand_total ?? customer.booking_amount ?? 0;
      data.bookings.push(customer);
      data.totalRevenue += amount;
      data.totalBookings += 1;
    });
    return map;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const uniqueCustomers = Array.from(customerDataMap.values());
    return uniqueCustomers.filter((customer) => {
      const matchesSearch =
        customer.customer_name?.toLowerCase().includes(term) ||
        customer.customer_email?.toLowerCase().includes(term) ||
        customer.customer_number?.toString().includes(term);
      return matchesSearch;
    });
  }, [customerDataMap, searchTerm]);

  const { currentData: paginatedCustomers, currentPage, maxPage, totalItems, next, prev } =
    usePagination(filteredCustomers, ITEMS_PER_PAGE);

  const handleCustomerClick = (email: string) => {
    setSelectedCustomerEmail(email);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedCustomerEmail(null);
  };

  const selectedCustomer = useMemo(() => {
    return customerDataMap.get(selectedCustomerEmail!) || null;
  }, [customerDataMap, selectedCustomerEmail]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xl font-semibold text-gray-600">
        Loading customer data...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-scroll md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">

      {/* Force width larger than mobile to show scrollbar */}
      <div className="min-w-[1200px]">

        {/* ORIGINAL DESKTOP CONTENT (UNTOUCHED) */}
        <div className="py-4 sm:py-6 sm:px-6 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Customer Relationship Management
          </h1>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center px-4 sm:px-0">
            <div className="relative flex-1 min-w-[300px] max-w-lg">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-start">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilter('all')}
              >
                <Users className="w-4 h-4 mr-1" /> All
              </Button>
              <Button
                variant={filter === 'loggedIn' ? 'primary' : 'secondary'}
                onClick={() => setFilter('loggedIn')}
              >
                <UserCheck className="w-4 h-4 mr-1" /> Logged In
              </Button>
              <Button
                variant={filter === 'guest' ? 'primary' : 'secondary'}
                onClick={() => setFilter('guest')}
              >
                <UserX className="w-4 h-4 mr-1" /> Guest
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'secondary'}
                onClick={() => setFilter('completed')}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Completed
              </Button>
            </div>
          </div>

          {/* Header Row */}
          <div
            className={`grid ${CUSTOMER_GRID_COLS} items-center p-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 rounded-t-xl border-x border-t`}
            style={{
              gridTemplateColumns: '250px 1.5fr 1.2fr 80px 100px 120px 120px',
            }}
          >
            <div>Customer Name</div>
            <div>Email ID</div>
            <div>Phone Number</div>
            <div className="text-center">ID</div>
            <div className="text-center">Bookings</div>
            <div className="text-right">Revenue</div>
            <div className="text-right">Status</div>
          </div>

          {/* Customer Rows */}
          <div className="border-x border-b bg-white rounded-b-xl">
            {paginatedCustomers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No customers found.</div>
            ) : (
              paginatedCustomers.map((customer, index) => (
                <CustomerCard
                  key={index}
                  customer={customer}
                  onClick={handleCustomerClick}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-4">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={prev} disabled={currentPage === 1} variant="secondary">
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-gray-700 font-medium">
                Page {currentPage} of {maxPage}
              </span>
              <Button
                onClick={next}
                disabled={currentPage === maxPage}
                variant="secondary"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Customer Details Modal */}
          {isDetailsModalOpen && selectedCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4 overflow-y-auto">
              <CustomerDetailView
                selectedCustomer={selectedCustomer}
                onClose={handleCloseDetails}
                handleBlock={() => alert('Block action triggered')}
                handleReward={() => alert('Reward action triggered')}
                handleCoupon={() => alert('Coupon action triggered')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Customers;
