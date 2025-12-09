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
      .then((res: any) => {
        const labels = res.data.labels || res.data.lables;
        const data = res.data.data;
        const combined = labels.map((label: string, index: number) => ({
          name: label,
          revenue: data[index]
        }));
        setChartData(combined);
      })
      .catch((err: any) => console.error('RevenueChart error', err));
  }, []);

  if (!chartData || chartData.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-400">Loading revenue...</div>;
  }

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


