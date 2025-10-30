import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Mail, Lock, Shield, CheckCircle } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';





const SignIn: React.FC = () => {
  const navigate = useNavigate();
   const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const result = await login(formData.email, formData.password);

    if (result.ok) {
      navigate("/");
    } else {
      alert(result.message || "Invalid email or password");
    }
  } catch {
    alert("Login failed");
  } finally {
    setIsLoading(false);
  }
};


const handleForgotPassword = () => {
  navigate("/forgetpassword");
};


const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear error
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
   <div className="bg-pink-50 min-h-screen py-28">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-peach-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-700 to-peach-300 px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-peach-400/20 to-navy-600/20"></div>
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <LogIn size={36} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Welcome Back!</h1>
              <p className="text-peach-100 text-lg">Sign in to your Kushi Services account</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                {errors.email && <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email}
                </p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-navy-700 mb-3">
                  Password
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
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password}
                </p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-peach-600 focus:ring-peach-500 border-navy-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-navy-700 font-medium">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgetpassword" className="font-semibold text-peach-600 hover:text-peach-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-navy-700 to-peach-300 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-peach-300 hover:to-navy-700 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={22} />
                    Sign In to Your Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-navy-600 text-lg">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-peach-600 hover:text-peach-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>

            {/* Security Features */}
            <div className="mt-8 p-4 bg-gradient-to-r from-peach-50 to-navy-50 rounded-xl border border-peach-200">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} className="text-navy-600" />
                <h3 className="font-semibold text-navy-700">Secure & Protected</h3>
              </div>
              <div className="space-y-2 text-sm text-navy-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-peach-600" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-peach-600" />
                  <span>Secure data protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-peach-600" />
                  <span>Privacy guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;