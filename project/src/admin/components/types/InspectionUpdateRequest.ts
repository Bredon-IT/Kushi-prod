// Used when sending a PUT request to /api/bookings/inspections/{id}
export interface InspectionUpdateRequest {
    inspection_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
    booking_amount: number;    // Admin updates this in real-time (new base amount)
    bookingStatus: string;     // The main booking status
    site_visit: 'pending' | 'completed' | 'not completed' | string; // (completed/not completed)
    worker_assign: string;     // Comma-separated list of worker IDs/names
    discount: number;          // New discount value
}