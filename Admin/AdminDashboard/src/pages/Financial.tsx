import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Search as SearchIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RevenueChart } from "../components/charts/RevenueChart";
import { CategoryBookingsChart } from "../components/charts/CategoryBookingsChart";
import OverviewService from "../services/OverviewService";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Global_API_BASE from "../services/GlobalConstants";



/*
  Updated Financial page
  - Removed Total Expenses card
  - Moved period filter to top (remains there)
  - Added a second (compact) period selector above Revenue by Service list
  - Revenue by Service shows top 5 by default, "See more" toggles remaining items
  - CSV & PDF export preserved
*/

const formatDateForDisplay = (rawDateString?: string) => {
  if (!rawDateString) return "N/A";
  try {
    const d = new Date(rawDateString);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "N/A";
  }
};

export function Financial() {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    monthlyIncome: 0,
    profit: 0,
  });

  const [revenueByService, setRevenueByService] = useState<
    { service: string; revenue: number; percentage: number }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"today" | "month" | "year" | "custom">(
    "month"
  );
  const [customDate, setCustomDate] = useState({ start: "", end: "" });
  const [search, setSearch] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);

  useEffect(() => {
    let queryParams = "";
    if (filter === "custom" && customDate.start && customDate.end) {
      queryParams = `?startDate=${customDate.start}&endDate=${customDate.end}`;
    } else {
      queryParams = `?filter=${filter}`;
    }

    setLoading(true);
    OverviewService.getOverview(queryParams)
      .then((res: any) => {
        const data = res.data || {};
        setFinancialStats((prev) => ({
          ...prev,
          totalRevenue: data.totalAmount ?? prev.totalRevenue,
          monthlyIncome: data.monthlyIncome ?? prev.monthlyIncome,
          profit: data.profit ?? prev.profit,
        }));
      })
      .catch((err) => console.error("Error fetching financial stats:", err))
      .finally(() => setLoading(false));

    axios
      .get(Global_API_BASE + `/api/admin/revenue-by-service${queryParams}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const validData = data.filter(
          (s: any) =>
            (s.serviceName || s.service) &&
            (s.totalRevenue !== undefined || s.revenue !== undefined)
        );
        const total = validData.reduce(
          (sum, s) => sum + (s.totalRevenue ?? s.revenue ?? 0),
          0
        );
        const formatted = validData
          .map((s: any) => ({
            service: s.serviceName ?? s.service,
            revenue: s.totalRevenue ?? s.revenue ?? 0,
            percentage: total > 0 ? ((s.totalRevenue ?? s.revenue ?? 0) / total) * 100 : 0,
          }))
          .sort((a, b) => b.revenue - a.revenue);
        setRevenueByService(formatted);
      })
      .catch((err) => console.error("Error fetching revenue by service:", err));
  }, [filter, customDate]);

  const handleExportCSV = () => {
    if (!revenueByService.length) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Service", "Revenue (₹)", "Percentage (%)"];
    const rows = revenueByService.map((service) => [
      service.service,
      service.revenue.toLocaleString("en-IN"),
      service.percentage.toFixed(2),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute(
      "download",
      `kushi_financial_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.setAttribute("href", encodedUri);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePDFReport = async () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(0, 0, 0);
    doc.rect(
      margin - 5,
      margin - 5,
      pageWidth - (margin - 5) * 2,
      pageHeight - (margin - 5) * 2
    );

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Kushi Services", pageWidth / 2, margin, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(
      "No 115, GVR Complex, Thambu Chetty Palya Main Rd, Opp. Axis Bank ATM, Bengaluru, Karnataka",
      pageWidth / 2,
      margin + 8,
      { align: "center" }
    );

    const filterText =
      filter === "today"
        ? "Today's Report"
        : filter === "month"
        ? "This Month's Report"
        : filter === "year"
        ? "This Year's Report"
        : `Custom Report (${customDate.start} to ${customDate.end})`;

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text(filterText, pageWidth / 2, margin + 22, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("times", "normal");
    let y = margin + 36;
    doc.text(
      `Total Revenue: ₹${financialStats.totalRevenue.toLocaleString("en-IN")}`,
      margin,
      y
    );
    y += 8;
    doc.text(`Net Profit: ₹${financialStats.profit.toLocaleString("en-IN")}`, margin, y);

    const tableData = revenueByService.map((s) => [
      s.service,
      `${s.revenue.toLocaleString("en-IN")}`,
      `${s.percentage.toFixed(2)}%`,
    ]);

    autoTable(doc, {
      startY: y + 10,
      head: [["Service", "Revenue", "Percentage"]],
      body: tableData,
      styles: {
        font: "times",
        fontSize: 10,
        halign: "center",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        halign: "center",
        fontSize: 11,
      },
      margin: { left: margin, right: margin },
    });

    const footerY = pageHeight - margin + 5;
    doc.setFontSize(10);
    doc.text(
      "Excellence Guaranteed | © 2025 Kushi Services. All rights reserved.",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`financial_report_${dateStr}.pdf`);
  };

  // Filtered revenue list by search
  const filteredRevenue = revenueByService.filter((r) =>
    r.service.toLowerCase().includes(search.trim().toLowerCase())
  );

  const topServices = filteredRevenue.slice(0, 5);
  const extraServices = filteredRevenue.slice(5);

  return (
    <div className="w-full overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
  <div className="min-w-[950px]">
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-sm text-gray-500">Overview, revenue breakdown and exports</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md overflow-hidden">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 bg-white text-sm"
            >
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date</option>
            </select>
            {filter === "custom" && (
              <div className="flex items-center gap-2 px-3">
                <input
                  type="date"
                  value={customDate.start}
                  onChange={(e) => setCustomDate((p) => ({ ...p, start: e.target.value }))}
                  className="text-sm"
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="date"
                  value={customDate.end}
                  onChange={(e) => setCustomDate((p) => ({ ...p, end: e.target.value }))}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="secondary" disabled={loading}>
              {loading ? "Exporting..." : "Export CSV"}
            </Button>
            <Button onClick={handleGeneratePDFReport}>Generate Report</Button>
          </div>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold">₹{financialStats.totalRevenue.toLocaleString("en-IN")}</div>
              <div className="text-xs text-gray-400 mt-1">As per selected period</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Net Profit</div>
              <div className="text-2xl font-bold">₹{financialStats.profit.toLocaleString("en-IN")}</div>
              <div className="text-xs text-gray-400 mt-1">Revenue minus expenses</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Selected Period</div>
              <div className="text-base font-semibold">
                {filter === "custom"
                  ? `${formatDateForDisplay(customDate.start)} — ${formatDateForDisplay(customDate.end)}`
                  : filter}
              </div>
              <div className="text-xs text-gray-400 mt-1">Use filters to adjust data</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Revenue Trends</h3>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>

      
{/* Category-wise Completed vs Cancelled Bookings */}
<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold">Category-wise Bookings</h3>
  </CardHeader>
  <CardContent>
    <CategoryBookingsChart />
  </CardContent>
</Card>



      {/* Compact period selector above Revenue by Service */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-700">Period</div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-10 pr-3 py-2 border rounded-md w-56 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Revenue by Service (top 5 + see more) */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Revenue by Service</h3>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {topServices.length === 0 ? (
              <div className="text-gray-500">No services match your search.</div>
            ) : (
              <>
                {topServices.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{service.service}</div>
                        <div className="text-sm text-gray-600">₹{service.revenue.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, service.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {showAllServices && extraServices.map((service, idx) => (
                  <div key={`extra-${idx}`} className="flex items-center justify-between gap-4 mt-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{service.service}</div>
                        <div className="text-sm text-gray-600">₹{service.revenue.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, service.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {extraServices.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => setShowAllServices((s) => !s)}
                      variant="ghost"
                    >
                      {showAllServices ? "Show less" : `See more (${extraServices.length})`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
    </div>
  );
}
