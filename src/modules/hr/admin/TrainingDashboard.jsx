import React, { useState, useEffect } from "react";
import { trainingAPI } from "../services/hrAPI";

export default function TrainingDashboard() {
  const [activeTab, setActiveTab] = useState("programs");
  const [programs, setPrograms] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [progRes, nomRes, needRes, assRes] = await Promise.all([
        trainingAPI.getPrograms().catch(() => ({ data: [] })),
        trainingAPI.getNominations().catch(() => ({ data: [] })),
        trainingAPI.getTrainingNeeds().catch(() => ({ data: [] })),
        trainingAPI.getTrainingAssessments().catch(() => ({ data: [] })),
      ]);
      setPrograms(progRes.data.results || progRes.data || []);
      setNominations(nomRes.data.results || nomRes.data || []);
      setNeeds(needRes.data.results || needRes.data || []);
      setAssessments(assRes.data.results || assRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "programs", label: `Programs (${programs.length})` },
    { id: "needs", label: `TNI (${needs.length})` },
    { id: "nominations", label: `Nominations (${nominations.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Training & Development</h1>
      <p className="text-sm text-gray-500 mb-6">Training programs, TNI, skill assessments, and nominations</p>

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
                <p className="text-2xl font-bold text-blue-700">{programs.length}</p>
                <p className="text-xs text-gray-500">Programs</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-yellow-700">{needs.filter(n => n.status === "IDENTIFIED").length}</p>
                <p className="text-xs text-gray-500">Identified Needs</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-green-700">{nominations.filter(n => n.status === "Completed").length}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-purple-700">{assessments.length}</p>
                <p className="text-xs text-gray-500">Assessments</p>
              </div>
            </div>
          )}

          {activeTab === "programs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">No programs</div>
              ) : programs.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{p.training_type}</span>
                    <span>{new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}</span>
                  </div>
                  {p.trainer_name && <p className="text-xs text-gray-400 mt-1">Trainer: {p.trainer_name}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === "needs" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {needs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No training needs identified</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {needs.map((n) => (
                    <div key={n.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{n.employee_name || n.employee?.first_name} - {n.skill_name || n.skill?.name || "General"}</p>
                          <p className="text-sm text-gray-500">{n.need_type} | Current: {n.current_proficiency}/5 → Target: {n.target_proficiency}/5 | Gap: {n.gap}</p>
                          {n.suggested_program && <p className="text-xs text-gray-400 mt-1">Suggested: {n.suggested_program}</p>}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            n.priority === "CRITICAL" ? "bg-red-100 text-red-700" :
                            n.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>{n.priority}</span>
                          <p className="text-xs text-gray-500 mt-1">Status: {n.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "nominations" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {nominations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No nominations</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {nominations.map((n) => (
                    <div key={n.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{n.employee_name || n.employee?.first_name} → {n.program_name || n.program?.name}</p>
                          {n.completion_score && <p className="text-sm text-gray-500">Score: {n.completion_score}%</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          n.status === "Completed" ? "bg-green-100 text-green-700" :
                          n.status === "Approved" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{n.status}</span>
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
