import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { Card, CardContent } from '../../components/admin/ui/Card';
import { Button } from '../../components/admin/ui/Button';
import Global_API_BASE from '../../services/admin/GlobalConstants';

export function AdminLogin() {
  const { login } = useAdminAuth();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // LOGIN API
      const res = await fetch(Global_API_BASE + '/api/login/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (res.ok) {
        const admin = await res.json();
        localStorage.setItem('admin', JSON.stringify(admin));
        localStorage.setItem('adminEmail', admin.email || '');
        alert('Login successful');
        login();
        navigate('/admin/dashboard');
      } else {
        const msg = await res.text();
        alert(msg || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.email || formData.password.length < 6 || formData.password !== formData.confirmPassword) {
        alert("Please fill correctly: email required, password min 6 chars, and both passwords must match.");
        return;
      }

      const res = await fetch(Global_API_BASE + "/api/login/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const msg = await res.text();
      if (res.ok) {
        alert(msg || "Password updated successfully! Please log in.");
        setIsForgotPassword(false);
        setFormData({ email: "", password: "", confirmPassword: "" });
      } else {
        alert(msg || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-coral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-coral-600 rounded-2xl shadow-lg mb-4">
            <img
              src="/kushiservices logo.png"
              alt="Kushi Services"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-coral-600 bg-clip-text text-transparent">
            Kushi Services
          </h1>
          <p className="text-gray-600 mt-2">
            {isForgotPassword ? "Reset your password" : "Welcome back to your dashboard"}
          </p>
        </div>

        {/* Forms */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Forgot Password Form */}
            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 text-center">Forgot Password</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full py-3 text-base font-semibold">
                  Reset Password
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                  <p className="text-gray-600 mt-1">Access your admin dashboard</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full py-3 text-base font-semibold">
                  Sign In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">© 2024 Kushi Services. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}












