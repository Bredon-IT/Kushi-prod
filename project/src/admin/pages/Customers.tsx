// ==== FULL UPDATED Customers.tsx FILE ====

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import CustomerAPIService from "../services/CustomerAPIService";
import { Button } from "../components/ui/Button";

// -------- Types ----------
export interface Customer {
  booking_id: number;
  customer_id: number;
  userId?: number | null;
  customer_name: string;
  customer_email: string;
  customer_number: string;
  bookingStatus: string | null;
  bookingDate?: string;
  booking_time?: string;
  booking_service_name?: string;
  booking_amount?: number;
  grand_total?: number;
  worker_assign?: string | null;
}

type AggregatedCustomer = Customer & {
  bookings: Customer[];
  totalRevenue: number;
  totalBookings: number;
};

// ------------- MASKING FUNCTIONS ------------------

const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;

  const [user, domain] = email.split("@");

  if (user.length <= 4) return "xxxx@" + domain;

  const visible = user.slice(-4); // last 4 letters
  const hidden = "x".repeat(user.length - 4);

  return hidden + visible + "@" + domain;
};

const maskPhone = (number: string) => {
  if (!number) return "";

  const visible = number.slice(-4);
  const hidden = "x".repeat(number.length - 4);

  return hidden + visible;
};

// ------------- Pagination Hook --------------------
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

  useEffect(() => setCurrentPage(1), [data]);

  return { jump, next, prev, currentData, currentPage, maxPage, totalItems };
};

// ----- Utility -------
const getInitials = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("") : "?";

