import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, Mail, Lock, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // VALIDATION (minimal clean)
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";

    if (!formData.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // LOGIN SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.ok) navigate("/");
      else alert(result.message || "Invalid login credentials");
    } catch {
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="bg-neutral-50 flex items-center justify-center py-2 px-2">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="px-4 py-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-peach-300 to-navy-700 flex items-center justify-center mb-4">
            <LogIn size={20} className="text-white" />
          </div>
          <h1 className="text-1xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* FORM */}
        <div className="px-3 pb-4 sm:px-4">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <label className="block text-sm font-medium text-gray-700">
              Email Address
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                    errors.email ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-peach-300`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </label>

            {/* Password */}
            <label className="block text-sm font-medium text-gray-700">
              Password
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-300`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </label>

            {/* Forgot Password */}
            <div className="flex justify-end text-sm">
              <button
                type="button"
                onClick={() => navigate("/forgetpassword")}
                className="text-navy-700 hover:text-peach-300 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-1 rounded-lg bg-navy-700 text-white font-semibold shadow hover:bg-peach-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>

          </form>

          {/* Redirect */}
          <div className="mt-5 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-navy-700 font-medium">
              Create Account
            </Link>
          </div>

          {/* Security Info */}
          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-peach-300" />
              <span className="font-medium">Secure Login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-peach-300" /> 256-bit SSL Encryption
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-peach-300" /> Your data is protected
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;
