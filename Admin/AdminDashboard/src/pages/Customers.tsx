import { useEffect, useState, useMemo } from 'react';
import { Search, Ban, Gift, Ticket, Users, CheckCircle, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import CustomerAPIService from '../services/CustomerAPIService';
import { Button } from '../components/ui/Button';

// Matches backend CustomerDTO fields
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
  // UI extras
  rewards?: string[];
  coupons?: string[];
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCustomers(filter);
  }, [filter]);

  const fetchCustomers = async (statusFilter: string) => {
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
    }
  };

  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerEmail) {
      setSelectedCustomerEmail(customers[0].customer_email);
    }
  }, [customers]);

  const customerDataMap = useMemo(() => {
    const map = new Map<string, Customer & { bookings: Customer[]; totalRevenue: number; totalBookings: number }>();
    customers.forEach(customer => {
      if (!map.has(customer.customer_email)) {
        map.set(customer.customer_email, {
          ...customer,
          bookings: [],
          totalRevenue: 0,
          totalBookings: 0,
        });
      }
      const data = map.get(customer.customer_email)!;
      data.bookings.push(customer);
      data.totalRevenue += customer.totalAmount || 0;
      data.totalBookings += 1;
    });
    return map;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const uniqueCustomers = Array.from(customerDataMap.values());
    return uniqueCustomers.filter(customer => {
      let matchesFilter = false;
      if (filter === 'all') matchesFilter = true;
      else if (filter === 'completed') matchesFilter = customer.bookingStatus?.toLowerCase() === 'completed';
      else if (filter === 'confirmed') matchesFilter = customer.bookingStatus?.toLowerCase() === 'confirmed';
      else if (filter === 'cancelled') matchesFilter = customer.bookingStatus?.toLowerCase() === 'cancelled';
      else if (filter === 'loggedIn') matchesFilter = !!customer.userId;
      else if (filter === 'guest') matchesFilter = customer.userId == null;

      const matchesSearch =
        customer.customer_name?.toLowerCase().includes(term) ||
        customer.customer_email?.toLowerCase().includes(term) ||
        customer.customer_number?.toString().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [customerDataMap, searchTerm, filter]);

  const selectedBookings = useMemo(() => {
    const selected = customerDataMap.get(selectedCustomerEmail!);
    return selected ? selected.bookings : [];
  }, [customerDataMap, selectedCustomerEmail]);

  const handleBlock = async (id?: number | null) => {
    if (!id) return;
    try {
      await CustomerAPIService.blockCustomer(id);
      fetchCustomers(filter);
    } catch (err) {
      console.error('Failed to block customer:', err);
    }
  };

  const handleReward = async (id: number) => {
    try {
      await CustomerAPIService.addReward(id);
      alert('Reward added!');
    } catch (err) {
      console.error('Failed to add reward:', err);
    }
  };

  const handleCoupon = async (id: number) => {
    try {
      await CustomerAPIService.addCoupon(id);
      alert('Coupon added!');
    } catch (err) {
      console.error('Failed to add coupon:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
        <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')} className="flex-1">
          <Users className="w-4 h-4 mr-1" /> All Customers
        </Button>
        <Button variant={filter === 'loggedIn' ? 'primary' : 'secondary'} onClick={() => setFilter('loggedIn')} className="flex-1">
          <UserCheck className="w-4 h-4 mr-1" /> Logged In
        </Button>
        <Button variant={filter === 'guest' ? 'primary' : 'secondary'} onClick={() => setFilter('guest')} className="flex-1">
          <UserX className="w-4 h-4 mr-1" /> Guest
        </Button>
        <Button variant={filter === 'completed' ? 'primary' : 'secondary'} onClick={() => setFilter('completed')} className="flex-1">
          <CheckCircle className="w-4 h-4 mr-1" /> Completed
        </Button>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customers</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {filteredCustomers.map((customer, index) => {
              const isSelected = selectedCustomerEmail === customer.customer_email;
              return (
                <div
                  key={customer.customer_email ?? `customer-${index}`}
                  className={`flex flex-col p-4 border rounded-xl transition hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedCustomerEmail(isSelected ? null : customer.customer_email)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {customer.customer_name ? customer.customer_name.split(' ').map(n => n[0]).join('') : '?'}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{customer.customer_name}</div>
                        <div className="text-sm text-gray-500">{customer.customer_email}</div>
                        <div className="text-sm text-gray-500">{customer.customer_number}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={(e) => { e.stopPropagation(); handleBlock(customer.customer_id); }}>
                        <Ban className="w-4 h-4 mr-1" /> Block
                      </Button>
                      <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleReward(customer.customer_id); }}>
                        <Gift className="w-4 h-4 mr-1" /> Reward
                      </Button>
                      <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleCoupon(customer.customer_id); }}>
                        <Ticket className="w-4 h-4 mr-1" /> Coupon
                      </Button>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  {isSelected && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
                        <thead>
                          <tr className="bg-gray-200 dark:bg-gray-800">
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">Booking ID</th>
                            <th className="border p-2">Customer ID</th>
                            <th className="border p-2">User ID</th>
                            <th className="border p-2">Booking Count</th>
                            <th className="border p-2">Service Name</th>
                            <th className="border p-2">Service Amount</th>
                            <th className="border p-2">Rewards</th>
                            <th className="border p-2">Coupons</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Time</th>
                            <th className="border p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBookings.map((b, idx) => (
                            <tr
                              key={idx}
                              className={`border p-2 ${
                                b.bookingStatus?.toLowerCase() === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30' :
                                b.bookingStatus?.toLowerCase() === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                                ''
                              }`}
                            >
                              <td className="border p-2">{b.customer_name}</td>
                              <td className="border p-2">{b.customer_email}</td>
                              <td className="border p-2">{b.booking_id}</td>
                              <td className="border p-2">{b.customer_id}</td>
                              <td className="border p-2">{b.userId ?? '-'}</td>
                              <td className="border p-2">{customerDataMap.get(b.customer_email)?.totalBookings ?? 1}</td>
                              <td className="border p-2">{b.booking_service_name ?? '-'}</td>
                              <td className="border p-2">{b.booking_amount ?? b.totalAmount ?? '-'}</td>
                              <td className="border p-2">{b.rewards?.join(', ') ?? '-'}</td>
                              <td className="border p-2">{b.coupons?.join(', ') ?? '-'}</td>
                              <td className="border p-2">{b.bookingDate}</td>
                              <td className="border p-2">{b.booking_time}</td>
                              <td className="border p-2">{b.bookingStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}