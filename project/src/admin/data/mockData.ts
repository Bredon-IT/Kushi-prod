export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  category: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  duration: number;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  avatar?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: string;
  rating: number;
  bookingCount: number;
  available: boolean;
  tags: string[];
}

export interface Invoice {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'failed';
  date: string;
  dueDate: string;
  service: string;
}

export const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh@example.com',
    service: 'Home Deep Cleaning',
    category: 'Residential Cleaning',
    date: '2024-01-15',
    time: '10:00',
    status: 'confirmed',
    price: 2500,
    duration: 180,
    address: 'Koramangala, Bangalore'
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@example.com',
    service: 'Office Deep Cleaning',
    category: 'Commercial Cleaning',
    date: '2024-01-16',
    time: '14:30',
    status: 'pending',
    price: 8500,
    duration: 240,
    address: 'Whitefield, Bangalore'
  },
  {
    id: '3',
    customerName: 'Amit Patel',
    customerEmail: 'amit@example.com',
    service: 'Residential Pest Control',
    category: 'Pest Control',
    date: '2024-01-14',
    time: '09:00',
    status: 'cancelled',
    price: 1800,
    duration: 120,
    address: 'Indiranagar, Bangalore'
  },
  {
    id: '4',
    customerName: 'Sunita Reddy',
    customerEmail: 'sunita@example.com',
    service: 'Kitchen Cleaning',
    category: 'Residential Cleaning',
    date: '2024-01-17',
    time: '11:00',
    status: 'confirmed',
    price: 1200,
    duration: 90,
    address: 'HSR Layout, Bangalore'
  },
  {
    id: '5',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram@example.com',
    service: 'Swimming Pool Deep Cleaning',
    category: 'Other Services',
    date: '2024-01-18',
    time: '08:00',
    status: 'confirmed',
    price: 3500,
    duration: 300,
    address: 'Jayanagar, Bangalore'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    address: 'Koramangala, Bangalore',
    joinedDate: '2023-06-15',
    totalBookings: 12,
    totalSpent: 28500,
    status: 'active'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 87654 32109',
    address: 'Whitefield, Bangalore',
    joinedDate: '2023-08-22',
    totalBookings: 8,
    totalSpent: 45200,
    status: 'active'
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 76543 21098',
    address: 'Indiranagar, Bangalore',
    joinedDate: '2023-12-10',
    totalBookings: 3,
    totalSpent: 8500,
    status: 'blocked'
  },
  {
    id: '4',
    name: 'Sunita Reddy',
    email: 'sunita@example.com',
    phone: '+91 65432 10987',
    address: 'HSR Layout, Bangalore',
    joinedDate: '2023-09-05',
    totalBookings: 15,
    totalSpent: 32800,
    status: 'active'
  }
];

