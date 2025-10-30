import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  Building,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  Wallet,
  Loader2,
  AlertTriangle,
  IndianRupeeIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// Assuming 'react-qrcode-logo' is correctly installed and compatible
import { QRCode } from 'react-qrcode-logo';

// --- Interface Definitions ---
interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  processingFee?: number;
  isAvailable: boolean; // Added for explicit availability control
}

interface CartItem {
  name: string;
  quantity: number;
  discountedPrice: number;
}

interface BookingData {
  totalAmount: number;
  cartItems: CartItem[]; // Changed 'any[]' to 'CartItem[]' for better type safety
  subtotal: number;
  tax: number; // Included for GST/Tax
  totalSavings: number;
  promoDiscount: number;
  // Add other required booking data fields if necessary
}

// --- Payment Component ---
const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // Asserting type for bookingData
  const bookingData = location.state as BookingData | undefined;

  const [selectedMethod, setSelectedMethod] = useState<string>('cash'); // Default to COD
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [showUpiQr, setShowUpiQr] = useState(false);

  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);
  const merchantUpiId = 'kushiservices@ybl'; // Example UPI ID
  const merchantName = 'Kushi Services';

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay securely with your card',
      processingFee: 0,
      isAvailable: false, // Set to false based on original logic
    },
    {
      id: 'upi',
      name: 'UPI / QR Code',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm (Instant)',
      processingFee: 0,
      isAvailable: false, // Set to false based on original logic
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building,
      description: 'Pay through your bank account',
      processingFee: 0,
      isAvailable: false, // Set to false based on original logic
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: Wallet, // Changed to Wallet for COD
      description: 'Pay with cash at the time of service',
      isAvailable: true,
    },
  ];

  if (!bookingData) {
    return (
      <div className="py-28 bg-white min-h-screen">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-300 p-12 text-center">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-navy-900 mb-4">
              Missing Booking Information
            </h1>
            <p className="text-navy-600 mb-6">
              It looks like you skipped a step. Please go back to complete your booking details.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-gradient-to-r from-peach-600 to-navy-700 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Start New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DESTRUCTURE tax HERE (CHANGE 1)
  const { totalAmount, cartItems, subtotal, tax, totalSavings, promoDiscount } = bookingData;
  const paymentMethodDetails = paymentMethods.find(m => m.id === selectedMethod);
  const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR`;
  const qrCodeData = upiLink; // Data for QR code

  const handlePayment = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'cash') {
      placeBooking(); // COD immediately places booking
      return;
    }

    if (selectedMethod === 'upi') {
      if (isMobile) {
        // Open UPI app on mobile
        window.location.href = upiLink;
        // Assume success after opening link (real world needs a callback)
        setIsProcessing(true);
        // Simulate a real-world payment confirmation wait
        await new Promise((resolve) => setTimeout(resolve, 5000));
        placeBooking();
      } else {
        // Show QR code for non-mobile or if user wants QR
        setShowUpiQr(true);
        // On desktop, the user must manually complete the payment via their phone
        // We simulate a successful payment after 10 seconds of showing the QR
        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        placeBooking(); // Simulate successful QR payment
      }
      return;
    }

    // Card or Netbanking (Simulated)
    setIsProcessing(true);
    // Simulate payment gateway processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));
    placeBooking();
  };

  const placeBooking = () => {
    // Logic to update user stats (simulated)
    if (isAuthenticated && user) {
      const updatedUser = {
        ...user,
        // Only increase totalSpent if it was not COD
        totalSpent: selectedMethod === 'cash' ? user.totalSpent : user.totalSpent + totalAmount,
        totalBookings: user.totalBookings + 1,
      };
      localStorage.setItem('kushiUser', JSON.stringify(updatedUser));

      const existingUsers = JSON.parse(localStorage.getItem('kushiUsers') || '[]');
      const updatedUsers = existingUsers.map((u: any) =>
        u.id === user.id ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem('kushiUsers', JSON.stringify(updatedUsers));
    }

    // Clear cart and set success state
    localStorage.removeItem('cart');
    setIsProcessing(false);
    setPaymentCompleted(true);

    // Redirect after a 20-second delay (MODIFIED HERE)
    setTimeout(() => {
      navigate('/services'); // Redirect to a 'My Bookings' page is often better
    }, 20000); // 20 seconds
  };

  const isPrepaid = selectedMethod !== 'cash';

  // --- Payment Success / Confirmation View (MODIFIED CODE BLOCK) ---
  if (paymentCompleted) {
    const isPaymentSuccess = isPrepaid;
    const servicesList = cartItems.map(item => item.name).join(', ');

    return (
      <div className="bg-white  py-10">
        <div className="max-w-xl mx-auto px-4">
          {/* BEGIN: Confirmation Modal Style */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-green-100">
              <CheckCircle size={48} className="text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              Booking Confirmed!
            </h1>

            <p className="text-lg text-navy-600 mb-8">
              Your service request has been successfully logged.
            </p>

            {/* Details Summary Box - Mimicking the Inspection Modal */}
            <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-200 text-left mb-8">
              <h3 className="font-bold text-navy-800 mb-3 border-l-4 border-navy-500 pl-3">
                Details Summary:
              </h3>
              <p className="text-sm text-navy-700">
                <strong className='font-semibold'>Services:</strong> {servicesList}
              </p>
              <p className="text-sm text-navy-700 mt-1">
                <strong className='font-semibold'>Total Amount:</strong> ₹{totalAmount.toLocaleString('en-IN')}
                {isPaymentSuccess && <span className='text-green-600 ml-2'>(Prepaid)</span>}
                {!isPaymentSuccess && <span className='text-yellow-600 ml-2'>(Cash)</span>}
              </p>
            </div>
            {/* END: Details Summary Box */}


            <p className="text-navy-700 mb-8">
              Our scheduling team will be in touch shortly to finalize all details and confirm your appointment time.
              <br />
              <strong className='text-peach-600'>Our team will reach you as soon as possible!</strong>
            </p>

            {/* Action Buttons - Mimicking the Inspection Modal */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/services')}
                className="bg-white text-navy-700 px-6 py-3 rounded-xl font-semibold hover:bg-navy-50 transition-all border border-navy-300 flex items-center gap-2"
              >
                <ArrowLeft size={20} /> Browse Services
              </button>
              <button
                onClick={() => navigate('/bookings')} // Assuming a '/bookings' route exists
                className="bg-navy-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-navy-800 transition-all"
              >
                View Bookings
              </button>
            </div>
            {/* END: Action Buttons */}

          </div>
          {/* END: Confirmation Modal Style */}
        </div>
      </div>
    );
  }

  // --- Main Payment Selection View (No changes needed below this) ---
  return (
    <div className="bg-white  py-5 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header and Back Button */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-2 text-peach-600 hover:text-peach-700 font-medium bg-white px-4 py-2 rounded-xl shadow-md border border-peach-200 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Booking Details
          </button>
          <div className="text-center flex-grow">
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900">
              Secure{' '}
              <span className="bg-gradient-to-r from-peach-300 to-navy-700 bg-clip-text text-transparent">
                Checkout
              </span>
            </h1>
            <p className="text-base text-navy-600 max-w-2xl mx-auto mt-2 hidden sm:block">
              Your payment information is encrypted and protected with SSL.
            </p>
          </div>
          <div className='w-48'></div> {/* Spacer */}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* Payment Method Selection (Left/Main Column) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-navy-100 overflow-hidden">
              <div className="bg-gradient-to-r from-navy-700 to-peach-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Lock size={24} />
                  Select Payment Option
                </h2>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    const isDisabled = !method.isAvailable;
                    const isSelected = selectedMethod === method.id && !isDisabled;

                    return (
                      <div
                        key={method.id}
                        onClick={() => {
                          if (!isDisabled) setSelectedMethod(method.id);
                        }}
                        className={`p-5 rounded-2xl border-2 transition-all relative ${
                          isDisabled
                            ? 'border-gray-300 bg-gray-50 opacity-70 cursor-not-allowed'
                            : isSelected
                            ? 'border-navy-500 bg-navy-50 shadow-inner cursor-pointer'
                            : 'border-peach-200 hover:border-peach-300 hover:bg-peach-50/50 cursor-pointer'
                        }`}
                        title={isDisabled ? 'Coming Soon' : ''}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              isSelected && !isDisabled
                                ? 'bg-navy-600 text-white'
                                : 'bg-peach-100 text-peach-600'
                            }`}
                          >
                            <IconComponent size={24} />
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-bold text-lg ${
                                isDisabled ? 'text-gray-400' : 'text-navy-900'
                              }`}
                            >
                              {method.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                isDisabled ? 'text-gray-400' : 'text-navy-600'
                              }`}
                            >
                              {method.description}
                            </p>
                          </div>
                          {method.processingFee === 0 && !isDisabled && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                              No Fee
                            </span>
                          )}
                        </div>

                        {/* Disabled Overlay */}
                        {isDisabled && (
                          <div className="absolute inset-0 flex items-center justify-center text-navy-500 bg-white/30 rounded-xl">
                            <span className="text-sm font-bold bg-white/70 backdrop-blur-sm px-4 py-1 rounded-full border border-gray-300">
                              Currently Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Conditional Payment Details/Forms */}
                {selectedMethod === 'upi' && !isMobile && showUpiQr && (
                  <div className="bg-navy-50 p-6 rounded-xl border border-navy-200 text-center mb-6">
                    <h4 className="text-xl font-bold text-navy-900 mb-4">Scan & Pay via UPI</h4>
                    <div className="flex flex-col items-center">
                      <QRCode
                        value={qrCodeData}
                        size={200}
                        level="H"
                        bgColor="#ffffff"
                        fgColor="#1e3a8a" // Navy color
                        logoImage="https://example.com/logo-small.png" // Replace with your small logo URL
                        logoWidth={40}
                        logoHeight={40}
                        qrStyle="dots"
                        eyeColor="#f97316" // Peach color
                      />
                      <p className="mt-4 text-navy-700 font-semibold">
                        Amount: ₹{totalAmount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-navy-500 mt-1">
                        UPI ID: {merchantUpiId}
                      </p>
                      <p className="mt-4 text-sm text-red-500">
                        This simulates automatic confirmation. In a real app, you would wait for a server callback.
                      </p>
                    </div>
                  </div>
                )}


                {/* Cash on Delivery Note */}
                {selectedMethod === 'cash' && (
                  <div className="bg-yellow-50 p-6 rounded-xl text-yellow-800 border border-yellow-200 shadow-sm mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={24} className="flex-shrink-0 mt-1"/>
                      <div>
                        <h4 className='font-bold text-lg'>Cash after Service Selected</h4>
                        <p className='text-sm mt-1'>
                          Your booking will be confirmed without immediate payment. Please be prepared to pay the full amount of
                          <strong className='text-navy-900'> ₹{totalAmount.toLocaleString('en-IN')}</strong> to the service provider upon arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing || (selectedMethod === 'upi' && !isMobile && showUpiQr)}
                  className="w-full bg-gradient-to-r from-peach-600 to-navy-700 text-white py-4 rounded-xl text-xl font-extrabold hover:from-peach-700 hover:to-navy-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 transform hover:scale-[1.01]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      {selectedMethod === 'cash' ? 'Placing Booking...' : 'Processing Payment...'}
                    </>
                  ) : (
                    <>
                      <Shield size={24} />
                      {selectedMethod === 'cash'
                        ? 'Confirm Booking (Pay Cash Later)'
                        : `Pay Now ₹${totalAmount.toLocaleString('en-IN')}`}
                    </>
                  )}
                </button>

                {selectedMethod !== 'cash' && (
                  <p className="text-center text-xs text-navy-500 mt-3 flex items-center justify-center gap-1">
                    <Lock size={12} />
                    Secured by Industry-Standard Encryption
                  </p>
                )}

              </div>
            </div>
          </div>

          {/* Payment Summary (Right Column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-peach-200 sticky top-28">
              <h3 className="text-2xl font-bold text-navy-900 mb-6 border-b pb-3 border-peach-100">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-peach-50/70 rounded-lg border border-peach-100"
                  >
                    <div className="flex-1 pr-4">
                      <h4 className="font-semibold text-navy-800 text-base leading-snug">
                        {item.name}
                      </h4>
                      <div className="text-xs text-navy-500 mt-1">
                        <span className='font-medium'>{item.quantity}</span> x ₹{(item.discountedPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right font-bold text-navy-900">
                      ₹{(item.discountedPrice * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t-2 border-navy-100 pt-6 space-y-3">
                <div className="flex justify-between text-base text-navy-700">
                  <span>Subtotal:</span>
                  <span className='font-medium'>₹{subtotal?.toLocaleString('en-IN')}</span>
                </div>

                {/* ADDED TAX LINE (CHANGE 2) */}
                {tax > 0 && (
                  <div className="flex justify-between text-base text-navy-700">
                    <span>GST/Tax:</span>
                    <span className='font-medium'>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {/* END ADDED TAX LINE */}

                {totalSavings > 0 && (
                  <div className="flex justify-between text-base text-green-600 font-semibold">
                    <span>Discount Savings:</span>
                    <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-base text-green-600 font-semibold">
                    <span>Promo Applied:</span>
                    <span>-₹{Math.round(promoDiscount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {paymentMethodDetails?.processingFee === 0 && selectedMethod !== 'cash' && (
                  <div className="flex justify-between text-base text-green-600 font-semibold">
                    <span>Processing Fee:</span>
                    <span>Free</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-peach-200 font-bold text-navy-900 text-2xl">
                  <span>Total Amount:</span>
                  <span className='text-peach-700'>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;