import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatisticsService from '../../services/StatisticsService';
 
interface RevenueData {
  name: string;
  revenue: number;
}
 
export function RevenueChart() {
  const [chartData, setChartData] = useState<RevenueData[]>([]);
 
  useEffect(() => {
    StatisticsService.getStatistics('one-month')
      .then((res) => {
        const labels = res.data.labels || res.data.lables;
 
        const data = res.data.data;
        const combined = labels.map((label: string, index: number) => ({
          name: label,
          revenue: data[index]
        }));
        setChartData(combined);
      })
      .catch(err => console.error('RevenueChart error', err));
  }, []);
 
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#ff5a1f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
 
  
 