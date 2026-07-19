import React, { useState, useEffect } from "react";
import { exitAPI, employeeAPI } from "../services/hrAPI";

export default function ExitManagementEnhanced() {
  const [activeTab, setActiveTab] = useState("interviews");
  const [interviews, setInterviews] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resignations, setResignations] = useState([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [invRes, setRes, alRes, sigRes] = await Promise.all([
        exitAPI.getExitInterviews().catch(() => ({ data: [] })),
        exitAPI.getFnFSettlements().catch(() => ({ data: [] })),
        exitAPI.getAlumniRecords().catch(() => ({ data: [] })),
        exitAPI.getResignations().catch(() => ({ data: [] })),
      ]);
      setInterviews(invRes.data.results || invRes.data || []);
      setSettlements(setRes.data.results || setRes.data || []);
      setAlumni(alRes.data.results || alRes.data || []);
      setResignations(sigRes.data.results || sigRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "interviews", label: `Exit Interviews (${interviews.length})` },
    { id: "settlements", label: `F&F Settlements (${settlements.length})` },
    { id: "alumni", label: `Alumni (${alumni.length})` },
    { id: "resignations", label: `Resignations (${resignations.length})` },
  ];

  const StatusBadge = ({ status }) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      DRAFT: "bg-gray-100 text-gray-600",
      PENDING_HR: "bg-yellow-100 text-yellow-700",
      PENDING_FINANCE: "bg-orange-100 text-orange-700",
      APPROVED: "bg-green-100 text-green-700",
      PAID: "bg-blue-100 text-blue-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100"}`}>{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Exit Management</h1>
      <p className="text-sm text-gray-500 mb-6">Manage resignations, exit interviews, F&F settlements, and alumni portal</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-blue-700">{resignations.length}</p>
                <p className="text-xs text-gray-500">Total Resignations</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-yellow-700">{interviews.filter(i => i.status === "PENDING").length}</p>
                <p className="text-xs text-gray-500">Pending Interviews</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-orange-700">{settlements.filter(s => s.status !== "PAID").length}</p>
                <p className="text-xs text-gray-500">Pending Settlements</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-purple-700">{alumni.length}</p>
                <p className="text-xs text-gray-500">Alumni Records</p>
              </div>
            </div>
          )}

          {activeTab === "interviews" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {interviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No exit interviews</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {interviews.map((i) => (
                    <div key={i.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{i.employee_name || i.employee?.first_name} {i.employee?.last_name}</p>
                          <p className="text-sm text-gray-500">{i.interview_date} | Overall: {i.overall_satisfaction || "N/A"}/5</p>
                          {i.rehire_recommendation && <p className="text-xs text-gray-400">Rehire: {i.rehire_recommendation}</p>}
                        </div>
                        <StatusBadge status={i.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settlements" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {settlements.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No F&F settlements</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {settlements.map((s) => (
                    <div key={s.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{s.employee_name || s.employee?.first_name} {s.employee?.last_name}</p>
                          <p className="text-sm text-gray-600">Exit: {s.exit_date} | Net: ₹{(s.net_settlement || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Earnings: ₹{(s.total_earnings || 0).toLocaleString()} | Deductions: ₹{(s.total_deductions || 0).toLocaleString()}</p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "alumni" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {alumni.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No alumni records</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {alumni.map((a) => (
                    <div key={a.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{a.employee_name || a.employee?.first_name} {a.employee?.last_name}</p>
                          <p className="text-sm text-gray-500">Exit: {a.exit_date} | Email: {a.email}</p>
                          <p className="text-xs text-gray-400">Access expires: {a.access_expiry_date} | {a.is_rehire_eligible ? "Rehire eligible" : "Not eligible"}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {a.is_active ? "Active" : "Expired"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "resignations" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {resignations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No resignations</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {resignations.map((r) => (
                    <div key={r.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{r.employee_name || r.employee?.first_name} {r.employee?.last_name}</p>
                          <p className="text-sm text-gray-500">Submitted: {r.submitted_on} | Last day: {r.approved_last_working_day || r.requested_last_working_day}</p>
                          <p className="text-xs text-gray-400 truncate max-w-md">{r.reason}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
