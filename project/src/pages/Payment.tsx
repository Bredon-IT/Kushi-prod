import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  Building,
  Shield,
  CheckCircle,
  ArrowLeft,
  Wallet,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Global_API_BASE from '../services/GlobalConstants';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  processingFee?: number;
}

const Payment: React.FC = () => {

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);


  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    bookingData,
    totalAmount,
    cartItems,
    subtotal,
    tax,
    totalSavings,
    promoDiscount
  } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ❗ If no booking data
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">No Booking Found</h1>
          <p className="text-gray-600 mt-2">Please complete the booking first.</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 bg-navy-700 text-white px-4 py-2 rounded-md"
          >
            Go to Services
          </button>
        </div>
      </div>
    );
  }

  // Payment options (only COD enabled)
  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, MasterCard, Amex' },
    { id: 'upi', name: 'UPI / QR Code', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All Major Banks' },
    { id: 'cash', name: 'Pay On Service', icon: Wallet, description: 'Pay during service' },
  ];

  // ⭐ Handle Pay / Confirm Booking
  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    if (selectedMethod !== 'cash') {
      await new Promise(res => setTimeout(res, 2000));
    }

    await saveBookingToDB();
  };

  // ⭐ Save booking to backend with paymentMethod + paymentStatus
  const saveBookingToDB = async () => {
    try {
      const response = await fetch(Global_API_BASE + '/api/bookings/newbookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          paymentMethod: selectedMethod,
          paymentStatus: selectedMethod === 'cash' ? 'Pending' : 'Paid'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save booking');
      }

      // Update user stats
      if (isAuthenticated && user) {
        const updatedUser = {
          ...user,
          totalSpent:
            selectedMethod === 'cash'
              ? user.totalSpent || 0
              : (user.totalSpent || 0) + Number(totalAmount || 0),
          totalBookings: (user.totalBookings || 0) + 1,
        };

        localStorage.setItem('kushiUser', JSON.stringify(updatedUser));
      }

      // Clear cart & booking session
       localStorage.removeItem('kushiServicesCart');     // remove main cart
       localStorage.removeItem('kushiBookingSession');   // remove booking page temporary cart


      setPaymentSuccess(true);
      setIsProcessing(false);

      setTimeout(() => navigate('/services'), 3000);
    } catch (error) {
      console.error('Booking Save Error:', error);
      setIsProcessing(false);
      alert('Payment succeeded but booking failed. Contact support.');
    }
  };

  // ⭐ Success Page
  if (paymentSuccess) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const serviceName =
      cartItems?.[0]?.name ||
      cartItems?.[0]?.booking_service_name ||
      'Service';

     

    return (
      <div className="bg-white py-2 flex items-center justify-center">
        <div className="p-8 border rounded-xl shadow-xl text-center max-w-md bg-white">
          <CheckCircle className="text-green-600 mx-auto" size={60} />
          <h2 className="text-3xl font-bold mt-4">Booking Confirmed!</h2>
          <p className="mt-3 text-gray-700">
            Thanks for choosing Kushi Services.<br />
            Your booking for{' '}
            <span className="font-semibold text-green-600">{serviceName}</span>{' '}
            is placed. Our team will reach you soon.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Redirecting in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  // ⭐ Main Payment Page
  return (
    <div className="bg-gray-50 pt-6 pb-10">
      <div className="max-w-6xl mx-auto px-4">

        {/* Back Button */}
        <button
          onClick={() => navigate('/booking', { state: bookingData })}
          className="flex items-center gap-2 text-gray-700 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — Payment Methods */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border">
            <div className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Select Payment Option</h2>
            </div>

            <div className="p-6 space-y-3">

              {paymentMethods.map(method => {
                const IconComp = method.icon;
                const disabled = method.id !== 'cash';

                return (
                  <div
                    key={method.id}
                    onClick={() => !disabled && setSelectedMethod(method.id)}
                    className={`p-4 border rounded-md flex items-center gap-4 relative
                      ${disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-navy-700'}
                      ${selectedMethod === method.id ? 'border-navy-700 bg-blue-50' : 'border-gray-300'}
                    `}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        selectedMethod === method.id && !disabled
                          ? 'bg-navy-700 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <IconComp size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">{method.name}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>

                    {disabled && (
                      <span className="absolute right-3 top-3 text-xs px-2 py-1 bg-white border rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                );
              })}

              {/* COD Notice */}
              {selectedMethod === 'cash' && (
                <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-md text-sm mt-4">
                  Pay ₹{Number(totalAmount || 0).toLocaleString('en-IN')} in cash at service time.
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="mt-6 w-full bg-navy-700 text-white py-3 rounded-md font-bold shadow-md disabled:opacity-60"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </span>
                ) : selectedMethod === 'cash' ? (
                  'Confirm Booking (Pay Later)'
                ) : (
                  `Pay ₹${Number(totalAmount || 0).toLocaleString('en-IN')}`
                )}
              </button>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg border lg:sticky lg:top-6">
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Order Summary</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto text-sm mb-3">
              {cartItems?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-gray-700">
                  <span>{item.name || item.booking_service_name}</span>
                  <span className="font-semibold">
                    ₹{Number(item.discountedPrice || item.price || item.booking_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{Number(subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>+₹{Number(tax || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount:</span>
                  <span>-₹{Number(promoDiscount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-navy-700">
                  ₹{Number(totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;
