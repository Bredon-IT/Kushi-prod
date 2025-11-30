// Razorpay Payment Service
import { RAZORPAY_CONFIG, RAZORPAY_SCRIPT_URL } from '../config/razorpay.config';
import Global_API_BASE from './GlobalConstants';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay Script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay Order (Backend API call)
export const createRazorpayOrder = async (amount: number): Promise<any> => {
  try {
    console.log('Creating Razorpay order for amount:', amount);
    console.log('API URL:', `${Global_API_BASE}/api/payment/create-order`);
    
    const requestBody = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: RAZORPAY_CONFIG.CURRENCY,
    };
    console.log('Request body:', requestBody);

    const response = await fetch(`${Global_API_BASE}/api/payment/create-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Failed to create Razorpay order: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('Create Order Error:', error);
    throw error;
  }
};

// Verify Payment Signature (Backend API call)
export const verifyPaymentSignature = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(`${Global_API_BASE}/api/payment/verify-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verified === true;
  } catch (error) {
    console.error('Verify Signature Error:', error);
    return false;
  }
};

// Initialize Razorpay Payment
export const initiateRazorpayPayment = async ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  bookingData,
  onSuccess,
  onFailure,
}: {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingData: any;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}) => {
  try {
    // Step 1: Load Razorpay Script
    console.log('Step 1: Loading Razorpay script...');
    const scriptLoaded = await loadRazorpayScript();
    console.log('Script loaded:', scriptLoaded);
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Step 2: Create Order on Backend
    console.log('Step 2: Creating order...');
    const orderData = await createRazorpayOrder(amount);
    console.log('Order data received:', orderData);

    // Step 3: Configure Razorpay Options
    console.log('Step 3: Configuring Razorpay options...');
    
    // Simplified options matching the working test
    const options: any = {
      key: RAZORPAY_CONFIG.KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: RAZORPAY_CONFIG.MERCHANT_NAME,
      description: 'Service Booking',
      order_id: orderData.id,
      
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      
      theme: {
        color: RAZORPAY_CONFIG.THEME_COLOR,
      },
      
      handler: function (response: any) {
        console.log('Payment handler called with response:', response);
        
        // Verify payment signature on backend
        verifyPaymentSignature({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }).then(isVerified => {
          if (isVerified) {
            onSuccess({
              ...response,
              verified: true,
              order_id: orderData.id,
            });
          } else {
            onFailure({
              error: 'Payment verification failed',
              code: 'VERIFICATION_FAILED',
            });
          }
        }).catch(error => {
          console.error('Verification error:', error);
          onFailure({
            error: 'Payment verification failed',
            code: 'VERIFICATION_FAILED',
          });
        });
      },
      
      modal: {
        ondismiss: function () {
          console.log('Payment modal dismissed');
          onFailure({
            error: 'Payment cancelled by user',
            code: 'USER_CANCELLED',
          });
        }
      },
    };
    
    console.log('Razorpay options configured:', options);

    // Step 4: Open Razorpay Checkout
    console.log('Step 4: Creating Razorpay instance...');
    
    if (typeof window.Razorpay === 'undefined') {
      throw new Error('Razorpay SDK not loaded');
    }
    
    const rzp = new window.Razorpay(options);
    console.log('Razorpay instance created');
    
    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed event:', response.error);
      onFailure({
        error: response.error.description || 'Payment failed',
        code: response.error.code,
      });
    });
    
    console.log('Opening Razorpay modal...');
    rzp.open();
    console.log('Razorpay modal opened');
    
    // Force show Razorpay elements after a short delay
    setTimeout(() => {
      console.log('Forcing Razorpay elements to be visible...');
      const elements = document.querySelectorAll('[id*="razorpay"], [class*="razorpay"], iframe[name*="razorpay"]');
      console.log('Found Razorpay elements:', elements.length);
      
      elements.forEach((el: any) => {
        // Force all visibility styles
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('z-index', '2147483647', 'important'); // Max z-index
        el.style.setProperty('position', 'fixed', 'important');
        
        // Center on screen for container
        if (el.id && el.id.includes('container')) {
          el.style.setProperty('top', '0px', 'important');
          el.style.setProperty('left', '0px', 'important');
          el.style.setProperty('right', '0px', 'important');
          el.style.setProperty('bottom', '0px', 'important');
          el.style.setProperty('width', '100vw', 'important');
          el.style.setProperty('height', '100vh', 'important');
        }
        
        // For backdrop
        if (el.className && el.className.includes('backdrop')) {
          el.style.setProperty('background', 'rgba(0, 0, 0, 0.6)', 'important');
          el.style.setProperty('inset', '0px', 'important');
        }
        
        console.log('Forced visible:', el.tagName, el.id || el.className, {
          computed: window.getComputedStyle(el).display,
          offsetTop: el.offsetTop,
          offsetLeft: el.offsetLeft,
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight
        });
      });
    }, 500);

  } catch (error) {
    console.error('Razorpay Payment Error:', error);
    onFailure(error);
  }
};

// Get Payment Details (for order history)
export const getPaymentDetails = async (paymentId: string): Promise<any> => {
  try {
    const response = await fetch(`${Global_API_BASE}/api/payment/details/${paymentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    return await response.json();
  } catch (error) {
    console.error('Get Payment Details Error:', error);
    throw error;
  }
};

// Refund Payment
export const initiateRefund = async (paymentId: string, amount?: number): Promise<any> => {
  try {
    const response = await fetch(`${Global_API_BASE}/api/payment/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate refund');
    }

    return await response.json();
  } catch (error) {
    console.error('Refund Error:', error);
    throw error;
  }
};
