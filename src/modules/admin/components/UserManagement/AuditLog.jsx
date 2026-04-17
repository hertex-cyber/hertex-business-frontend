/**
 * Audit Log Component
 * Display user activities and audit log
 */

import React, { useEffect } from "react";
import { useAuditLog } from "../hooks/useUsers";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Key,
  Mail,
} from "lucide-react";
import { formatISO, parseISO, format, formatDistanceToNow } from "date-fns";

const ActivityIcon = ({ action }) => {
  const icons = {
    login: <Shield className="w-4 h-4 text-blue-400" />,
    logout: <Shield className="w-4 h-4 text-gray-400" />,
    password_change: <Key className="w-4 h-4 text-orange-400" />,
    email_verify: <Mail className="w-4 h-4 text-green-400" />,
    user_create: <Shield className="w-4 h-4 text-purple-400" />,
    user_update: <Shield className="w-4 h-4 text-blue-400" />,
    user_delete: <Shield className="w-4 h-4 text-red-400" />,
  };
  return icons[action] || <Activity className="w-4 h-4 text-white/40" />;
};

const AuditLog = ({ userId = null }) => {
  const {
    activities,
    loading,
    error,
    pagination,
    setPagination,
    fetchUserActivities,
    fetchAllActivities,
  } = useAuditLog();

  useEffect(() => {
    if (userId) {
      fetchUserActivities(userId);
    } else {
      fetchAllActivities();
    }
  }, [userId]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getActionLabel = (action) => {
    const labels = {
      login: "Login",
      logout: "Logout",
      password_change: "Password Changed",
      email_verify: "Email Verified",
      user_create: "User Created",
      user_update: "User Updated",
      user_delete: "User Deleted",
      profile_update: "Profile Updated",
    };
    return labels[action] || action;
  };

  const formatDate = (dateString) => {
    try {
      const date =
        typeof dateString === "string" ? parseISO(dateString) : dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white/40 py-8">
        Loading activities...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 py-8">{error}</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-white/40 py-8">No activities found</div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-400" />
        Activity Log
      </h3>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg hover:bg-zinc-800/50 transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {ActivityIcon({ action: activity.action })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-white">
                    {getActionLabel(activity.action)}
                  </h4>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${activity.status === "success" ? "bg-green-900/30 text-green-300" : activity.status === "failed" ? "bg-red-900/30 text-red-300" : "bg-yellow-900/30 text-yellow-300"}`}
                  >
                    {activity.status}
                  </span>
                </div>

                {activity.user_name && (
                  <p className="text-white/60 text-sm mt-1">
                    by{" "}
                    <span className="text-white/80 font-medium">
                      {activity.user_name}
                    </span>
                  </p>
                )}

                {activity.target_changes &&
                  Object.keys(activity.target_changes).length > 0 && (
                    <div className="mt-2 p-2 bg-zinc-900/50 rounded text-xs text-white/60 space-y-1">
                      {Object.entries(activity.target_changes).map(
                        ([field, change]) => (
                          <div key={field}>
                            <span className="text-white/80 font-medium">
                              {field}:
                            </span>{" "}
                            <span className="text-red-400 line-through">
                              {change.old}
                            </span>{" "}
                            →{" "}
                            <span className="text-green-400">{change.new}</span>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(activity.created_at)}
                  </span>
                  {activity.ip_address && <span>{activity.ip_address}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.count > pagination.pageSize && (
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-zinc-700">
          <p className="text-white/60 text-sm">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.count)}{" "}
            of {pagination.count}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!pagination.previous || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-3 py-1 bg-zinc-900/30 hover:bg-zinc-900/50 disabled:opacity-50 text-white rounded text-sm transition-colors duration-200"
            >
              Previous
            </button>
            <button
              disabled={!pagination.next || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-3 py-1 bg-zinc-900/30 hover:bg-zinc-900/50 disabled:opacity-50 text-white rounded text-sm transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
