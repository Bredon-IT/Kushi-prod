// components/types/Invoice.ts

export interface InvoiceService {
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  // 🔹 Booking Details
  booking_id: number;
  bookingDate: string;
  booking_amount: number;
  total_amount: number;
  discount?: number;
  worker_assign?: boolean;
  bookingStatus: string; // ✅ Added booking status to filter completed bookings

  // 🔹 Customer Details
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_number: string;
  address_line_1: string;

  // 🔹 Booking Service Details
  booking_service_name: string;
  booking_service_type: string;
  booking_service_cost: number;
  booking_service_details: string;
  booking_service_description: string;

  // 🔹 Actual Service Details
  service_id: number;
  service_name: string;
  service_type: string;
  service_cost: number;
  service_details: string;
  service_description: string;
  grand_total?: number;
  payment_status?: string;
  payment_method?: string;
  city?: string;
}