export const mockServices: Service[] = [
  // Residential Cleaning
  {
    id: '1',
    title: 'Home Deep Cleaning',
    description: 'Complete deep cleaning of your entire home including all rooms, kitchen, and bathrooms',
    price: 2500,
    duration: 180,
    category: 'Residential Cleaning',
    image: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    bookingCount: 156,
    available: true,
    tags: ['Deep Clean', 'Home', 'Sanitization']
  },
  {
    id: '2',
    title: 'Kitchen Cleaning',
    description: 'Professional kitchen cleaning including appliances, cabinets, and deep sanitization',
    price: 1200,
    duration: 90,
    category: 'Residential Cleaning',
    image: 'https://images.pexels.com/photos/4239013/pexels-photo-4239013.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    bookingCount: 203,
    available: true,
    tags: ['Kitchen', 'Appliances', 'Sanitization']
  },
  {
    id: '3',
    title: 'Bathroom Cleaning',
    description: 'Deep cleaning and sanitization of bathrooms with anti-bacterial treatment',
    price: 800,
    duration: 60,
    category: 'Residential Cleaning',
    image: 'https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.6,
    bookingCount: 189,
    available: true,
    tags: ['Bathroom', 'Sanitization', 'Anti-bacterial']
  },
  {
    id: '4',
    title: 'Sofa Cleaning',
    description: 'Professional sofa and upholstery cleaning with fabric protection',
    price: 1500,
    duration: 120,
    category: 'Residential Cleaning',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    bookingCount: 145,
    available: true,
    tags: ['Sofa', 'Upholstery', 'Fabric Protection']
  },
  {
    id: '5',
    title: 'Carpet Cleaning',
    description: 'Deep carpet cleaning with stain removal and odor elimination',
    price: 1800,
    duration: 150,
    category: 'Residential Cleaning',
    image: 'https://images.pexels.com/photos/4239092/pexels-photo-4239092.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    bookingCount: 167,
    available: true,
    tags: ['Carpet', 'Stain Removal', 'Deep Clean']
  },
  {
    id: '6',
    title: 'Window Cleaning',
    description: 'Professional window cleaning for crystal clear views',
    price: 600,
    duration: 60,
    category: 'Residential Cleaning',
    image: 'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.4,
    bookingCount: 134,
    available: true,
    tags: ['Windows', 'Glass', 'Streak-free']
  },
  
  // Commercial Cleaning
  {
    id: '7',
    title: 'Office Deep Cleaning',
    description: 'Complete office cleaning including workstations, meeting rooms, and common areas',
    price: 8500,
    duration: 240,
    category: 'Commercial Cleaning',
    image: 'https://images.pexels.com/photos/7414032/pexels-photo-7414032.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.9,
    bookingCount: 89,
    available: true,
    tags: ['Office', 'Commercial', 'Workstations']
  },
  {
    id: '8',
    title: 'Factory Deep Cleaning',
    description: 'Industrial cleaning for factories and warehouses with specialized equipment',
    price: 15000,
    duration: 480,
    category: 'Commercial Cleaning',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    bookingCount: 45,
    available: true,
    tags: ['Factory', 'Industrial', 'Warehouse']
  },
  {
    id: '9',
    title: 'Floor Polishing',
    description: 'Professional floor polishing and maintenance for commercial spaces',
    price: 3500,
    duration: 180,
    category: 'Commercial Cleaning',
    image: 'https://images.pexels.com/photos/5824866/pexels-photo-5824866.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.6,
    bookingCount: 78,
    available: true,
    tags: ['Floor', 'Polishing', 'Maintenance']
  },
  
  // Pest Control
  {
    id: '10',
    title: 'Residential Pest Control',
    description: 'Complete pest control treatment for homes including cockroaches, ants, and termites',
    price: 1800,
    duration: 120,
    category: 'Pest Control',
    image: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    bookingCount: 234,
    available: true,
    tags: ['Pest Control', 'Residential', 'Safe Treatment']
  },
  {
    id: '11',
    title: 'Termite Control',
    description: 'Specialized termite treatment and prevention for wooden structures',
    price: 3500,
    duration: 180,
    category: 'Pest Control',
    image: 'https://images.pexels.com/photos/5691456/pexels-photo-5691456.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.6,
    bookingCount: 167,
    available: true,
    tags: ['Termite', 'Wood Protection', 'Prevention']
  },
  {
    id: '12',
    title: 'Commercial Pest Control',
    description: 'Professional pest control solutions for offices and commercial buildings',
    price: 4500,
    duration: 200,
    category: 'Pest Control',
    image: 'https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    bookingCount: 123,
    available: true,
    tags: ['Commercial', 'Office', 'Professional']
  },
  
  // Other Services
  {
    id: '13',
    title: 'Swimming Pool Deep Cleaning',
    description: 'Complete pool cleaning including water treatment and equipment maintenance',
    price: 3500,
    duration: 300,
    category: 'Other Services',
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    bookingCount: 78,
    available: true,
    tags: ['Pool', 'Water Treatment', 'Maintenance']
  },
  {
    id: '14',
    title: 'Water Tank Cleaning',
    description: 'Professional water tank and sump cleaning with sanitization',
    price: 2200,
    duration: 180,
    category: 'Other Services',
    image: 'https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    bookingCount: 92,
    available: true,
    tags: ['Water Tank', 'Sanitization', 'Clean Water']
  },
  {
    id: '15',
    title: 'Sanitization Service',
    description: 'Complete sanitization and disinfection service for homes and offices',
    price: 1500,
    duration: 90,
    category: 'Other Services',
    image: 'https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.9,
    bookingCount: 245,
    available: true,
    tags: ['Sanitization', 'Disinfection', 'Health']
  },
  
  // Packers and Movers
  {
    id: '16',
    title: 'Home Relocation Service',
    description: 'Complete packing and moving service for household items with insurance',
    price: 12000,
    duration: 480,
    category: 'Packers and Movers',
    image: 'https://images.pexels.com/photos/7464230/pexels-photo-7464230.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    bookingCount: 92,
    available: true,
    tags: ['Packing', 'Moving', 'Insurance', 'Household']
  },
  {
    id: '17',
    title: 'Office Relocation',
    description: 'Professional office moving service with minimal downtime',
    price: 25000,
    duration: 600,
    category: 'Packers and Movers',
    image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    bookingCount: 34,
    available: true,
    tags: ['Office', 'Commercial', 'Professional']
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'KS-001',
    bookingId: '1',
    customerName: 'Rajesh Kumar',
    amount: 2500,
    status: 'paid',
    date: '2024-01-15',
    dueDate: '2024-01-30',
    service: 'Home Deep Cleaning'
  },
  {
    id: 'KS-002',
    bookingId: '2',
    customerName: 'Priya Sharma',
    amount: 8500,
    status: 'unpaid',
    date: '2024-01-16',
    dueDate: '2024-01-31',
    service: 'Office Deep Cleaning'
  },
  {
    id: 'KS-003',
    bookingId: '3',
    customerName: 'Amit Patel',
    amount: 1800,
    status: 'failed',
    date: '2024-01-14',
    dueDate: '2024-01-29',
    service: 'Residential Pest Control'
  },
  {
    id: 'KS-004',
    bookingId: '4',
    customerName: 'Sunita Reddy',
    amount: 1200,
    status: 'paid',
    date: '2024-01-17',
    dueDate: '2024-02-01',
    service: 'Kitchen Cleaning'
  }
];

export const dashboardStats = {
  totalBookings: 456,
  totalCustomers: 189,
  revenueThisMonth: 285400,
  servicesOffered: 35,
  bookingTrends: [
    { name: 'Jan', bookings: 65, revenue: 185000 },
    { name: 'Feb', bookings: 78, revenue: 220000 },
    { name: 'Mar', bookings: 89, revenue: 245000 },
    { name: 'Apr', bookings: 95, revenue: 268000 },
    { name: 'May', bookings: 123, revenue: 285400 },
    { name: 'Jun', bookings: 156, revenue: 320000 }
  ],
  serviceCategories: [
    { name: 'Residential Cleaning', count: 245, revenue: 485000, image: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Commercial Cleaning', count: 89, revenue: 756000, image: 'https://images.pexels.com/photos/7414032/pexels-photo-7414032.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Pest Control', count: 156, revenue: 280800, image: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Other Services', count: 45, revenue: 157500, image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Packers and Movers', count: 23, revenue: 276000, image: 'https://images.pexels.com/photos/7464230/pexels-photo-7464230.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ]
};