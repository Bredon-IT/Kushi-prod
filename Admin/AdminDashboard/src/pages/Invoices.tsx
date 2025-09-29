import { useState, useEffect } from "react";
import { FileText, Download, Mail, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Invoice } from "../components/types/Invoice";
import { getAllInvoices } from "../services/InvoiceAPIService";
import { FaWhatsapp } from "react-icons/fa";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [customMonth, setCustomMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);

  // ------------------------
  // Fetch invoices on mount
  // ------------------------
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInvoices();
      // Filter only completed bookings and sort by date
      setInvoices(
        data
          .filter((inv) => inv.bookingStatus?.toLowerCase() === "completed")
          .sort(
            (a, b) =>
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

  const getInvoiceStatus = (inv: Invoice) =>
    inv.worker_assign ? "paid" : "unpaid";

  // ------------------------
  // Filter invoices
  // ------------------------
  const completedInvoices = invoices; // Already filtered in fetch
  const filteredInvoices = completedInvoices.filter((inv) => {
    const matchesSearch =
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.booking_id?.toString().includes(searchTerm);

    const bookingDate = new Date(inv.bookingDate);
    const now = new Date();
    let matchesFilter = true;

    if (filter === "today") {
      matchesFilter = bookingDate.toDateString() === now.toDateString();
    } else if (filter === "week") {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      matchesFilter = bookingDate >= weekStart && bookingDate <= weekEnd;
    } else if (filter === "month") {
      matchesFilter =
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear();
    } else if (filter === "custom-date" && customDate) {
      matchesFilter =
        bookingDate.toDateString() === new Date(customDate).toDateString();
    } else if (filter === "custom-month" && customMonth) {
      const [year, month] = customMonth.split("-").map(Number);
      matchesFilter =
        bookingDate.getMonth() + 1 === month &&
        bookingDate.getFullYear() === year;
    }

    return matchesSearch && matchesFilter;
  });

  // ------------------------
  // Revenue calculations
  // ------------------------
  const totalRevenue = filteredInvoices
    .filter((inv) => getInvoiceStatus(inv) === "paid")
    .reduce((sum, inv) => sum + (inv.booking_amount ?? 0), 0);

  const pendingAmount = filteredInvoices
    .filter((inv) => getInvoiceStatus(inv) === "unpaid")
    .reduce((sum, inv) => sum + (inv.booking_amount ?? 0), 0);

  // ------------------------
  // Generate PDF
  // ------------------------
  const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("KUSHI CLEANING SERVICES", pageWidth / 2, margin, {
        align: "center",
      });
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
    addFooter();

    let currentY = margin + 80;

    // Customer details
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Customer Details", margin, currentY);
    currentY += 10;
    autoTable(doc, {
      startY: currentY + 10,
      head: [
        [
          "Customer Name",
          "Customer ID",
          "Booking ID",
          "Invoice ID",
          "Phone",
          "Email",
          "Address",
        ],
      ],
      body: [
        [
          invoice.customer_name || "-",
          invoice.customer_id || "-",
          invoice.booking_id || "-",
          invoice.booking_id || "-",
          invoice.customer_number || "-",
          invoice.customer_email || "-",
          invoice.address_line_1 || "-",
        ],
      ],
      styles: { font: "times", fontSize: 12, halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });

    currentY = (doc as any).lastAutoTable.finalY + 30;

    // Service details
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Service Details", margin, currentY);
    autoTable(doc, {
      startY: currentY + 10,
      head: [["Service Name", "Base Amount", "GST (18%)", "Discount", "Total Amount"]],
      body: [
        [
          invoice.booking_service_name || "-",
          invoice.booking_amount?.toFixed(2) || "0.00",
          (invoice.booking_amount * 0.18).toFixed(2),
          invoice.discount?.toFixed(2) || "0.00",
          `INR ${invoice.totalAmount?.toFixed(2) || "0.00"}`,
        ],
      ],
      styles: { font: "times", fontSize: 12, halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });

    currentY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text(
      `Grand Total: INR ${invoice.totalAmount?.toFixed(2) || "0.00"}`,
      pageWidth - margin - 150,
      currentY
    );

    addFooter();
    doc.save(`invoice_${invoice.booking_id}.pdf`);
  };

  // ------------------------
  // Actions
  // ------------------------
  const downloadSelectedInvoices = () => {
    selectedInvoices.forEach((id) => {
      const invoice = invoices.find((inv) => inv.booking_id === id);
      if (invoice) generateInvoicePDF(invoice);
    });
  };

  const toggleInvoiceSelection = (id: number) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedInvoices((prev) =>
      prev.length === invoices.length ? [] : invoices.map((i) => i.booking_id)
    );
  };

  const sendEmail = (invoice: Invoice) => {
    const subject = `Invoice for Booking ID ${invoice.booking_id}`;
    const body = `Hello ${invoice.customer_name},\nBooking ID: ${invoice.booking_id}\nService: ${invoice.booking_service_name}\nAmount: ₹${invoice.booking_amount}\nStatus: ${getInvoiceStatus(invoice)}`;
    window.open(
      `mailto:${invoice.customer_email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  };

  const sendWhatsApp = (invoice: Invoice) => {
    const phoneNumber = invoice.customer_number?.replace(/\D/g, "");
    if (!phoneNumber) return alert("No phone number available.");
    const message = `Hello ${invoice.customer_name},\nBooking ID: ${invoice.booking_id}\nService: ${invoice.booking_service_name}\nAmount: ₹${invoice.booking_amount}\nStatus: ${getInvoiceStatus(invoice)}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const downloadCSV = () => {
    const csvData = filteredInvoices.map((inv) => ({
      InvoiceID: inv.booking_id,
      CustomerID: inv.customer_id,
      Name: inv.customer_name,
      Email: inv.customer_email,
      Phone: inv.customer_number,
      Service: inv.booking_service_name,
      Amount: inv.booking_amount,
      Status: inv.bookingStatus,
      BookingDate: new Date(inv.bookingDate).toLocaleDateString(),
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
  // UI
  // ======================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invoices Management
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={downloadSelectedInvoices}>Download Selected</Button>
          <Button onClick={fetchInvoices}>Refresh</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Revenue
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              ₹{pendingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending Amount
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {filteredInvoices.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom-date">Custom Date</option>
            <option value="custom-month">Custom Month</option>
          </select>

          {filter === "custom-date" && (
            <input
              type="date"
              className="border rounded-lg px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}
          {filter === "custom-month" && (
            <input
              type="month"
              className="border rounded-lg px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
            />
          )}

          <Button onClick={downloadCSV}>Download CSV</Button>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invoice List ({filteredInvoices.length})
          </h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6">Loading invoices...</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedInvoices.length === filteredInvoices.length &&
                          filteredInvoices.length > 0
                        }
                        onChange={selectAll}
                      />
                    </th>
                    <th className="py-2 px-3 text-sm">Invoice #</th>
                    <th className="py-2 px-3 text-sm">Customer ID</th>
                    <th className="py-2 px-3 text-sm">Name</th>
                    <th className="py-2 px-3 text-sm">Email</th>
                    <th className="py-2 px-3 text-sm">Phone</th>
                    <th className="py-2 px-3 text-sm">Service</th>
                    <th className="py-2 px-3 text-sm">Amount</th>
                    <th className="py-2 px-3 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.booking_id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(inv.booking_id)}
                          onChange={() => toggleInvoiceSelection(inv.booking_id)}
                        />
                      </td>
                      <td className="py-2 px-3">{inv.booking_id}</td>
                      <td className="py-2 px-3">{inv.customer_id}</td>
                      <td className="py-2 px-3">{inv.customer_name}</td>
                      <td className="py-2 px-3">{inv.customer_email}</td>
                      <td className="py-2 px-3">{inv.customer_number}</td>
                      <td className="py-2 px-3">{inv.booking_service_name}</td>
                      <td className="py-2 px-3">₹{inv.booking_amount?.toFixed(2)}</td>
                      <td className="py-2 px-3">
                       
                      </td>
                      <td className="py-2 px-3 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => generateInvoicePDF(inv)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => sendEmail(inv)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => sendWhatsApp(inv)}
                        >
                          <FaWhatsapp className="h-4 w-4 text-green-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
