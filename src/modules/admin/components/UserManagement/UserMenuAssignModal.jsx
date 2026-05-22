import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RiMenuAddLine } from "react-icons/ri";
import { Search, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import RingLoader from "@/components/ui/RingLoader";

const UserMenuAssignModal = ({ user, onClose, onSuccess }) => {
  const [menus, setMenus] = useState([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const originalIdsRef = useRef(new Set());

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [menusRes, assignmentsRes] = await Promise.all([
          axios.get("/api/menus/"),
          axios.get(`/api/menus/user-assignments/?user_id=${user.id}`)
        ]);

        const allMenus = Array.isArray(menusRes.data)
          ? menusRes.data
          : menusRes.data?.results || [];

        const assignedIds = new Set(assignmentsRes.data?.data || []);

        if (mounted) {
          originalIdsRef.current = new Set(assignedIds);
          setMenus(allMenus);
          setSelectedMenuIds(assignedIds);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error fetching menus:", err);
          setError("Failed to load menus");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const toggleMenu = (menuId) => {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await axios.post("/api/menus/user-assignments/", {
        user_id: user.id,
        menu_ids: Array.from(selectedMenuIds)
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to save menu assignments";
      setError(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  // Group menus by section
  const groupedMenus = menus.reduce((acc, menu) => {
    const section = menu.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(menu);
    return acc;
  }, {});

  const sectionOrder = ["Operations", "Settings", "Admin"];

  const isSearchMatch = (menu) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      menu.name?.toLowerCase().includes(q) ||
      menu.code?.toLowerCase().includes(q)
    );
  };

  const assignedCount = selectedMenuIds.size;

  // Flatten menus into sorted sections for rendering
  const renderSections = () => {
    const sections = [];

    sectionOrder.forEach((section) => {
      const items = (groupedMenus[section] || []).filter(isSearchMatch);
      if (items.length) sections.push({ section, items });
    });

    Object.keys(groupedMenus)
      .filter((s) => !sectionOrder.includes(s))
      .forEach((section) => {
        const items = groupedMenus[section].filter(isSearchMatch);
        if (items.length) sections.push({ section, items });
      });

    return sections;
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-white/[0.02] flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <RiMenuAddLine size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider truncate">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium truncate">
              {user.email}
            </p>
          </div>
          <span className="text-[9px] text-blue-400 font-medium uppercase tracking-widest shrink-0">
            {assignedCount}/{menus.length}
          </span>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              size={13}
            />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-950 transition-all"
            />
          </div>
        </div>

        {/* Content Area — Compact list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <RingLoader />
            </div>
          ) : error && menus.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-medium">
                {error}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/30">
              {renderSections().map(({ section, items }) => (
                <div key={section}>
                  {/* Section Header */}
                  <div className="px-6 py-2 bg-zinc-900/20">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
                      {section}
                    </span>
                  </div>
                  {/* Menu Items */}
                  <div className="divide-y divide-zinc-800/20">
                    {items
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((menu) => {
                        const selected = selectedMenuIds.has(menu.id);
                        return (
                          <button
                            key={menu.id}
                            onClick={() => toggleMenu(menu.id)}
                            className="w-full px-6 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left"
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                                selected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-zinc-600"
                              )}
                            >
                              {selected && (
                                <Check
                                  size={10}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-xs font-medium uppercase tracking-wider truncate transition-colors",
                                selected
                                  ? "text-white"
                                  : "text-white/60 hover:text-white/80"
                              )}
                            >
                              {menu.name || menu.code}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}

              {/* No search results */}
              {searchQuery &&
                renderSections().length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                      No menus match &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-6 py-2 bg-red-900/20 border-t border-red-500/20 shrink-0">
            <p className="text-[9px] text-red-400 uppercase tracking-widest font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
            {assignedCount} of {menus.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-[9px] font-medium text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 uppercase tracking-widest transition-all rounded cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserMenuAssignModal;
