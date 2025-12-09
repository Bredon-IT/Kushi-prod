import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatisticsService from '../../services/StatisticsService';

interface BookingTrendData {
  name: string;
  bookings: number;
}

export function BookingChart() {
  const [chartData, setChartData] = useState<BookingTrendData[]>([]);

  useEffect(() => {
    StatisticsService.getStatistics('one-month')
      .then((res: any) => {
        const trends = res.data.bookingTrends;
        const formatted = Object.entries(trends).map(([date, count]) => ({
          name: date,
          bookings: Number(count),
        }));
        setChartData(formatted);
      })
      .catch((err: any) => console.error('BookingChart error', err));
  }, []);

  if (!chartData || chartData.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-400">Loading chart...</div>;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

