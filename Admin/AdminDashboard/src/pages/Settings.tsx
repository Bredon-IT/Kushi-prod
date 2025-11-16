import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Save,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
// Removed useTheme, Moon, Sun imports as App Preferences (Dark Mode toggle) is gone
import axios from "axios";
 
interface Admin {
  adminId: number;
  adminname: string;
  email: string;
  phoneNumber: string;
  role: string;
}
interface NewUser {
  adminname: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: string;
}
 
 
interface SettingsState {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  language: string;
  timezone: string;
  currency: string;
}
 
export function Settings() {
  // Removed const { theme, toggleTheme } = useTheme();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Admin | null>(null);
  const [users, setUsers] = useState<Admin[]>([]);
  const [newUser, setNewUser] = useState<NewUser>({
    adminname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
  });
  const fetchUsers = async () => {
    try {
      const res = await axios.get<Admin[]>("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/login/all-users");
      // Exclude the first admin (assuming first admin has adminId = 1)
      const filteredUsers = res.data.filter(user => user.adminId !== 1);
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
 
  // call once on mount to populate users list
  useEffect(() => {
    fetchUsers();
  }, []);
 
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewUser(prev => ({ ...prev, [name]: value }));
};
 
 
  const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault();
 
  const phone = newUser.phoneNumber?.trim() || "";
  if (phone.length !== 10) {
    alert("❌ Phone number must be exactly 10 digits");
    return;
  }
  try {
    await axios.post("https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/login/add-user",
      {...newUser, phoneNumber: `+91${phone}`},
      {params: { adminId: admin?.adminId } }// current logged-in admin
    );
    alert("✅ User added successfully");
    setNewUser({ adminname: "", email: "", phoneNumber: "", password: "", role: "" });
    fetchUsers(); // refresh list
  } catch (err: any) {
    const msg = err.response?.data || err.message || "Error adding user";
    alert(`❌ ${msg}`);
  }
};
 
 
const handleDeleteUser = async (adminId: number) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  try {
    await axios.delete(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/login/delete-user/${adminId}`, {
      params: { adminId: admin?.adminId } // current logged-in admin
    });
    alert("✅ User deleted successfully");
    fetchUsers(); // refresh list
  } catch (err: any) {
    const msg = err.response?.data || err.message || "Error deleting user";
    alert(`❌ ${msg}`);
  }
};
 
 
  // ✅ settings state
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Keep these, but they are no longer used in the UI
    language: "english",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });
 
  // ✅ handle settings input (still needed for password changes)
  const handleInputChange = (field: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };
 
  // ✅ handle profile input
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
 
 
 
  // ✅ save profile updates
  const handleProfileUpdate = () => {
    if (formData) {
      axios
        .put(
          `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/login/update/${formData.adminId}`,
          formData
        )
        .then((res) => {
          setAdmin(res.data);
          setEditMode(false);
          alert("✅ Profile updated successfully");
        })
        .catch((err) => console.error("Error updating profile:", err));
    }
  };
 
 
  // ✅ password change
const handlePasswordChange = () => {
  if (settings.newPassword !== settings.confirmPassword) {
    alert("❌ New password and confirm password do not match");
    return;
  }
  if (!settings.currentPassword) {
    alert("❌ Please enter current password");
    return;
  }
 
  if (!admin) {
    alert("❌ Admin not loaded");
    return;
  }
 
  axios
    .put(
      `https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/login/update-password/${admin.adminId}`,
      null, // body not needed, params in query
      {
        params: {
          oldPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        },
      }
    )
    .then(() => {
      alert("✅ Password updated successfully");
      setSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    })
    .catch((err) => {
      if (err.response?.data) {
        alert(`❌ ${err.response.data}`);
      } else {
        alert("❌ Error updating password");
      }
    });
};
 
 
  // ✅ fetch logged-in admin details
  useEffect(() => {
    const email = localStorage.getItem("adminEmail");
    if (email) {
      axios
        .get<Admin>(`https://bmytsqa7b3.ap-south-1.awsapprunner.com/api/login/me/${email}`)
        .then((res) => {
          setAdmin(res.data);
          setFormData(res.data);
         
        })
        .catch((err) => {
          console.error("Error fetching admin details:", err);
        });
    }
  }, []);
 
  if (!admin || !formData) {
    return <p className="p-4">Loading profile...</p>;
  }
 
 
 
  return (
    <div className="w-full overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
  <div className="min-w-[950px]">
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <Button onClick={() => alert("✅ Settings saved successfully!")}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>
     
      {/* Profile and Security Settings - Side-by-Side (2 cols) on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Profile Settings
            </h3>
            {!editMode && (
              <Button size="sm" onClick={() => setEditMode(true)}>
                <Edit3 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="adminname"
                value={formData.adminname}
                onChange={handleProfileChange}
                readOnly={!editMode}
                className={`w-full p-3 border border-gray-300 rounded-lg ${
                  !editMode
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-800"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                readOnly={!editMode}
                className={`w-full p-3 border border-gray-300 rounded-lg ${
                  !editMode
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-800"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleProfileChange}
                readOnly={!editMode}
                className={`w-full p-3 border border-gray-300 rounded-lg ${
                  !editMode
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-800"
                }`}
              />
            </div>
 
            <div>
              <label className="block text-sm font-medium">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleProfileChange}
                readOnly={!editMode}
                className={`w-full p-3 border border-gray-300 rounded-lg ${
                  !editMode
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-800"
                }`}
              />
            </div>
 
 
            {editMode && (
              <Button
                onClick={handleProfileUpdate}
                className="bg-green-600 text-white w-full"
              >
                Save Profile
              </Button>
            )}
          </CardContent>
        </Card>
 
        {/* Security Settings */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Security Settings
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={settings.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={settings.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={settings.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handlePasswordChange} variant="danger" className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
 
      {/* User Management - Full Width below the other settings */}
      {admin?.adminId === 1 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-teal-600" />
              User Management
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add User Form */}
            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="flex gap-2 flex-col md:flex-row">
                <input
                  type="text"
                  name="adminname"
                  placeholder="Full Name"
                  value={newUser.adminname}
                  onChange={handleNewUserChange}
                  className="flex-1 p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  className="flex-1 p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2 border border-r-0 rounded-l bg-gray-100 dark:bg-gray-700">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newUser.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // only digits
                    if (val.length <= 10) {
                      setNewUser({ ...newUser, phoneNumber: val });
                    }
                  }}
                  className="flex-1 p-2 border rounded-r"
                />
 
 
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  className="flex-1 p-2 border rounded"
                  required
                  minLength={6}
                />
              </div>
 
              <div>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Operational Manager">Operational Manager</option>
                </select>
              </div>
 
              <Button type="submit" className="bg-green-600 text-white w-full hover:bg-green-700">
                Add User
              </Button>
            </form>
 
            {/* Users Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700 min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Phone</th>
                    <th className="border px-2 py-1">Role</th>
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.adminId} className="text-center">
                      <td className="border px-2 py-1">{index + 1}</td>
                      <td className="border px-2 py-1">{user.adminname}</td>
                      <td className="border px-2 py-1">{user.email}</td>
                      <td className="border px-2 py-1">{user.phoneNumber || "-"}</td>
                      <td className="border px-2 py-1">{user.role}</td>
                      <td className="border px-2 py-1 flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(user.adminId)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-2 text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
    </div>
  );
} 
 