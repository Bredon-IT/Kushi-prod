import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  PieChart,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RevenueChart } from "../components/charts/RevenueChart";
import { CategoryBookingsChart } from "../components/charts/CategoryBookingsChart";
import OverviewService from "../services/OverviewService";
import axios from "axios";
import ServiceReportAPIService from "../services/ServiceReportAPIService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Global_API_BASE from "../services/GlobalConstants";

export function Financial() {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    monthlyIncome: 0,
    expenses: 0,
    profit: 0,
  });

  const [revenueByService, setRevenueByService] = useState<
    { service: string; revenue: number; percentage: number }[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [expenseBreakdown, setExpenseBreakdown] = useState([
    { category: "Staff Salaries", amount: "" },
    { category: "Equipment & Supplies", amount: "" },
    { category: "Marketing", amount: "" },
    { category: "Transportation", amount: "" },
    { category: "Other", amount: "" },
  ]);

  const [filter, setFilter] = useState<"today" | "month" | "year" | "custom">("month");
  const [customDate, setCustomDate] = useState({ start: "", end: "" });

  useEffect(() => {
    let queryParams = "";
    if (filter === "custom" && customDate.start && customDate.end) {
      queryParams = `?startDate=${customDate.start}&endDate=${customDate.end}`;
    } else {
      queryParams = `?filter=${filter}`;
    }

    OverviewService.getOverview(queryParams)
      .then((res) => {
        const data = res.data;
        setFinancialStats((prev) => ({
          ...prev,
          totalRevenue: data.totalAmount || 0,
        }));
      })
      .catch((err) => console.error("Error fetching financial stats:", err));

    axios
      .get(Global_API_BASE + `/api/admin/revenue-by-service${queryParams}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const validData = data.filter(
          (s: any) => s.serviceName && s.totalRevenue !== null
        );
        const total = validData.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
        const formatted = validData.map((s: any) => ({
          service: s.serviceName,
          revenue: s.totalRevenue || 0,
          percentage: total > 0 ? ((s.totalRevenue || 0) / total) * 100 : 0,
        }));
        setRevenueByService(formatted);
      })
      .catch((err) => console.error("Error fetching revenue by service:", err));
  }, [filter, customDate]);

  const handleExpenseChange = (index: number, value: string) => {
    const updatedExpenses = [...expenseBreakdown];
    updatedExpenses[index].amount = value;

    const totalExpenses = updatedExpenses.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0
    );

    const netProfit = financialStats.totalRevenue - totalExpenses;

    setExpenseBreakdown(updatedExpenses);
    setFinancialStats((prev) => ({
      ...prev,
      expenses: totalExpenses,
      profit: netProfit,
    }));
  };

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

  const handleGeneratePDFReport = () => {
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

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(
      "No 115, GVR Complex, Thambu Chetty Palya Main Rd, Opp. Axis Bank ATM,\nP and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049",
      pageWidth / 2,
      margin + 10,
      { align: "center" }
    );

    doc.text(
      "Email: info@kushiservices.in | Phone: +91 9606999081/82/83/84/85",
      pageWidth / 2,
      margin + 20,
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

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(filterText, pageWidth / 2, margin + 35, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("times", "normal");
    let summaryY = margin + 50;
    doc.text(
      `Total Revenue: ${financialStats.totalRevenue.toLocaleString("en-IN")}`,
      margin,
      summaryY
    );
    summaryY += 8;
    doc.text(
      `Total Expenses: ${financialStats.expenses.toLocaleString("en-IN")}`,
      margin,
      summaryY
    );
    summaryY += 8;
    doc.text(`Net Profit: ${financialStats.profit.toLocaleString("en-IN")}`, margin, summaryY);

    const tableData = revenueByService.map((s) => [
      s.service,
      `${s.revenue.toLocaleString("en-IN")}`,
      `${s.percentage.toFixed(2)}%`,
    ]);

    autoTable(doc, {
      startY: summaryY + 15,
      head: [["Service", "Revenue", "Percentage"]],
      body: tableData,
      styles: {
        font: "times",
        fontSize: 14,
        halign: "center",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        halign: "center",
        fontSize: 14,
      },
      margin: { left: margin, right: margin },
    });

    const footerY = pageHeight - margin + 5;
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(
      "Excellence Guaranteed | © 2025 Kushi Services. All rights reserved.",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`financial_report_${dateStr}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Management
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded-md px-2 py-1 dark:bg-gray-800 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date</option>
          </select>

          {filter === "custom" && (
            <div className="flex space-x-2">
              <input
                type="date"
                value={customDate.start}
                onChange={(e) =>
                  setCustomDate((prev) => ({ ...prev, start: e.target.value }))
                }
                className="border rounded-md px-2 py-1 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="date"
                value={customDate.end}
                onChange={(e) =>
                  setCustomDate((prev) => ({ ...prev, end: e.target.value }))
                }
                className="border rounded-md px-2 py-1 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          <Button onClick={handleExportCSV} disabled={loading} variant="secondary">
            {loading ? "Exporting..." : "Export CSV"}
          </Button>
          <Button onClick={handleGeneratePDFReport}>Generate Report</Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{financialStats.totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{financialStats.expenses.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Net Profit
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{financialStats.profit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Trends
          </h3>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>

      {/* Category-wise Bookings Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category-wise Bookings
          </h3>
        </CardHeader>
        <CardContent>
          <CategoryBookingsChart />
        </CardContent>
      </Card>

      {/* Expense Breakdown & Revenue by Service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Breakdown
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseBreakdown.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-40">
                    {expense.category}
                  </span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={expense.amount}
                    onChange={(e) => handleExpenseChange(index, e.target.value)}
                    className="border rounded-md w-28 p-1 text-sm dark:bg-gray-800 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Service */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue by Service
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByService.length === 0 ? (
                <p className="text-gray-500">No data available</p>
              ) : (
                revenueByService.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {service.service}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{service.revenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
