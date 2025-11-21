// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import GoBackButton from './components/GoBackButton';
import Home from './pages/Home';

import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Cart from './pages/Cart';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ForgetPassword from './pages/ForgetPassword';
import { LocationProvider } from "./contexts/LocationContext";
import Categories from './pages/Categories';
import Subcategories from './pages/Subcategories';
import ServiceList from './pages/ServiceList';
import ServiceDetails from './pages/ServiceDetails';  
import Gallery from './pages/Gallery';
import OrderHistory from './pages/OrderHistory';
import InspectionBooking from './pages/InspectionBooking';
import OrderDetailPage from './pages/OrderDetailPage';
//import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-orange-50 text-gray-900">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
            
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/inspection-booking" element={<InspectionBooking />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orderhistory" element={<OrderHistory />} />
             {/* 1. Categories */}
              <Route path="/services" element={<Categories />} />
 
              {/* 2. Subcategories */}
              <Route path="/services/category/:categorySlug" element={<Subcategories />} />
 
              {/* 3. List of services */}
              <Route path="/services/:subcategory" element={<ServiceList />} />
 
              {/* 4. Service Details */}
              <Route path="/services/:subcategory/:serviceSlug" element={<ServiceDetails />} />
 
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/forgetpassword" element={<ForgetPassword />} />
              <Route path="/order-details/:bookingId" element={<OrderDetailPage />} />
              <Route path="*" element={<NotFound />} />

              







            </Routes>
           
          </main>
          <Footer />
           <GoBackButton />
          <WhatsAppButton />
        {/* <ChatbotWidget /> */}
          
        </div>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
