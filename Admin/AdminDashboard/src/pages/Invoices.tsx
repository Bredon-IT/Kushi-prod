import { useState, useEffect, useMemo } from "react";
import {
 FileText,
 Download,
 Mail,
 Search,
 RefreshCw,
 DollarSign,
 Clock,
 ClipboardList,
 ChevronDown,
} from "lucide-react";
// Assuming these UI components are correctly imported from your project structure
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import { Invoice } from "../components/types/Invoice";
import { getAllInvoices } from "../services/InvoiceAPIService";
import { FaWhatsapp } from "react-icons/fa";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- API Service for Payment Status Update ---
// Note: This needs to be correctly exported in its own file (e.g., InvoiceAPIService.ts)
// but is included here for completeness based on the prompt.
export const updateInvoicePaymentStatus = async (id, status) => {
  return fetch(`/api/invoices/${id}/payment-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_status: status }),
  });
};

// --- Custom component for status badge ---
const StatusBadge = ({ status }) => {
  const normalizedStatus = status ? status.toLowerCase() : 'unknown';
  const baseStyle = "px-3 py-1 text-xs font-semibold rounded-full capitalize";

  if (normalizedStatus === "completed") {
    return (
      <span className={`${baseStyle} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>
        Completed
      </span>
    );
  }
  if (normalizedStatus === "pending") {
    return (
      <span className={`${baseStyle} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>
        Pending
      </span>
    );
  }
  if (normalizedStatus === "cancelled") {
    return (
      <span className={`${baseStyle} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>
        Cancelled
      </span>
    );
  }
  return (
    <span className={`${baseStyle} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
      {status || 'Unknown'}
    </span>
  );
};

// --- The main Invoices component ---
export function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Date/Time filter state
  const [filter, setFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [customMonth, setCustomMonth] = useState("");
  // New: Payment Method filter state
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Helper to determine payment status: Check 'payment_status' first, then worker_assign as a fallback for 'unpaid'
  const getInvoicePaymentStatus = (inv) => {
    // Priority 1: Use explicit payment_status from the DTO
    if (inv.payment_status?.toLowerCase() === "paid") return "paid";
    if (inv.payment_status?.toLowerCase() === "unpaid") return "unpaid";

    // Fallback: Use worker_assign if explicit status is missing (legacy logic/proxy)
    return inv.worker_assign && inv.worker_assign.length > 0 ? "paid" : "unpaid";
  };


  // ------------------------
  // Fetch invoices on mount
  // ------------------------
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInvoices();
      // Keep all invoices fetched, but still sort by booking date descending
      setInvoices(
        data
          .sort(
            (a, b) =>
              // Fix 1: Sorting - Use bookingDate
              new Date(b.bookingDate ?? "").getTime() -
              new Date(a.bookingDate ?? "").getTime()
          )
      );
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // ------------------------
  // Filter invoices logic (Memoized for performance)
  // ------------------------
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.booking_id?.toString().includes(searchTerm) ||
        inv.booking_service_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Fix 2: Filtering - Use bookingDate for date filters
      const dateString = inv.bookingDate;
      if (!dateString) return false;

      const bookingDate = new Date(dateString);
      const now = new Date();
      let matchesDateFilter = true;

      // Date Filter
      if (filter === "today") {
        matchesDateFilter = bookingDate.toDateString() === now.toDateString();
      } else if (filter === "week") {
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        matchesDateFilter = bookingDate >= weekStart && bookingDate < weekEnd;
      } else if (filter === "month") {
        matchesDateFilter =
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear();
      } else if (filter === "custom-date" && customDate) {
        matchesDateFilter =
          bookingDate.toDateString() === new Date(customDate).toDateString();
      } else if (filter === "custom-month" && customMonth) {
        const [year, month] = customMonth.split("-").map(Number);
        matchesDateFilter =
          bookingDate.getMonth() + 1 === month &&
          bookingDate.getFullYear() === year;
      }

      // New: Payment Method Filter
      let matchesPaymentMethodFilter = true;
      if (paymentMethodFilter !== "all") {
        // The DTO type defines payment_method as "UPI" | "Credit Card" | "Cash" | "Wallet" | null.
        // The select options match these exact strings.
        matchesPaymentMethodFilter = matchesPaymentMethodFilter && inv.payment_method === paymentMethodFilter;
      }

      return matchesSearch && matchesDateFilter && matchesPaymentMethodFilter;
    });
  }, [invoices, searchTerm, filter, customDate, customMonth, paymentMethodFilter]); // Add paymentMethodFilter to dependencies

  // ------------------------
  // Revenue calculations
  // ------------------------
  const totalRevenue = useMemo(() => filteredInvoices
    .filter((inv) => getInvoicePaymentStatus(inv) === "paid")
    .reduce((sum, inv) => sum + (inv.total_amount ?? inv.grand_total ?? 0), 0), // Use total_amount or grand_total for final amount
    [filteredInvoices]
  );

  const pendingAmount = useMemo(() => filteredInvoices
    .filter((inv) => getInvoicePaymentStatus(inv) === "unpaid")
    .reduce((sum, inv) => sum + (inv.total_amount ?? inv.grand_total ?? 0), 0),
    [filteredInvoices]
  );

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Ensure it handles ISO strings correctly
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ------------------------
  // Generate PDF (Updated to use DTO fields directly)
  // ------------------------
  const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Utility function to add header (as before)
    const addHeader = () => {
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("KUSHI CLEANING SERVICES", pageWidth / 2, margin, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(
        "No 115, GVR Complex, Thambu Chetty Palya Main Rd, Opp. Axis Bank ATM,",
        pageWidth / 2,
        margin + 18,
        { align: "center" }
      );
      doc.text(
        "P and T Layout, Anandapura, Battarahalli, Bengaluru, Karnataka 560049",
        pageWidth / 2,
        margin + 32,
        { align: "center" }
      );
      doc.text(
        "Email: info@kushiservices.in | Phone: +91 9606999081/82/83/84/85",
        pageWidth / 2,
        margin + 48,
        { align: "center" }
      );
      doc.setLineWidth(0.7);
      doc.line(margin, margin + 60, pageWidth - margin, margin + 60);
    };

    // Utility function to add footer (as before)
    const addFooter = () => {
      const footerY = pageHeight - 60;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(
        "Declaration: This is a computer-generated invoice.",
        margin,
        footerY
      );
      doc.text("All details are true and correct.", margin, footerY + 14);
      doc.setFont("times", "bold");
      doc.text("For KUSHI CLEANING SERVICES", pageWidth - margin - 200, footerY);
      doc.setFont("times", "normal");
      doc.text("Authorised Signatory", pageWidth - margin - 150, footerY + 20);
      doc.setFontSize(10);
      doc.text(
        "Excellence Guaranteed | © 2025 Kushi Cleaning Services. All rights reserved.",
        pageWidth / 2,
        pageHeight - 20,
        { align: "center" }
      );
    };

    addHeader();
    let currentY = margin + 80;

    // --- Customer details Table ---
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Customer Details", margin, currentY);
    currentY += 10;

    // Add Invoice/Booking ID & Date Info
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(`Invoice ID: #${invoice.booking_id || 'N/A'}`, pageWidth - margin, currentY + 5, { align: "right" });
    // Fix 4: PDF Generation - Use bookingDate
    doc.text(`Date: ${formatDate(invoice.bookingDate)}`, pageWidth - margin, currentY + 18, { align: "right" });
    currentY += 30; // Move down for the customer info table

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "Customer Name",
          "Phone",
          "Email",
          "Address",
        ],
      ],
      body: [
        [
          invoice.customer_name || "-",
          invoice.customer_number || "-",
          invoice.customer_email || "-",
          `${(invoice).address_line_1 || '-'}, ${(invoice).city || '-'}`, // Removed pincode placeholder, casting to any for missing fields
        ],
      ],
      styles: { font: "times", fontSize: 10, halign: "center", cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });

    currentY = (doc).lastAutoTable.finalY + 30;

    // --- Service details Table (using DTO values directly) ---
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Service & Financial Details", margin, currentY);

    // --- START: UPDATED CALCULATION LOGIC ---
    const baseAmount = invoice.booking_amount ?? 0;
    const discountAmount = invoice.discount ?? 0;
    const totalAmount = invoice.total_amount ?? 0; // Use DTO's total_amount for conditional logic

    let finalTotal;
    if (discountAmount > 0) {
      // If discount exists, use the DTO's total_amount minus the discount as the Grand Total
      finalTotal = totalAmount - discountAmount;
    } else {
      // If no discount, use booking_amount as the Grand Total
      finalTotal = baseAmount;
    }

    // Calculate Tax/Charges based on the new finalTotal
    // Assuming baseAmount - discountAmount is the subtotal before Tax/Charges
    const subTotalBeforeTax = baseAmount - discountAmount;
    // Tax/Charges is the difference between the final calculated total and the subtotal
    const taxAndOther = finalTotal - subTotalBeforeTax;
    // --- END: UPDATED CALCULATION LOGIC ---

    autoTable(doc, {
      startY: currentY + 10,
      head: [
        ["Service Name", "Base Amount (₹)", "Discount (₹)", "Tax/Charges (₹)", "Grand Total (₹)"],
      ],
      body: [
        [
          invoice.booking_service_name || "-",
          baseAmount.toFixed(2),
          discountAmount.toFixed(2),
          // Only show derived tax/charges if it's a positive number.
          (taxAndOther > 0 ? taxAndOther : 0).toFixed(2),
          finalTotal.toFixed(2), // Use the new calculated finalTotal
        ],
      ],
      styles: { font: "times", fontSize: 12, halign: "center", cellPadding: 6 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });

    currentY = (doc).lastAutoTable.finalY + 30;

    // Grand Total Summary
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text(
      `Final Total: INR ${finalTotal.toFixed(2)}`, // Use the new calculated finalTotal
      pageWidth - margin,
      currentY,
      { align: "right" }
    );

    // Payment Status in PDF (using the payment status helper)
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(
      `Payment Status: ${getInvoicePaymentStatus(invoice).toUpperCase()}`,
      margin,
      currentY
    );


    // Booking Status from DTO
    doc.text(
        `Booking Status: ${invoice.bookingStatus?.toUpperCase() || 'N/A'}`,
        margin,
        currentY + 36
    );


    addFooter();
    doc.save(`invoice_${invoice.booking_id}.pdf`);
  };

  // ------------------------
  // Actions
  // ------------------------
  const downloadSelectedInvoices = () => {
    if (selectedInvoices.length === 0) return alert("Select invoices to download.");
    selectedInvoices.forEach((id) => {
      const invoice = invoices.find((inv) => inv.booking_id === id);
      if (invoice) generateInvoicePDF(invoice);
    });
    setSelectedInvoices([]);
  };

  const toggleInvoiceSelection = (id) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedInvoices((prev) =>
      prev.length === filteredInvoices.length && filteredInvoices.length > 0
        ? []
        : filteredInvoices.map((i) => i.booking_id)
    );
  };

  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
        // Optimistic UI update
        setInvoices((prev) =>
            prev.map((i) =>
                i.booking_id === id ? { ...i, payment_status: newStatus } : i
            )
        );
        // Call API
        await updateInvoicePaymentStatus(id, newStatus);
        // Re-fetch/update local state if needed (or rely on optimistic update)
        // Optionally add a success notification here
    } catch (error) {
        console.error("Failed to update payment status:", error);
        // Revert UI change if API fails
        setInvoices((prev) =>
            prev.map((i) =>
                i.booking_id === id ? { ...i, payment_status: i.payment_status } : i
            )
        );
        alert("Failed to update payment status. Please try again.");
    }
  };


  const sendEmail = (invoice) => {
    const finalAmount = (invoice.total_amount ?? invoice.grand_total ?? 0).toFixed(2);
    const subject = `Invoice from KUSHI CLEANING SERVICES for Booking ID ${invoice.booking_id}`;
    const body = `Hello ${invoice.customer_name},\n\nYour invoice details are as follows:\nBooking ID: ${invoice.booking_id}\nService: ${invoice.booking_service_name}\nTotal Amount: ₹${finalAmount}\nPayment Status: ${getInvoicePaymentStatus(
      invoice
    ).toUpperCase()}\nBooking Status: ${invoice.bookingStatus}\n\nThank you for choosing Kushi Cleaning Services!`;
    window.open(
      `mailto:${invoice.customer_email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  };

  const sendWhatsApp = (invoice) => {
    const phoneNumber = invoice.customer_number?.replace(/\D/g, "");
    if (!phoneNumber) return alert("No phone number available.");
    const finalAmount = (invoice.total_amount ?? invoice.grand_total ?? 0).toFixed(2);
    const message = `Hello ${invoice.customer_name},\n\nYour invoice details are:\n*Booking ID:* ${invoice.booking_id}\n*Service:* ${invoice.booking_service_name}\n*Total Amount:* ₹${finalAmount}\n*Payment Status:* ${getInvoicePaymentStatus(
      invoice
    ).toUpperCase()}\n*Booking Status:* ${invoice.bookingStatus}\n\nThank you for choosing Kushi Cleaning Services.`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const downloadCSV = () => {
    const csvData = filteredInvoices.map((inv) => ({
      InvoiceID: inv.booking_id,
      CustomerID: inv.customer_id,
      Name: inv.customer_name,
      Email: inv.customer_email,
      Phone: inv.customer_number,
      Service: inv.booking_service_name,
      BaseAmount: inv.booking_amount ?? 0,
      Discount: inv.discount ?? 0,
      FinalTotalAmount: inv.total_amount ?? inv.grand_total ?? 0,
      PaymentStatus: getInvoicePaymentStatus(inv),

      BookingStatus: inv.bookingStatus,
      // Fix 5: CSV Download - Use bookingDate
      BookingDate: formatDate(inv.bookingDate),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ======================
  // UI - REDESIGN
  // ======================
  return (
    <div className="w-full overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
  <div className="min-w-[950px]">
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-200">
      {/* Header & Main Actions */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 dark:border-gray-800">
        <div className="flex items-center space-x-3">
        
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Invoices Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={downloadSelectedInvoices}
            disabled={selectedInvoices.length === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download {selectedInvoices.length > 0 ? `(${selectedInvoices.length})` : 'Selected'}</span>
          </Button>
          <Button
            onClick={fetchInvoices}
            variant="outline"
            className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total Revenue Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500 dark:border-green-600">
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Paid Revenue
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-0.5">
                ₹{totalRevenue.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            <DollarSign className="h-6 w-6 text-green-500 opacity-30" />
          </CardContent>
        </Card>

        {/* Pending Amount Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-yellow-500 dark:border-yellow-600">
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Pending Amount
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">
                ₹{pendingAmount.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              </div>
            <Clock className="h-6 w-6 text-yellow-500 opacity-30" />
          </CardContent>
        </Card>

        {/* Total Invoices Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500 dark:border-blue-600">
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Filtered Invoices
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {filteredInvoices.length}
              </div>
            </div>
            <ClipboardList className="h-6 w-6 text-blue-500 opacity-30" />
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions Section */}
      <Card className="p-4 shadow-md dark:bg-gray-800">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or service..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white transition duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Payment Method Filter Select (New) */}
          <div className="relative flex items-center">
            <select
              className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 dark:bg-gray-900 dark:border-gray-700 dark:text-white transition duration-150 cursor-pointer"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Wallet">Wallet</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Filter Select */}
          <div className="relative flex items-center">
            <select
              className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 dark:bg-gray-900 dark:border-gray-700 dark:text-white transition duration-150 cursor-pointer"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCustomDate("");
                setCustomMonth("");
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom-date">Custom Date</option>
              <option value="custom-month">Custom Month</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Custom Date Inputs */}
          {filter === "custom-date" && (
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}
          {filter === "custom-month" && (
            <input
              type="month"
              className="border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
            />
          )}

          {/* Download CSV Button */}
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </Button>
        </div>
      </Card>

      {/* Invoice Table */}
      <Card className="shadow-lg dark:bg-gray-800">
        <CardHeader className="p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Invoice List ({filteredInvoices.length})
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                Loading invoices...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No invoices found matching your criteria.
              </div>
            ) : (
              <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={
                          selectedInvoices.length === filteredInvoices.length &&
                          filteredInvoices.length > 0
                        }
                        onChange={selectAll}
                      />
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300">
                      Invoice #
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      Customer
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 hidden lg:table-cell">
                      Service
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300">
                      Booking Status
                    </th>
                     <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300">
                      Payment Status
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredInvoices.map((inv) => {
                    const bookingStatus = inv.bookingStatus;
                    const paymentStatus = getInvoicePaymentStatus(inv);

                    return (
                      <tr
                        key={inv.booking_id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedInvoices.includes(inv.booking_id)
                            ? "bg-blue-50/50 dark:bg-blue-900/30"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-4">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500"
                            checked={selectedInvoices.includes(inv.booking_id)}
                            onChange={() => toggleInvoiceSelection(inv.booking_id)}
                          />
                        </td>
                        <td className="py-2 px-4 font-mono text-blue-600 dark:text-blue-400">
                          #{inv.booking_id}
                        </td>
                        <td className="py-2 px-4 font-medium text-gray-900 dark:text-white hidden md:table-cell">
                          {inv.customer_name}
                        </td>
                        <td className="py-2 px-4 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                          {inv.booking_service_name}
                        </td>
                        <td className="py-2 px-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          {/* Display the formatted booking date */}
                          {formatDate(inv.bookingDate)}
                        </td>
                        <td className="py-2 px-4 font-semibold text-gray-800 dark:text-gray-200">
                          {/* The line you wanted to change is here: */}
                          ₹{(inv.booking_amount ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-4">
                          <StatusBadge status={bookingStatus} />
                        </td>
                        {/* Updated: Editable Payment Status - Payment Method removed from Paid display */}
                        <td className="py-2 px-4">
                          {paymentStatus === "unpaid" ? (
                            <select
                              className="border rounded px-2 py-1 text-sm dark:bg-gray-900 dark:text-white"
                              value={inv.payment_status?.toLowerCase() ?? "unpaid"}
                              onChange={(e) => {
                                // Cast to "Paid" | "Unpaid" for API call
                                const newStatus = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                                handlePaymentStatusChange(inv.booking_id, newStatus);
                              }}
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          ) : (
                               <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>
                                Paid
                             </span>
                          )
                          }
                        </td>
                        <td className="py-2 px-4 flex space-x-2 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateInvoicePDF(inv)}
                            title="Download PDF"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendEmail(inv)}
                            title="Send Email"
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendWhatsApp(inv)}
                            title="Send WhatsApp"
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <FaWhatsapp className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
</div>
</div>
  );
}