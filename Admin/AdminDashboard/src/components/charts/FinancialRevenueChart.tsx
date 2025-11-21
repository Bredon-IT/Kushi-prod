import { useEffect, useState } from "react";
import FinancialStatisticsService from "../../services/FinancialStatisticsService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
 
export function FinancialRevenueChart({ filter, startDate, endDate }) {
  const [chartData, setChartData] = useState([]);
 
  useEffect(() => {
    let query = "";
 
    if (filter === "custom" && startDate && endDate) {
      query = `?startDate=${startDate}&endDate=${endDate}`;
    } else {
      query = `?filter=${filter}`;
    }
 
    FinancialStatisticsService.getFinancialStats(query)
      .then((res) => {
        const labels = res.data.labels || [];
        const data = res.data.data || [];
 
        const mapped = labels.map((label, idx) => ({
          name: label,
          revenue: data[idx] || 0
        }));
 
        setChartData(mapped);
      });
  }, [filter, startDate, endDate]);
 
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#4CAF50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
 
 