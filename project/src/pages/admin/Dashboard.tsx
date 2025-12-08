import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Wrench, TrendingUp, Star, Clock, ArrowUp, ArrowDown, Activity, MapPin, Phone, Mail, Award, Target, CheckCircle, AlertCircle, XCircle, Timer, FileText, IndianRupeeIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/admin/ui/Card';
import { Badge } from '../../components/admin/ui/Badge';
import { Button } from '../../components/admin/ui/Button';
import { BookingChart } from '../../components/admin/charts/BookingChart';
import { RevenueChart } from '../../components/admin/charts/RevenueChart';
import Global_API_BASE from '../../services/admin/GlobalConstants';

import OverviewService from '../../services/admin/OverviewService';
import axios from 'axios';
import { RunningOffersCard } from '../../components/admin/RunningOffers';

// Utility for local activity log
function getTodayActivities() {
  const ACTIVITY_KEY = 'dashboard_activities';
  const today = new Date().toISOString().split('T')[0];
  const allLogs = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}');
  return allLogs[today] || [];
}
export function Dashboard() {
  const navigate = useNavigate();

  // States
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [topBookedCustomers, setTopBookedCustomers] = useState<any[]>([]);
  const [topRatedServices, setTopRatedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRunningOffers, setShowRunningOffers] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
 const [recentActivities, setRecentActivities] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);
    const [todaysBookingList, setTodaysBookingList] = useState<any[]>([]);

  

  // Fetch Recent Bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const res = await axios.get(Global_API_BASE + "/api/admin/recent-bookings");
        const mapped = res.data.map((item) => ({
          id: item.booking_id,
          customerName: item.customer_name,
          customerEmail: item.customer_email,
          service: item.booking_service_name,
          category: item.booking_category,
          date: item.bookingDate,
          time: item.booking_time,
          duration: item.booking_duration,
          address: item.address_line_1,
          status: item.bookingStatus?.toLowerCase(),
          price: item.booking_amount
        }));
        setRecentBookings(mapped);
      } catch (err) {
        console.error("Error fetching recent bookings:", err);
      }
    };
    fetchRecentBookings();
  }, []);

  useEffect(() => {
    // Fetch today's bookings count
    axios.get(Global_API_BASE + "/api/admin/today-bookings")
      .then(res => setTodayBookings(Number(res.data)))
      .catch(() => setTodayBookings(0));
 // Fetch all bookings, filter for today's and recent
    axios.get(Global_API_BASE + "/api/admin/all-bookings")
      .then(res => {
        const allBookings = Array.isArray(res.data) ? res.data : [];
        // Today's bookings (by bookingDate)
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysList = allBookings.filter(b => {
          const date = b.bookingDate || b.booking_date;
          return date && date.startsWith(todayStr);
        });
        setTodaysBookingList(todaysList);
        setTodayBookings(todaysList.length);
         })
      .catch(() => {
        setTodaysBookingList([]);
        setTodayBookings(0);
      });
  }, []);

  // Fetch Pending Approvals
  useEffect(() => {
    axios.get(Global_API_BASE + "/api/admin/pending-approvals")
      .then((res) => setPendingApprovals(res.data))
      .catch((err) => console.error("Error fetching pending approvals:", err));
  }, []);

  // Fetch Top Services
  useEffect(() => {
    axios.get(Global_API_BASE + "/api/admin/top-services")
      .then((res) => setTopServices(res.data))
      .catch((err) => console.error("Error fetching top services:", err));
  }, []);

  // Fetch Top Booked Customers
  useEffect(() => {
    axios.get(Global_API_BASE + "/api/admin/top-booked-customers")
      .then((res) => setTopBookedCustomers(res.data))
      .catch((err) => console.error("Failed to fetch top booked customers:", err));
  }, []);

  // Service report
  useEffect(() => {
    const fetchServiceReportCsv = async () => {
      try {
        const res = await axios.get(Global_API_BASE + "/api/admin/service-report/csv", {
          responseType: "blob",
        });

        const csvText = await res.data.text();
        const rows = csvText.split("\n").slice(1);
        const data = rows.map(row => {
          const [serviceName, totalRevenue, bookingCount] = row.split(",");
          return { serviceName, totalRevenue, bookingCount };
        });

        setServiceCategories(data);
      } catch (err) {
        console.error("Error fetching service report CSV:", err);
      }
    };

    fetchServiceReportCsv();
  }, []);

  //recent activity
  useEffect(() => {
  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get(Global_API_BASE + "/api/admin/recent-activities");
      setRecentActivities(res.data || []);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  fetchRecentActivities();

  // Optional: Refresh every 30 seconds
   
  const interval = setInterval(fetchRecentActivities, 30000);
  return () => clearInterval(interval);
}, []);

    