const getStatusBadge = (status?: string | null) => {
  const s = status?.toLowerCase();
  let color = "bg-gray-200 text-gray-700";

  if (s === "completed") color = "bg-green-100 text-green-700 border-green-300";
  else if (s === "confirmed") color = "bg-blue-100 text-blue-700 border-blue-300";
  else if (s === "cancelled") color = "bg-red-100 text-red-700 border-red-300";

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${color} uppercase whitespace-nowrap border`}
    >
      {status}
    </span>
  );
};

const CUSTOMER_GRID_COLS =
  "grid-cols-[250px_1.5fr_1.2fr_80px_100px_120px_120px]";

// -------- Customer Row (MASKING APPLIED HERE) -----------

interface CustomerCardProps {
  customer: AggregatedCustomer;
  onClick: (email: string) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  return (
    <div
      onClick={() => onClick(customer.customer_email)}
      className={`grid ${CUSTOMER_GRID_COLS} items-center p-3 border-b cursor-pointer hover:bg-gray-50`}
      style={{
        gridTemplateColumns:
          "250px 1.5fr 1.2fr 80px 100px 120px 120px",
      }}
    >
      {/* NAME */}
      <div className="flex items-center space-x-3 truncate">
        <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex justify-center items-center">
          {getInitials(customer.customer_name)}
        </div>
        <div className="truncate">
          <div className="font-semibold">{customer.customer_name}</div>
          <div className="text-xs text-gray-500 flex items-center">
            {customer.userId ? (
              <UserCheck className="w-3 h-3 mr-1" />
            ) : (
              <UserX className="w-3 h-3 mr-1" />
            )}
            {customer.userId ? "Registered" : "Guest"}
          </div>
        </div>
      </div>

      {/* MASKED EMAIL */}
      <div className="flex items-center text-gray-600 truncate">
        <Mail className="w-4 h-4 mr-1 text-gray-400" />
        {maskEmail(customer.customer_email)}
      </div>

      {/* MASKED PHONE */}
      <div className="flex items-center text-gray-600 truncate">
        <Phone className="w-4 h-4 mr-1 text-gray-400" />
        {maskPhone(customer.customer_number)}
      </div>

      {/* ID */}
      <div className="text-center">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
          {customer.customer_id}
        </span>
      </div>

      {/* BOOKINGS */}
      <div className="text-center text-blue-600 font-bold">
        {customer.totalBookings}
      </div>

      {/* REVENUE */}
      <div className="text-right font-bold text-green-700">
        ₹{customer.totalRevenue.toFixed(2)}
      </div>

      {/* STATUS */}
      <div className="flex justify-end">
        {getStatusBadge(
          customer.bookings.sort(
            (a, b) =>
              new Date(b.bookingDate || "").getTime() -
              new Date(a.bookingDate || "").getTime()
          )[0]?.bookingStatus
        )}
      </div>
    </div>
  );
};

// ------------------ CUSTOMER DETAIL MODAL (FULL DETAILS) -------------------

interface CustomerDetailViewProps {
  selectedCustomer: AggregatedCustomer;
  onClose: () => void;
}

function CustomerDetailView({ selectedCustomer, onClose }: CustomerDetailViewProps) {
  const sortedBookings = [...selectedCustomer.bookings].sort(
    (a, b) =>
      new Date(b.bookingDate || "").getTime() -
      new Date(a.bookingDate || "").getTime()
  );

  return (
    <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-xl relative">
      <button
        className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full"
        onClick={onClose}
      >
        <X />
      </button>

      {/* Header */}
      <div className="border-b pb-4 mb-4 flex space-x-4">
        <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
          {getInitials(selectedCustomer.customer_name)}
        </div>

        <div>
          <h2 className="text-3xl font-bold">{selectedCustomer.customer_name}</h2>

          <p className="text-gray-500">
            {selectedCustomer.userId ? "Registered User" : "Guest User"} | ID:{" "}
            {selectedCustomer.customer_id}
          </p>

          {/* FULL EMAIL & PHONE */}
          <p className="text-gray-600 mt-1">
            <Mail className="inline w-4 h-4 mr-1" />
            {selectedCustomer.customer_email}
          </p>

          <p className="text-gray-600">
            <Phone className="inline w-4 h-4 mr-1" />
            {selectedCustomer.customer_number}
          </p>
        </div>
      </div>

    {/* Disabled Buttons 
      <div className="flex gap-3 bg-gray-50 p-4 rounded-lg border mb-6">
        <Button disabled variant="danger" className="flex-1">
          <Ban className="w-4 h-4 mr-2" /> Block Customer
        </Button>
        <Button disabled variant="success" className="flex-1">
          <Gift className="w-4 h-4 mr-2" /> Grant Reward
        </Button>
        <Button disabled variant="success" className="flex-1">
          <Ticket className="w-4 h-4 mr-2" /> Grant Coupon
        </Button>
      </div>  */}
                 
      {/* Booking History */}
      <h3 className="text-xl font-bold mb-3">
        Booking History ({selectedCustomer.totalBookings})
      </h3>

      <div className="overflow-auto max-h-[40vh] border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Service</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Worker</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {sortedBookings.map((b, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3 font-medium text-blue-600">{b.booking_id}</td>
                <td className="p-3">{b.booking_service_name}</td>
                <td className="p-3 text-xs">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {b.bookingDate}
                  <br />
                  <Clock className="w-3 h-3 inline mr-1" />
                  {b.booking_time}
                </td>
                <td className="p-3 text-green-700 font-bold">
                  ₹{(b.grand_total ?? b.booking_amount ?? 0).toFixed(2)}
                </td>
                <td className="p-3">{b.worker_assign ?? "Unassigned"}</td>
                <td className="p-3">{getStatusBadge(b.bookingStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------- MAIN COMPONENT --------------------

const ITEMS_PER_PAGE = 50;

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchCustomers = async (statusFilter: string) => {
    setLoading(true);
    try {
      let data;

      if (statusFilter === "all") data = await CustomerAPIService.getAllCustomers();
      else if (statusFilter === "loggedIn")
        data = await CustomerAPIService.getLoggedInCustomers();
      else if (statusFilter === "guest")
        data = await CustomerAPIService.getGuestCustomers();
      else if (statusFilter === "completed")
        data = await CustomerAPIService.getCompletedCustomers();
      else data = await CustomerAPIService.getCustomersByBookingStatus(statusFilter);

      setCustomers(data);
    } catch (err) {
      console.error(err);
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

    customers.forEach((c) => {
      if (!map.has(c.customer_email)) {
        map.set(c.customer_email, {
          ...c,
          bookings: [],
          totalRevenue: 0,
          totalBookings: 0,
        });
      }

      const agg = map.get(c.customer_email)!;

      agg.bookings.push(c);
      agg.totalRevenue += c.grand_total ?? c.booking_amount ?? 0;
      agg.totalBookings++;
    });

    return map;
  }, [customers]);

  const filteredCustomers = Array.from(customerDataMap.values()).filter((c) => {
    const t = searchTerm.toLowerCase();
    return (
      c.customer_name.toLowerCase().includes(t) ||
      c.customer_email.toLowerCase().includes(t) ||
      c.customer_number.includes(t)
    );
  });

  const { currentData, currentPage, maxPage, totalItems, next, prev } =
    usePagination(filteredCustomers, ITEMS_PER_PAGE);

  const selectedCustomer = customerDataMap.get(selectedCustomerEmail || "");

  const closeModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCustomerEmail(null);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl text-gray-600">
        Loading customer data...
      </div>
    );

  return (
    <div className="w-full overflow-x-auto">
      <div className="py-6 bg-gray-50">

        <h1 className="text-3xl font-extrabold mb-6">
          Customer Relationship Management
        </h1>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border shadow-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "primary" : "secondary"}
              onClick={() => setFilter("all")}
            >
              <Users className="w-4 h-4 mr-1" /> All
            </Button>

            <Button
              variant={filter === "loggedIn" ? "primary" : "secondary"}
              onClick={() => setFilter("loggedIn")}
            >
              <UserCheck className="w-4 h-4 mr-1" /> Logged In
            </Button>

            <Button
              variant={filter === "guest" ? "primary" : "secondary"}
              onClick={() => setFilter("guest")}
            >
              <UserX className="w-4 h-4 mr-1" /> Guest
            </Button>

            <Button
              variant={filter === "completed" ? "primary" : "secondary"}
              onClick={() => setFilter("completed")}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Completed
            </Button>
          </div>
        </div>

        {/* Table Header */}
        <div
          className={`grid ${CUSTOMER_GRID_COLS} p-3 bg-gray-100 font-semibold text-xs uppercase border rounded-t-xl`}
        >
          <div>Customer Name</div>
          <div>Email ID</div>
          <div>Phone Number</div>
          <div className="text-center">ID</div>
          <div className="text-center">Bookings</div>
          <div className="text-right">Revenue</div>
          <div className="text-right">Status</div>
        </div>

        {/* Table Rows */}
        <div className="border-x border-b rounded-b-xl bg-white">
          {currentData.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No customers found.</div>
          ) : (
            currentData.map((c, i) => (
              <CustomerCard
                key={i}
                customer={c}
                onClick={(email) => {
                  setSelectedCustomerEmail(email);
                  setIsDetailsModalOpen(true);
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </p>

          <div className="flex gap-2">
            <Button onClick={prev} disabled={currentPage === 1} variant="secondary">
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>

            <span>
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
            <CustomerDetailView
              selectedCustomer={selectedCustomer}
              onClose={closeModal}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
