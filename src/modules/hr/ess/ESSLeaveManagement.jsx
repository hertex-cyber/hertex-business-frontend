import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Loader,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { leaveAPI } from "../services/hrAPI";
import {
  StatusBadge,
  LeaveApplicationCard,
  LeaveStatusCard,
  EmptyState,
} from "../shared/components";

export const ESSLeaveManagement = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [balances, setBalances] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "",
    date_from: "",
    date_to: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingState(true);
    try {
      const [typesRes, appsRes, balancesRes] = await Promise.all([
        leaveAPI.getLeaveTypes(),
        leaveAPI.getLeaveApplications(),
        leaveAPI.getCurrentYearBalance(),
      ]);

      setLeaveTypes(typesRes.data || []);
      setApplications(appsRes.data || []);
      setBalances(balancesRes.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (
      !formData.leave_type ||
      !formData.date_from ||
      !formData.date_to ||
      !formData.reason
    ) {
      setErrorState("All fields are required");
      return;
    }

    try {
      setLoadingState(true);
      await leaveAPI.applyLeave(formData);
      setShowForm(false);
      setFormData({
        leave_type: "",
        date_from: "",
        date_to: "",
        reason: "",
      });
      fetchData();
    } catch (err) {
      setErrorState(err.response?.data?.detail || err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleCancelLeave = async (applicationId) => {
    if (window.confirm("Are you sure you want to cancel this leave?")) {
      try {
        setLoadingState(true);
        await leaveAPI.cancelLeave(applicationId, "Cancelled by employee");
        fetchData();
      } catch (err) {
        setErrorState(err.message);
      } finally {
        setLoadingState(false);
      }
    }
  };

  const filteredApplications = applications.filter((app) =>
    filter === "ALL" ? true : app.approval_status === filter,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            Apply and track your leave requests
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Leave Balances */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Your Leave Balances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.length > 0 ? (
            balances.map((balance) => (
              <LeaveStatusCard key={balance.id} leaveData={balance} />
            ))
          ) : (
            <EmptyState
              title="No leave data"
              description="Your leave balances will appear here"
            />
          )}
        </div>
      </div>

      {/* Apply Leave Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow p -6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Apply for Leave
          </h2>
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Leave Type *
                </label>
                <select
                  required
                  value={formData.leave_type}
                  onChange={(e) =>
                    setFormData({ ...formData, leave_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  From Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_from}
                  onChange={(e) =>
                    setFormData({ ...formData, date_from: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  To Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_to}
                  onChange={(e) =>
                    setFormData({ ...formData, date_to: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Reason *
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter reason for leave"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Apply for Leave
        </button>
      )}

      {/* Leave Applications */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Your Applications
        </h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["PENDING", "APPROVED", "REJECTED", "CANCELLED", "ALL"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "ALL" ? "All" : status}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <LeaveApplicationCard
                key={application.id}
                application={application}
                onCancel={handleCancelLeave}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No leave applications"
            description={`You have no ${filter.toLowerCase()} leave applications`}
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );
};

export default ESSLeaveManagement;
