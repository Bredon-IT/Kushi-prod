import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Phone, Shield, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.firstName.trim()) {newErrors.firstName = 'First name is required';
} else if (!/^[A-Z]/.test(formData.firstName)) {newErrors.firstName = 'First name must start with a capital letter';

}
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

     if (!formData.email.trim()) {newErrors.email = 'Email is required';
} else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
newErrors.email = 'Email is invalid';
}
if (!formData.phone.trim()) {
newErrors.phone = 'Phone number is required';
} else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
 newErrors.phone = 'Phone number must be 10 digits';
 }
if (!formData.password.trim()) {
newErrors.password = 'Password is required';
 } else if (formData.password.length < 6) {
newErrors.password = 'Password must be at least 6 characters';
}
if (!formData.confirmPassword.trim()) {
 newErrors.confirmPassword = 'Please confirm your password';
 } else if (formData.password !== formData.confirmPassword) {
newErrors.confirmPassword = 'Passwords do not match';
}
 setErrors(newErrors);
return Object.keys(newErrors).length === 0;
 };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const result = await signup(formData); 
    if (result.ok) {
      navigate("/");
    } else {
      setErrors({ email: result.message || "Signup failed" });
    }
  } catch {
    setErrors({ email: "Signup failed" });
  } finally {
    setIsLoading(false);
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white  py-10 min-h-screen flex items-center justify-center ">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-peach-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-navy-600/20 to-peach-400/20"></div>
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserPlus size={36} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Join Kushi Services</h1>
              <p className="text-peach-100 text-lg">Create your account and get premium cleaning services</p>
              <div className="mt-6 flex justify-center gap-6 text-white/90">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-300" />
                  <span className="text-sm">4.9★ Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield size={16} className="text-peach-200" />
                  <span className="text-sm">Trusted Service</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-navy-700 mb-3">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" size={18} />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all bg-peach-50/50 ${
                        errors.firstName ? 'border-red-500' : 'border-navy-200'
                      }`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-navy-700 mb-3">
                    Last Name(Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" size={18} />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all bg-peach-50/50 ${
                        errors.lastName ? 'border-red-500' : 'border-navy-200'
                      }`}
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-navy-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all bg-peach-50/50 ${
                      errors.email ? 'border-red-500' : 'border-navy-200'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-navy-700 mb-3">
                  Phone Number
                </label>
                <div className="relative flex">
                   <select
                   value={countryCode}
                   onChange={(e) => setCountryCode(e.target.value)}
                   className="bg-peach-50/50 border-2 border-r-0 rounded-l-xl pl-4 pr-2 py-3 focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all text-navy-700"
                   >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                     <option value="+44">🇬🇧 +44</option>
                      {/* Add more country codes as needed */}
                      </select>
                       <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all bg-peach-50/50 ${
                      errors.phone ? 'border-red-500' : 'border-navy-200'
                    }`}
                    placeholder="10-digit phone number"
                  />
                </div>
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-navy-700 mb-3">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all bg-peach-50/50 ${
                      errors.password ? 'border-red-500' : 'border-navy-200'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-navy-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl focus:ring-2 focus:ring-peach-500 focus:border-peach-500 transition-all bg-peach-50/50 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-navy-200'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-peach-600 focus:ring-peach-500 border-navy-300 rounded mt-1"
                  required
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-navy-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-peach-600 hover:text-peach-700 font-semibold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-peach-600 hover:text-peach-700 font-semibold">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-navy-700 to-peach-300 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-navy-700 hover:to-peach-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={22} />
                    Create Your Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-navy-600 text-lg">
                Already have an account?{' '}
                <Link to="/signin" className="font-bold text-peach-600 hover:text-peach-700 transition-colors">
                  Sign In Here
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 p-6 bg-gradient-to-r from-peach-50 to-navy-50 rounded-xl border border-peach-200">
              <h3 className="font-bold text-navy-700 mb-4 text-center">Why Join Kushi Services?</h3>
              <div className="space-y-3 text-sm text-navy-600">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-peach-600" />
                  <span>Exclusive member discounts up to 30%</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-peach-600" />
                  <span>Priority booking and scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-peach-600" />
                  <span>24/7 customer support access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-peach-600" />
                  <span>Service history and easy rebooking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
