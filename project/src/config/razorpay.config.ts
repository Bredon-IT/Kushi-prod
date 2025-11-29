// Razorpay Configuration
// ⚠️ SECURITY: Only include PUBLIC key (KEY_ID) in frontend
// Secret key (KEY_SECRET) should NEVER be in frontend code

import Global_API_BASE from '../services/GlobalConstants';

// Runtime configuration - will be loaded from backend API
let razorpayKeyId: string = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RkHRDGTuES94mq';

/**
 * Initialize Razorpay configuration from backend
 * Call this on app load to fetch the Razorpay Key ID from AWS Secrets Manager
 */
export const initRazorpayConfig = async (): Promise<void> => {
  try {
    const response = await fetch(`${Global_API_BASE}/api/config/razorpay`);
    if (response.ok) {
      const data = await response.json();
      razorpayKeyId = data.keyId || razorpayKeyId;
      console.log('✅ Razorpay configuration loaded from backend');
    } else {
      console.warn('⚠️ Failed to load Razorpay config from backend, using fallback');
    }
  } catch (error) {
    console.error('❌ Error loading Razorpay config:', error);
    console.log('Using fallback Razorpay Key ID from environment variable');
  }
};

/**
 * Get the current Razorpay Key ID
 */
export const getRazorpayKeyId = (): string => razorpayKeyId;

export const RAZORPAY_CONFIG = {
  // ✅ PUBLIC Key - Safe to expose in frontend (loaded from backend at runtime)
  get KEY_ID() {
    return razorpayKeyId;
  },
  
  // ❌ DO NOT include KEY_SECRET here - it belongs in backend only!
  // Backend handles: razorpay.key.secret=${RAZORPAY_KEY_SECRET}
  
  // Business Details
  MERCHANT_NAME: 'Kushi Hygiene Services',
  MERCHANT_LOGO: 'https://kushiservices.com/logo.png', // Update with actual logo URL
  
  // Theme Colors
  THEME_COLOR: '#1e3a8a', // navy-700
  
  // Other Settings
  CURRENCY: 'INR',
  CONTACT_EMAIL: 'support@kushiservices.com',
  CONTACT_PHONE: '+919876543210', // Update with actual number
  
  // Enable/Disable Payment Methods
  PAYMENT_METHODS: {
    card: true,
    netbanking: true,
    wallet: true,
    upi: true,
    paylater: false,
    cardless_emi: false,
  },
};

// Razorpay Script URL
export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
