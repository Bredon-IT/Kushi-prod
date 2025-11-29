import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // UPDATED VALIDATION
  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // First Name (letters only)
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "Only letters allowed";
    }

    // Last Name optional but validate letters
    if (formData.lastName && !/^[A-Za-z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Only letters allowed";
    }

    // Email (Any domain allowed)
    if (!formData.email.trim()) newErrors.email = "Email is required";

    // Phone
    const digits = formData.phone.replace(/\D/g, "");
    if (!digits) newErrors.phone = "Phone number is required";
    else if (digits.length !== 10)
      newErrors.phone = "Phone must be 10 digits";

    // Password
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!formData.password)
      newErrors.password = "Password is required";
    else if (!passwordPattern.test(formData.password))
      newErrors.password =
        "Password must be 8+ chars, include 1 capital, 1 number & 1 special char";

    // Confirm Password
    if (!formData.confirmPassword.trim())
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        phone: `${countryCode}${formData.phone}`,
      };

      const result = await signup(payload as any);

      if (result && (result.ok || result.success)) navigate("/");
      else setErrors({ email: result?.message || "Signup failed" });
    } catch {
      setErrors({ email: "Signup failed. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="bg-neutral-50 flex items-center justify-center py-2 px-2">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-xl p-6">
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-peach-300 to-navy-700 flex items-center justify-center mb-3">
            <UserPlus size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-2">Fast & secure signup</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* FIRST NAME + LAST NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm w-full block">
              <span className="font-medium text-gray-700">First Name *</span>
              <div className="relative mt-1">
                <User size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border ${
                    errors.firstName ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="First name"
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
              )}
            </label>

            <label className="text-sm w-full block">
              <span className="font-medium text-gray-700">Last Name</span>
              <div className="relative mt-1">
                <User size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border ${
                    errors.lastName ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Last name"
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
              )}
            </label>
          </div>

          {/* EMAIL + PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm block">
              <span className="font-medium text-gray-700">Email *</span>
              <div className="relative mt-1">
                <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border ${
                    errors.email ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </label>

            <label className="text-sm block">
              <span className="font-medium text-gray-700">Phone *</span>
              <div className="flex mt-1">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="border border-gray-300 rounded-l-md bg-gray-50 px-2 text-sm"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-3 pr-3 py-2 text-sm rounded-r-md border ${
                    errors.phone ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="10-digit number"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </label>
          </div>

          {/* PASSWORD + CONFIRM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm block">
              <span className="font-medium text-gray-700">Password *</span>
              <div className="relative mt-1">
                <Lock size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-9 py-2 text-sm rounded-md border ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </label>

            <label className="text-sm block">
              <span className="font-medium text-gray-700">Confirm *</span>
              <div className="relative mt-1">
                <Lock size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-9 py-2 text-sm rounded-md border ${
                    errors.confirmPassword ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Confirm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </label>
          </div>

          {/* TERMS */}
          <div className="flex items-start gap-2 text-sm">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 text-navy-700"
              required
            />
            <label htmlFor="terms" className="text-gray-700">
              I agree to the{" "}
              <Link className="text-navy-600 font-medium" to="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="text-navy-600 font-medium" to="/privacy">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-md bg-peach-300 text-white font-semibold text-sm hover:bg-peach-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="text-navy-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
