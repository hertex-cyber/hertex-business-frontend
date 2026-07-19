import React, { useState, useEffect } from "react";
import { masterDataAPI, leaveAPI } from "../services/hrAPI";
import { Settings, Shield, MapPin, Briefcase, DollarSign, Clock, Calendar, RefreshCw } from "lucide-react";

export default function HRSettings() {
  const [activeSection, setActiveSection] = useState("shifts");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    loadSectionData();
  }, [activeSection]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      if (activeSection === "shifts") {
        const res = await masterDataAPI.getShifts();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "designations") {
        const res = await masterDataAPI.getDesignations();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "locations") {
        const res = await masterDataAPI.getWorkLocations();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "centers") {
        const res = await masterDataAPI.getCostCenters();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "leaves") {
        const res = await leaveAPI.getLeaveTypes();
        setData(res.data?.results || res.data || []);
      }
    } catch (err) {
      console.error("Error loading settings section:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Settings className="text-blue-500 animate-spin-slow" /> HR Master Configuration
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Configure structural master data, leave structures, shifts, and locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation */}
        <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-2 h-fit">
          {[
            { id: "shifts", label: "Shifts & Rosters", icon: Clock },
            { id: "leaves", label: "Leave Configurations", icon: Calendar },
            { id: "designations", label: "Designations", icon: Briefcase },
            { id: "locations", label: "Work Locations", icon: MapPin },
            { id: "centers", label: "Cost Centers", icon: DollarSign }
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  activeSection === sec.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="md:col-span-3 bg-zinc-950/40 backdrop-blur-xl border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white capitalize">{activeSection} Master List</h2>
            <button 
              onClick={loadSectionData}
              className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw size={32} className="text-blue-500 animate-spin" />
              <p className="text-zinc-500 text-sm">Loading config parameters...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-10">No items found in this category.</p>
              ) : (
                data.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-white">
                        {item.name || item.title || item.code || item.state}
                      </h3>
                      {activeSection === "shifts" && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Timing: {item.start_time?.slice(0,5)} to {item.end_time?.slice(0,5)}
                        </p>
                      )}
                      {activeSection === "leaves" && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Annual Allocation: {item.annual_allocation} days | Paid: {item.is_paid ? "Yes" : "No"}
                        </p>
                      )}
                      {activeSection === "locations" && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Code: {item.code} | Address: {item.address || "N/A"}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded border border-zinc-700 uppercase font-semibold">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
