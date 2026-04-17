/**
 * Create User Form Component
 * Form for creating new users
 */

import React, { useState } from "react";
import { Mail, Lock, User, Phone, Users, Shield } from "lucide-react";
import Input from "../../../../../components/Input";

const CreateUserForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    mobile: "",
    password: "",
    password_confirm: "",
    role: "User",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = ["User", "Staff", "Manager", "Admin", "Vendor", "Superadmin"];
  const genders = ["Male", "Female", "Other"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError("Email, first name, and last name are required");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { password_confirm, ...submitData } = formData;
      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="John"
          icon={User}
          required
        />
        <Input
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Doe"
          icon={User}
          required
        />
      </div>

      {/* Email */}
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="user@example.com"
        icon={Mail}
        required
      />

      {/* Contact Row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Mobile"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="9876543210"
          icon={Phone}
        />
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Select Gender</option>
            {genders.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          User Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          required
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Password Row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          icon={Lock}
          required
        />
        <Input
          label="Confirm Password"
          name="password_confirm"
          type="password"
          value={formData.password_confirm}
          onChange={handleChange}
          placeholder="••••••••"
          icon={Lock}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors duration-200"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
};

export default CreateUserForm;
