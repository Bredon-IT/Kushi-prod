import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";
import Global_API_BASE from "../../services/GlobalConstants";

interface BookingData {
  subcategory: string; // subcategory/type
  completed: number;
  cancelled: number;
  pending: number;
  confirmed: number;
}

interface ServiceCategory {
  category: string;
  type: string;
}

export function CategoryBookingsChart() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [chartData, setChartData] = useState<BookingData[]>([]);

  // Fetch all services for category/subcategory dropdown
  useEffect(() => {
    axios
      .get(Global_API_BASE + "/api/customers/all-services")
      .then((res) => {
        const categories: ServiceCategory[] = res.data.map((s: any) => ({
          category: s.service_category || "General",
          type: s.service_type || "Other",
        }));
        setServices(categories);
      })
      .catch((err) => console.error("Failed to fetch services:", err));
  }, []);

  // Fetch booking stats
  useEffect(() => {
    let params: any = {};
    if (categoryFilter !== "all") params.category = categoryFilter;

    axios
      .get(Global_API_BASE + "/api/admin/category-bookings", { params })
      .then((res) => setChartData(res.data))
      .catch((err) => console.error("CategoryBookingsChart error:", err));
  }, [categoryFilter]);

  const allCategories = Array.from(new Set(services.map((s) => s.category)));
  const subcategories = categoryFilter === "all"
    ? []
    : Array.from(
        new Set(services.filter((s) => s.category === categoryFilter).map((s) => s.type))
      );

  return (
    <div>
      <div className="mb-4 flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Select Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-md px-2 py-1"
        >
          <option value="all">All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {categoryFilter !== "all" && (
          <select className="border rounded-md px-2 py-1 ml-2">
            <option value="all">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="subcategory" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#4ade80" name="Completed" />
            <Bar dataKey="cancelled" fill="#f87171" name="Cancelled" />
            <Bar dataKey="pending" fill="#facc15" name="Pending" />
            <Bar dataKey="confirmed" fill="#60a5fa" name="Confirmed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