// ✅ Fetch Today's Bookings (for Today's Schedule)
useEffect(() => {
  const fetchTodaysBookings = async () => {
    try {
      const res = await axios.get(Global_API_BASE + "/api/admin/todays-schedule");
      console.log("Today's Bookings:", res.data);
      setUpcomingBookings(res.data || []);
    } catch (error) {
      console.error("Error fetching today's bookings:", error);
      setUpcomingBookings([]);
    }
  };

  fetchTodaysBookings();
}, []);


  // Fetch Top Rated Services
  useEffect(() => {
    const fetchTopRatedServices = async () => {
      try {
        setLoading(true);
        const res = await axios.get(Global_API_BASE + "/api/admin/top-rated-services");
        setTopRatedServices(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching top rated services:", err);
        setError("Failed to load top rated services");
      } finally {
        setLoading(false);
      }
    };
    fetchTopRatedServices();
  }, []);

 // Fetch Dashboard Overview
    // Fetch Dashboard Overview (all-time)
  useEffect(() => {
    OverviewService.getDashboardOverview()
      .then((res) => {
        const data = res.data || {};
        // backend returns keys: totalAmount, totalBookings, totalCustomers
        setTotalBookings(data.totalBookings || 0);
        setTotalCustomers(data.totalCustomers || 0);
        setTotalAmount(data.totalAmount || 0);
      })
      .catch((err) => console.error('Error fetching dashboard overview:', err));
  }, []);

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'text-coral-600',
      bgColor: 'bg-gradient-to-br from-coral-50 to-coral-100 dark:from-coral-900/20 dark:to-coral-800/20'
    },
    {
      title: 'total amount',
      value: `₹${totalAmount.toLocaleString()}`,
      icon: IndianRupeeIcon,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
    },
  ];

  const quickStats = [
    { label: "Today's Bookings", value: todayBookings.toString(), icon: Calendar, color: 'text-blue-600' },
    { label: "Pending Approvals", value: pendingApprovals.toString(), icon: Clock, color: 'text-yellow-600' },
  ];

  const performanceMetrics = [
    { metric: 'Customer Satisfaction', value: '4.8/5', percentage: 96, color: 'bg-green-500' },
    { metric: 'On-Time Completion', value: '94%', percentage: 94, color: 'bg-blue-500' },
    { metric: 'Service Quality', value: '98%', percentage: 98, color: 'bg-purple-500' },
    { metric: 'Staff Efficiency', value: '92%', percentage: 92, color: 'bg-coral-500' }
  ];

  return (
    <div className="space-y-1 md:space-y-1 py-1 md:py-1">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 overflow-hidden">
              <CardContent className="p-3 md:p-4 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`p-2 md:p-3 rounded-xl ${stat.bgColor} shadow-inner flex-shrink-0`}>
                      <Icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-2 md:ml-3 min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
                    </div>
                  </div>
                  {stat.change && stat.changeType && (
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      {stat.changeType === 'increase' ? (
                        <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                      )}
                      <span className={`text-xs md:text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-all duration-300 border-0">
            <CardContent className="p-3 md:p-4 text-center">
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-tight">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-primary-600" />
              Booking Trends
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly booking performance</p>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="h-64 md:h-80">
              <BookingChart />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/20 dark:to-coral-800/20 p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <IndianRupeeIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-coral-600" />
              Revenue Growth
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue performance</p>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="h-64 md:h-80">
              <RevenueChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories Overview */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Service Categories Performance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overview of top-rated services
              </p>
            </div>
            <Button variant="secondary" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          {loading ? (
            <p className="text-gray-500">Loading services...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : topRatedServices.length === 0 ? (
            <p className="text-gray-500">No top-rated services available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {topRatedServices.map((service, index) => (
                <div
                  key={service.service_id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 md:p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-coral-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={service.service_image_url}
                        alt={service.service_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {service.service_name}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {service.rating.toFixed(1)} ({service.rating_count})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {service.service_type}
                      </div>
                      <div className="mt-2">
                        <Badge variant="info" className="text-xs px-2 py-0.5">
                          ₹{service.service_cost?.toLocaleString() ?? '0'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 md:p-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Award className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-indigo-600" />
            Performance Metrics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Key performance indicators</p>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-xs md:text-sm leading-tight">{metric.metric}</h4>
                  <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${metric.color}`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{metric.percentage}% target achieved</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
    {/* Today's Schedule */}
<Card className="shadow-lg border-0 overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 md:p-4">
    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
      <Timer className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-orange-600" />
      Today's Schedule
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Upcoming bookings for today (excluding completed)
    </p>
  </CardHeader>

  <CardContent className="p-3 md:p-4">
    {upcomingBookings.filter(b => b.bookingStatus?.toLowerCase() !== "completed").length === 0 ? (
      <p className="text-center text-gray-500 text-sm">
        No active bookings scheduled for today.
      </p>
    ) : (
      <div
        className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {upcomingBookings
          //  Filter out completed bookings
          .filter(b => b.bookingStatus?.toLowerCase() !== "completed")
          //  Sort by time if available
          .sort((a, b) => (a.booking_time || "").localeCompare(b.booking_time || ""))
          //  Show up to 5 initially
          .slice(0, 5)
          .map((booking, index) => (
            <div
              key={booking.booking_id || index}
              className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
            >
              {/* Left content */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {booking.customer_name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {booking.booking_service_name}
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{booking.address_line_1}</span>
                </div>
              </div>

              {/* Right content */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500 mb-1">
                  {booking.booking_date}
                </div>
                <Badge
                  variant={
                    booking.bookingStatus?.toLowerCase() === "confirmed"
                      ? "success"
                      : booking.bookingStatus?.toLowerCase() === "pending"
                      ? "warning"
                      : "danger"
                  }
                  className="text-xs capitalize"
                >
                  {booking.bookingStatus}
                </Badge>
              </div>
            </div>
          ))}

        {/*  Optional: show total if more than 5 bookings */}
        {upcomingBookings.filter(b => b.bookingStatus?.toLowerCase() !== "completed").length > 5 && (
          <div className="text-center mt-2 text-xs text-gray-500 italic">
            Showing first 5 bookings — scroll to view more ↓
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>


        

      {/* Recent Activity */}
<Card className="shadow-lg border-0 overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-3 md:p-4">
    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
      <Activity className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-pink-600" />
      Recent Activity
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Latest system activities for today
    </p>
  </CardHeader>

  <CardContent className="p-3 md:p-4">
    {recentActivities.length === 0 ? (
      <p className="text-center text-gray-500 text-sm">
        No recent activity found for today.
      </p>
    ) : (
      <div
        className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {recentActivities
  .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
  .slice(0, 5)
  .map((activity, index) => (
    <div key={index}
      className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300"
    >
              {/* Status Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          activity.bookingStatus === "completed"
            ? "bg-green-100 dark:bg-green-900/20"
            : activity.bookingStatus === "pending"
            ? "bg-yellow-100 dark:bg-yellow-900/20"
            : activity.bookingStatus === "cancelled"
            ? "bg-red-100 dark:bg-red-900/20"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
               {activity.bookingStatus === "completed" ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : activity.bookingStatus === "pending" ? (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        ) : activity.bookingStatus === "cancelled" ? (
          <XCircle className="h-4 w-4 text-red-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-gray-600" />
        )}
      </div>

              {/* Activity Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900 dark:text-white truncate">
          {activity.customer_name} — {activity.booking_service_name}-{activity.bookingStatus}
        </div>
       
      </div>
    </div>
  ))}

        {/* Optional Info Text */}
        {recentActivities.length > 5 && (
          <div className="text-center text-xs text-gray-500 italic mt-2">
            Showing 5 of {recentActivities.length} activities — scroll to view more ↓
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>
      </div>

    

      {/* TopRatedServices & TopCustomers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Rated Services Card */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Star className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-yellow-600" />
                  Top Rated Services
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Most popular services by rating</p>
              </div>
              <Button variant="secondary" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            {loading ? (
              <p className="text-gray-500">Loading top rated services...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : topRatedServices.length === 0 ? (
              <p className="text-gray-500">No top-rated services found.</p>
            ) : (
              <div className="space-y-3">
                {topRatedServices.map((service, index) => (
                  <div
                    key={index}
                    className="group flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600 cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={service.service_image_url}
                        alt={service.service_name}
                        className="w-12 h-12 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-coral-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate text-sm">
                        {service.service_name}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1 font-medium">
                            {service.rating.toFixed(1)}
                          </span>
                        </div>
                        <Badge variant="info" className="text-xs">
                          {service.rating_count} bookings
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{service.service_type}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base md:text-lg font-bold text-primary-600">
                        ₹{service.service_cost}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top booked customers */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-blue-600" />
                  Top Booked Customers
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Highest value customers</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="space-y-3">
              {topBookedCustomers.slice(0, 6).map((customer) => (
                <div
                  key={customer.customer_id}
                  className="group relative flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate text-sm">
                      {customer.customer_name}
                    </h4>
                    <Badge variant="success" className="text-xs mt-1">
                      {customer.booking_count} bookings
                    </Badge>
                  </div>
                  <div className="flex-shrink-0 text-right ml-4">
                    <span className="text-base md:text-lg font-bold text-green-600">
                      ₹{customer.totalAmount?.toLocaleString() ?? 0}
                    </span>
                    <div className="text-xs text-gray-500">Total Spent</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-50 p-3 text-sm">
                    <div><strong>Email:</strong> {customer.customer_email}</div>
                    <div><strong>Phone:</strong> {customer.customer_number}</div>
                    <div><strong>Location:</strong> {customer.address_line_1 || 'N/A'}</div>
                    <div><strong>Bookings:</strong> {customer.booking_count}</div>
                    <div><strong>Total Revenue:</strong> ₹{customer.totalAmount?.toLocaleString() ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-green-600" />
                Recent Bookings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest booking activities</p>
            </div>
            <Button variant="secondary" size="sm">View All Bookings</Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Service</th>
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Date & Time</th>
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Location</th>
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-left pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking, index) => (
                  <tr key={booking.id} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}>
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-coral-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-medium text-xs">
                            {booking.customerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{booking.customerName}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {booking.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{booking.service}</div>
                        <div className="text-xs text-gray-500">{booking.category}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{booking.date}</div>
                      <div className="text-xs text-gray-500">{booking.time} ({booking.duration} min)</div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {booking.address}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={
                        booking.status === 'confirmed' ? 'success' :
                        booking.status === 'pending' ? 'warning' : 'danger'
                      } className="font-medium">
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-base font-bold text-primary-600">₹{booking.price}</td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => navigate('/bookings')}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => console.log('Delete booking', booking.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Footer */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Quick Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Frequently used actions for efficient management</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <Button
                variant="secondary"
                className="flex items-center space-x-2"
                onClick={() => navigate("/services", { state: { openForm: true } })}
              >
                <Wrench className="h-4 w-4" />
                <span>Add Service</span>
              </Button>
              <Button variant="secondary" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Generate Report</span>
              </Button>
              <Button
                variant="secondary"
                className="flex items-center space-x-2"
                onClick={() => setShowRunningOffers(true)}
              >
                <Star className="h-4 w-4" />
                <span>Offers</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {showRunningOffers && (
        <RunningOffersCard
          onClose={() => setShowRunningOffers(false)}
        />
      )}
    </div>
  );
}










