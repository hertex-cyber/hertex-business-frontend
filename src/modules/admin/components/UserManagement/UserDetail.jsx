/**
 * User Detail Component
 * Shows full user information
 */

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Badge,
  Calendar,
  CheckCircle,
  User,
  Building2,
  Users,
} from "lucide-react";
import { formatISO, parseISO, format } from "date-fns";

const UserDetail = ({ user }) => {
  const [showActivities, setShowActivities] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date =
        typeof dateString === "string" ? parseISO(dateString) : dateString;
      return format(date, "PPpp");
    } catch {
      return dateString;
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Superadmin: "bg-purple-900/30 text-purple-300 border-purple-500",
      Admin: "bg-blue-900/30 text-blue-300 border-blue-500",
      Manager: "bg-orange-900/30 text-orange-300 border-orange-500",
      Staff: "bg-yellow-900/30 text-yellow-300 border-yellow-500",
      Vendor: "bg-pink-900/30 text-pink-300 border-pink-500",
      User: "bg-gray-900/30 text-gray-300 border-gray-500",
    };
    return colors[role] || "bg-gray-900/30 text-gray-300 border-gray-500";
  };

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="flex items-start gap-6 pb-6 border-b border-zinc-800">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.first_name}
            className="w-20 h-20 rounded-full object-cover border border-zinc-700"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center border border-zinc-700">
            <span className="text-2xl font-bold text-blue-300">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-white/60 mt-1">{user.account_id}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full border text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
            >
              {user.role}
            </span>
            <span
              className={`px-3 py-1 rounded-full border text-xs font-semibold ${user.is_active ? "bg-green-900/30 text-green-300 border-green-500" : "bg-red-900/30 text-red-300 border-red-500"}`}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
            {user.is_email_verified && (
              <span className="px-3 py-1 rounded-full border text-xs font-semibold bg-green-900/30 text-green-300 border-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Email Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-400" />
          Contact Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Mail className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-white/60 text-sm">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>
          {user.mobile && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
              <Phone className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/60 text-sm">Mobile</p>
                <p className="text-white">{user.mobile}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Organization Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Organization
        </h3>
        <div className="space-y-3">
          {user.organization_name && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
              <Building2 className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/60 text-sm">Organization</p>
                <p className="text-white">{user.organization_name}</p>
              </div>
            </div>
          )}
          {user.department_name && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
              <Users className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/60 text-sm">Department</p>
                <p className="text-white">{user.department_name}</p>
              </div>
            </div>
          )}
          {user.supervisor_name && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
              <User className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/60 text-sm">Supervisor</p>
                <p className="text-white">{user.supervisor_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Account Timeline
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Calendar className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-white/60 text-sm">Created</p>
              <p className="text-white">{formatDate(user.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Calendar className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-white/60 text-sm">Last Updated</p>
              <p className="text-white">{formatDate(user.updated_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Calendar className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-white/60 text-sm">Last Login</p>
              <p className="text-white">{formatDate(user.last_login)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-400" />
          Verification Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
            <span className="text-white/60">Email Verified</span>
            <span
              className={`font-semibold ${user.is_email_verified ? "text-green-400" : "text-red-400"}`}
            >
              {user.is_email_verified ? "✓ Yes" : "✗ No"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
            <span className="text-white/60">Mobile Verified</span>
            <span
              className={`font-semibold ${user.is_mobile_verified ? "text-green-400" : "text-red-400"}`}
            >
              {user.is_mobile_verified ? "✓ Yes" : "✗ No"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
            <span className="text-white/60">Staff Status</span>
            <span
              className={`font-semibold ${user.is_staff ? "text-green-400" : "text-red-400"}`}
            >
              {user.is_staff ? "✓ Staff" : "✗ Not Staff"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
