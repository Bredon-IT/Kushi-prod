import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
 
interface CartItem {
  id: string;
  name: string;
  price: number;        // Only actual price now
  rating: number;
  reviews: string;
  description: string;
  category: string;
  subcategory: string;
  tier: string;
  quantity: number;
  duration: string;
}
 
// LocalStorage helpers
const getCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('kushiServicesCart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};
 
const saveCartToStorage = (cart: CartItem[]) => {
  const cartWithPrices = cart.map(item => ({
    ...item,
    discountedPrice: item.price,
    originalPrice: item.price  // or any original price if you have discount logic
  }));
  localStorage.setItem('kushiServicesCart', JSON.stringify(cartWithPrices));
};

 
const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(getCartFromStorage);
  const [isProcessing, setIsProcessing] = useState(false);
 
  const updateQuantity = (id: string, newQuantity: number) => {
    const newCart = newQuantity === 0
      ? cart.filter(item => item.id !== id)
      : cart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item);
    setCart(newCart);
    saveCartToStorage(newCart);
  };
 
  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    saveCartToStorage(newCart);
  };
 
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
 
  const handleProceedToBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking', {
        state: {
          cartItems: cart,
          totalAmount: total,
          subtotal: subtotal,
          tax: tax
        }
      });
    }, 1500);
  };
 
  if (cart.length === 0) {
    return (
      <div className="bg-pink-50 min-h-screen py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl p-12 shadow-xl border-2 border-peach-200">
            <div className="bg-gradient-to-r from-peach-100 to-navy-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart size={48} className="text-navy-600" />
            </div>
            <h1 className="text-4xl font-bold text-navy-900 mb-6">Your Cart is Empty</h1>
            <p className="text-xl text-navy-600 mb-8 max-w-2xl mx-auto">
              Discover our professional cleaning services and add them to your cart.
            </p>
            <div className="flex justify-center">
              <Link
                to="/services"
                className="bg-gradient-to-r from-peach-200 to-navy-800 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-peach-200 hover:to-navy-800 transition-all shadow-lg inline-flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  return (
   <div className="bg-pink-100 min-h-screen py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-peach-600 hover:text-peach-700 font-medium mb-6 bg-white px-4 py-2 rounded-lg shadow-md border border-peach-200"
        >
          <ArrowLeft size={20} />
          Continue Shopping
        </Link>
 
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-4">
            Your <span className="bg-gradient-to-r from-peach-600 to-navy-700 bg-clip-text text-transparent">Service Cart</span>
          </h1>
          <p className="text-xl text-navy-600">
            {cart.length} professional cleaning service{cart.length !== 1 ? 's' : ''} selected
          </p>
        </div>
 
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-peach-200 hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {/* Removed tier badge */}
                      <div className="flex items-center gap-1 text-navy-500">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-navy-700">{item.rating}</span>
                        <span className="text-xs text-navy-500">({item.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-navy-500">
                        <Clock size={14} />
                        <span className="text-xs">{item.duration}</span>
                      </div>
                    </div>
 
                    <h3 className="text-xl font-bold text-navy-900 mb-3">{item.name}</h3>
                    <p className="text-navy-600 text-sm mb-4 leading-relaxed">{item.description}</p>
 
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold text-peach-600">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
 
                  <div className="flex lg:flex-col items-center lg:items-end gap-4">
                    <div className="flex items-center gap-3 bg-peach-50 rounded-xl p-2 border border-peach-200">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 rounded-lg bg-white border-2 flex items-center justify-center">
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-bold text-lg text-navy-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 rounded-lg bg-white border-2 flex items-center justify-center">
                        <Plus size={16} />
                      </button>
                    </div>
 
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-xl transition-colors border border-red-200">
                      <Trash2 size={20} />
                    </button>
 
                    <div className="text-right bg-gradient-to-r from-peach-50 to-navy-50 p-4 rounded-xl border border-peach-200">
                      <div className="text-sm text-navy-600 mb-1">Item Total</div>
                      <div className="text-2xl font-bold text-navy-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
 
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-peach-200 sticky top-24">
              <h3 className="text-2xl font-bold text-navy-900 mb-6 text-center">Order Summary</h3>
 
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-navy-700">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-navy-700">
                  <span>GST (18%)</span>
                  <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t-2 border-peach-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-navy-900">
                    <span>Total Amount</span>
                    <span className="text-peach-600">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
 
              <button
                onClick={handleProceedToBooking}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-peach-300 to-navy-700 text-white py-4 rounded-xl text-lg font-bold hover:from-peach-700 hover:to-navy-800 transition-all shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Calendar size={20} />
                    Proceed to Booking
                  </>
                )}
              </button>
 
              <div className="text-center mb-6">
                <Link to="/services" className="text-peach-300 hover:text-peach-700 font-medium text-sm">
                  Add More Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Cart;
 
 