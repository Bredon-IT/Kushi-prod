import React, { useEffect, useState } from "react";
import { getCategoryWiseBookings } from "../../../services/admin/CategoryWiseBookingService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/Card";

interface CategoryBooking {
  serviceCategory: string;
  completedCount: number;
  cancelledCount: number;
}

export const CategoryBookingsChart: React.FC = () => {
  const [data, setData] = useState<CategoryBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoryWiseBookings()
      .then((response) => {
        console.log("Chart Data Response:", response);
        setData(response);
      })
      .catch((error) => console.error("Error fetching category bookings:", error))
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card className="p-4 text-center text-gray-600">Loading chart data...</Card>
    );
  }

  // Empty data state
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl border">
        <p className="text-lg font-medium mb-2">📉 No booking data available</p>
        <p className="text-sm">No completed or cancelled bookings found.</p>
      </Card>
    );
  }

  // Render the chart
  return (
    <Card className="p-6 shadow-lg rounded-2xl border">
      <h3 className="text-lg font-semibold mb-4 text-blue-700">
        Category-wise Completed vs Cancelled Bookings
      </h3>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="serviceCategory"
              angle={-15}
              textAnchor="end"
              interval={0}
              height={70}
              tick={{ fill: "#4B5563", fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completedCount" fill="#16A34A" name="Completed" />
            <Bar dataKey="cancelledCount" fill="#DC2626" name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};


