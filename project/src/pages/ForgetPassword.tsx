import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Global_API_BASE from '../services/GlobalConstants';

const ForgetPassword: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post( Global_API_BASE + '/api/auth/forgot-password', formData);
      setMessage(res.data);
      setTimeout(() => navigate('/signin'), 2000); // Redirect after success
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error updating password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-navy-700">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 py-3 border border-navy-200 rounded-lg"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" size={20} />
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 py-3 border border-navy-200 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-navy-700 hover:bg-peach-300 text-white py-3 rounded-lg font-semibold"
          >
            Reset Password
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-navy-600">{message}</p>}
      </div>
    </div>
  );
};

export default ForgetPassword;
