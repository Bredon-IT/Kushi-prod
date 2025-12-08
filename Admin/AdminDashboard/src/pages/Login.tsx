import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Global_API_BASE from '../services/GlobalConstants';
 
export function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
 
  const navigate = useNavigate();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    try {
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
        login();
        navigate('/');
      } else {
        const msg = await res.text();
        alert(msg || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
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
       
        {/* Logo Section */}
        <div className="text-center mb-8">
         
          <h1 className="text-3xl font-bold bg-gradient-to-r from-navy-700 to-peach-300 bg-clip-text text-transparent">
            Kushi Services
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back to your dashboard
          </p>
        </div>
 
        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
 
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-600 mt-1">Access your admin dashboard</p>
              </div>
 
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-peach-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
 
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-peach-400"
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
 
              {/* Remember me only */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-navy-700 focus:ring-peach-400" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
              </div>
 
              {/* Submit */}
              <Button type="submit" className="w-full py-3 text-base font-semibold">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
 
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">© 2024 Kushi Services. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
 
 