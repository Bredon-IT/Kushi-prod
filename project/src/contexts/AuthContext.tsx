import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Global_API_BASE from '../services/GlobalConstants';


const API_BASE = import.meta.env.VITE_API_URL ?? Global_API_BASE; 

interface User {
 id: string;
 fullName: string;
 email: string;
 phone?: string;
 address?: string;
 city?: string;
 pincode?: string;
 joinDate?: string;
 totalBookings?: number;
 totalSpent?: number;
 firstName?: string;
 lastName?: string;
}

interface AuthContextType {
 user: User | null;
 isAuthenticated: boolean;
 login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
 signup: (userData: SignupData) => Promise<{ ok: boolean; message?: string }>;
 logout: () => void;
 updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

interface SignupData {
 firstName: string;
 lastName: string;
 email: string;
 phone: string;
 password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
 return ctx;
};

const deriveNames = (fullName?: string) => {
 if (!fullName) return { firstName: undefined, lastName: undefined };
 const parts = fullName.trim().split(' ');
 const firstName = parts[0];
 const lastName = parts.slice(1).join(' ') || '';
 return { firstName, lastName };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [user, setUser] = useState<User | null>(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);

 useEffect(() => {
 const savedUser = localStorage.getItem('kushiUser');
 if (savedUser) {
 try {
 const u: User = JSON.parse(savedUser);
 setUser(u);
 setIsAuthenticated(true);
 } catch {
 localStorage.removeItem('kushiUser');
 }
 }
 }, []);

 /** LOGIN */
 const login: AuthContextType['login'] = async (email, password) => {
 try {
 const res = await axios.post(
 `${API_BASE}/api/auth/signin`,
 { email, password },
 {
 withCredentials: true, // important for cookies/sessions
 headers: { 'Content-Type': 'application/json' },
 }
 );

 const data = res.data;

 const userId = data.id ?? data.customerId ?? data.userId;
 if (!userId) {
 return { ok: false, message: 'Invalid login response: missing user id' };
 }

 if (data.token) {
 localStorage.setItem('kushiToken', data.token);
 }
 // Fetch full profile if backend provides a profile API
 let profile = data;
 try {
 const profileRes = await axios.get(`${API_BASE}/api/auth/profile/${userId}`, {
 withCredentials: true,
 headers: {
 Authorization: data.token ? `Bearer ${data.token}` : '',
 },
 });
 profile = profileRes.data;
 } catch {
 console.warn('Profile fetch failed, using login payload.');
 }

 const { firstName, lastName } = deriveNames(profile.fullName ?? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim());

 const normalizedUser: User = {
 id: String(profile.id ?? userId),
 fullName: profile.fullName ?? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim(),
 email: profile.email ?? email,
 phone: profile.phone,
 address: profile.address,
 city: profile.city,
 pincode: profile.pincode,
 joinDate: profile.joinDate,
 totalBookings: profile.totalBookings,
 totalSpent: profile.totalSpent,
 firstName,
 lastName,
 };

 setUser(normalizedUser);
 setIsAuthenticated(true);
 localStorage.setItem('kushiUser', JSON.stringify(normalizedUser));

 return { ok: true };
 } catch (e: any) {
 return {
 ok: false,
 message: e.response?.data?.message || 'Login failed',
 };
 }
 };

 /** SIGNUP */
 const signup: AuthContextType['signup'] = async (userData) => {
 try {
 const res = await axios.post(`${API_BASE}/api/auth/signup`, userData, {
 withCredentials: true,
 headers: { 'Content-Type': 'application/json' },
 });

 const data = res.data;
 const fullName = data.fullName ?? `${userData.firstName} ${userData.lastName}`.trim();
 const { firstName, lastName } = deriveNames(fullName);

 const newUser: User = {
 id: String(data.id ?? data.customerId ?? data.userId),
 fullName,
 email: data.email ?? userData.email,
 phone: data.phone ?? userData.phone,
 firstName,
 lastName,
 };

 setUser(newUser);
 setIsAuthenticated(true);
 localStorage.setItem('kushiUser', JSON.stringify(newUser));

 return { ok: true };
 } catch (err: any) {
 return { ok: false, message: err.response?.data?.message || 'Signup failed' };
 }
 };

 /** LOGOUT */
 const logout = () => {
 setUser(null);
 setIsAuthenticated(false);
 localStorage.removeItem('kushiUser');
 localStorage.removeItem('kushiToken');
 };

 /** UPDATE PROFILE */
 const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
 try {
 if (!user) return false;
 const updatedUser = { ...user, ...userData };
 // Optional: Call backend to persist
 setUser(updatedUser);
 localStorage.setItem('kushiUser', JSON.stringify(updatedUser));
 return true;
 } catch {
 return false;
 }
 };

 const value: AuthContextType = { user, isAuthenticated, login, signup, logout, updateProfile };
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};