import React, { useState, useEffect, useCallback } from "react";
import {
  fetchFeatures,
  fetchCompanyFeatures,
  updateCompanyFeatures,
} from "@/modules/inventory/services/featureService";
import {
  Box, Loader, CheckCircle2, Save, RefreshCw,
  Search, AlertTriangle,
} from "lucide-react";
import { useFeatureContext } from "@/context/FeatureContext";

const InventoryFeatureManagement = () => {
  const [allFeatures, setAllFeatures] = useState([]);
  const [enabledIds, setEnabledIds] = useState(new Set());
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [featuresRes, companyRes] = await Promise.all([
        fetchFeatures(true),
        fetchCompanyFeatures(),
      ]);

      setAllFeatures(featuresRes.data?.results || featuresRes.data || []);
      setCompanyName(companyRes.data?.company_name || "");

      const enabled = new Set(
        (companyRes.data?.features || [])
          .filter((f) => f.enabled)
          .map((f) => f.id)
      );
      setEnabledIds(enabled);
    } catch (err) {
      setErrorMessage("Failed to load features. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleFeature = (featureId) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const { refreshFeatures } = useFeatureContext();

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      await updateCompanyFeatures(Array.from(enabledIds));
      setSuccessMessage("Feature configuration saved successfully!");
      // Refresh the sidebar context immediately so navigation updates live
      refreshFeatures();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredFeatures = allFeatures.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledCount = enabledIds.size;
  const totalCount = allFeatures.length;

  if (loading) {
    return (
      <div className="flex flex-col bg-black h-full">
        <header className="px-10 py-8 border-b border-white/5">
          <h1 className="text-2xl font-semibold text-white">Inventory Configuration</h1>
          <p className="text-sm text-white/40 mt-1">Feature Management</p>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader size={24} className="text-white/30 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-black h-full">
      {/* Header */}
      <header className="px-10 py-8 border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
              Administration / Inventory
            </div>
            <h1 className="text-2xl font-semibold text-white">Inventory Configuration</h1>
            <p className="text-sm text-white/40">Feature Management{companyName ? ` — ${companyName}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-white/30 font-medium">
              {enabledCount} / {totalCount} enabled
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-1.5 disabled:opacity-30"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <Loader size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      {successMessage && (
        <div className="mx-10 mt-4 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium text-emerald-300">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mx-10 mt-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <span className="text-xs font-medium text-red-300">{errorMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="px-10 py-4 border-b border-white/5">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Features Grid */}
      <main className="flex-1 px-10 py-6 overflow-y-auto">
        {filteredFeatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Box size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-semibold text-white/40 mb-1">No features found</h3>
            <p className="text-sm text-white/20">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredFeatures.map((feature) => (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`group relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                  enabledIds.has(feature.id)
                    ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                {/* Status indicator */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    enabledIds.has(feature.id)
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-white/20 group-hover:border-white/30"
                  }`}
                >
                  {enabledIds.has(feature.id) && (
                    <CheckCircle2 size={10} className="text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        enabledIds.has(feature.id)
                          ? "text-white"
                          : "text-white/50 group-hover:text-white/70"
                      }`}
                    >
                      {feature.name}
                    </span>
                    <span className="text-[9px] font-mono text-white/20">{feature.code}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryFeatureManagement;
