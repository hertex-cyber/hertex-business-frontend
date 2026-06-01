/**
 * UserMenuAssignModal
 * 
 * Allows admins to manage per-user menu assignments.
 * Shows role-based menus as locked (auto-granted by role) and directly
 * assigned menus as toggleable checkboxes.
 *
 * Uses GET /api/menus/user-effective-menus/?user_id= for full context.
 * Saves via POST /api/menus/user-assignments/ (bulk replace direct assignments).
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { RiMenuAddLine } from "react-icons/ri";
import {
  Search,
  Loader2,
  Check,
  Shield,
  Lock,
  Plus,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MenuService from "../../services/menuService";
import RingLoader from "@/components/ui/RingLoader";

/* ─── Tiny helpers ──────────────────────────────────────────── */

const SECTION_ORDER = ["Operations", "Settings", "Admin"];

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    role: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    direct: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    default: "bg-zinc-800 border-zinc-700 text-zinc-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-[0.15em] border",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
};

const StatCard = ({ label, value, color = "text-white" }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className={cn("text-base font-bold tabular-nums", color)}>{value}</span>
    <span className="text-[8px] text-white/30 uppercase tracking-widest font-medium whitespace-nowrap">
      {label}
    </span>
  </div>
);

/* ─── Main Component ────────────────────────────────────────── */

const UserMenuAssignModal = ({ user, onClose, onSuccess }) => {
  const [menus, setMenus] = useState([]); // all active menus with flags
  const [roleMenuIds, setRoleMenuIds] = useState(new Set()); // locked (role-based)
  const [directMenuIds, setDirectMenuIds] = useState(new Set()); // toggleable
  const [pendingDirect, setPendingDirect] = useState(new Set()); // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // all | role | direct | none
  const originalDirectRef = useRef(new Set());

  /* ── Fetch effective menus for this user ─────────────────── */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await MenuService.getUserEffectiveMenus(user.id);
        if (!mounted) return;

        const allMenus = data?.menus || [];
        const roleBased = new Set(
          allMenus.filter((m) => m.role_based).map((m) => m.id)
        );
        const direct = new Set(
          allMenus.filter((m) => m.direct_assigned).map((m) => m.id)
        );

        originalDirectRef.current = new Set(direct);
        setMenus(allMenus);
        setRoleMenuIds(roleBased);
        setDirectMenuIds(direct);
        setPendingDirect(new Set(direct));
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load menu data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  /* ── Toggle a direct assignment ─────────────────────────── */
  const toggleDirect = (menuId) => {
    if (roleMenuIds.has(menuId)) return; // locked — role grants this
    setPendingDirect((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  /* ── Save changes ────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await MenuService.bulkAssignMenusToUser(user.id, Array.from(pendingDirect));
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save menu assignments");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived state ───────────────────────────────────────── */
  const hasChanges = useMemo(() => {
    if (pendingDirect.size !== originalDirectRef.current.size) return true;
    for (const id of pendingDirect) {
      if (!originalDirectRef.current.has(id)) return true;
    }
    return false;
  }, [pendingDirect]);

  const stats = useMemo(() => {
    const effective = new Set([...roleMenuIds, ...pendingDirect]);
    return {
      total: menus.length,
      roleBased: roleMenuIds.size,
      directAdded: pendingDirect.size,
      effective: effective.size,
    };
  }, [menus, roleMenuIds, pendingDirect]);

  /* ── Filter & search ─────────────────────────────────────── */
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          menu.name?.toLowerCase().includes(q) ||
          menu.code?.toLowerCase().includes(q) ||
          menu.href?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Tab filter
      if (activeFilter === "role") return roleMenuIds.has(menu.id);
      if (activeFilter === "direct") return pendingDirect.has(menu.id);
      if (activeFilter === "none")
        return !roleMenuIds.has(menu.id) && !pendingDirect.has(menu.id);

      return true; // "all"
    });
  }, [menus, searchQuery, activeFilter, roleMenuIds, pendingDirect]);

  /* ── Group by section ────────────────────────────────────── */
  const groupedSections = useMemo(() => {
    const map = {};
    filteredMenus.forEach((menu) => {
      const sec = menu.section || "Other";
      if (!map[sec]) map[sec] = [];
      map[sec].push(menu);
    });

    const ordered = [];
    SECTION_ORDER.forEach((sec) => {
      if (map[sec]) ordered.push({ section: sec, items: map[sec] });
    });
    Object.keys(map)
      .filter((s) => !SECTION_ORDER.includes(s))
      .forEach((sec) => ordered.push({ section: sec, items: map[sec] }));
    return ordered;
  }, [filteredMenus]);

  /* ── Render ──────────────────────────────────────────────── */
  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-white/[0.015] flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
            <RiMenuAddLine size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white tracking-tight truncate">
              {user.first_name} {user.last_name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-white/30 truncate">{user.email}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold uppercase tracking-widest shrink-0">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────── */}
        {!loading && menus.length > 0 && (
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/10 flex items-center justify-around shrink-0">
            <StatCard label="Total Menus" value={stats.total} />
            <div className="w-px h-8 bg-zinc-800" />
            <StatCard label="Via Role" value={stats.roleBased} color="text-violet-400" />
            <div className="w-px h-8 bg-zinc-800" />
            <StatCard label="Direct" value={stats.directAdded} color="text-emerald-400" />
            <div className="w-px h-8 bg-zinc-800" />
            <StatCard label="Effective" value={stats.effective} color="text-blue-400" />
          </div>
        )}

        {/* ── Filter tabs + Search ────────────────────────────── */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/5 shrink-0 space-y-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {[
              { key: "all", label: "All" },
              { key: "role", label: "Role" },
              { key: "direct", label: "Direct" },
              { key: "none", label: "None" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "px-2.5 py-1 rounded text-[9px] font-semibold uppercase tracking-widest transition-all",
                  activeFilter === tab.key
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "text-white/30 hover:text-white/60 border border-transparent"
                )}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto">
              <div className="flex items-center gap-1.5 text-[8px] text-white/25 font-medium uppercase tracking-widest">
                <Lock size={9} className="text-violet-400/50" />
                <span>Role-locked</span>
                <span className="ml-2">
                  <Check size={9} className="inline text-emerald-400/50" />
                </span>
                <span>Direct assign</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              size={12}
            />
            <input
              type="text"
              placeholder="Search by name, code or path…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-zinc-950 transition-all"
            />
          </div>
        </div>

        {/* ── Menu List ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-14 flex items-center justify-center">
              <RingLoader />
            </div>
          ) : error && menus.length === 0 ? (
            <div className="py-14 text-center px-6">
              <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-medium">
                {error}
              </p>
            </div>
          ) : groupedSections.length === 0 ? (
            <div className="py-14 text-center px-6">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                No menus match your search
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/30">
              {groupedSections.map(({ section, items }) => (
                <div key={section}>
                  {/* Section header */}
                  <div className="px-6 py-2 bg-zinc-900/20 flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/20">
                      {section}
                    </span>
                    <span className="text-[8px] text-white/10 font-medium">
                      {items.length}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-zinc-800/15">
                    {items
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((menu) => {
                        const isRoleLocked = roleMenuIds.has(menu.id);
                        const isDirectChecked = pendingDirect.has(menu.id);
                        const isChecked = isRoleLocked || isDirectChecked;

                        return (
                          <button
                            key={menu.id}
                            onClick={() => !isRoleLocked && toggleDirect(menu.id)}
                            disabled={isRoleLocked}
                            className={cn(
                              "w-full px-6 py-2.5 flex items-center gap-3 text-left transition-all",
                              isRoleLocked
                                ? "cursor-default opacity-70"
                                : "hover:bg-white/[0.025] cursor-pointer"
                            )}
                          >
                            {/* Checkbox / Lock indicator */}
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                                isRoleLocked
                                  ? "bg-violet-500/15 border-violet-500/30"
                                  : isDirectChecked
                                  ? "bg-emerald-500/80 border-emerald-500"
                                  : "border-zinc-600 bg-transparent"
                              )}
                            >
                              {isRoleLocked ? (
                                <Lock size={8} className="text-violet-400" />
                              ) : isDirectChecked ? (
                                <Check
                                  size={9}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              ) : null}
                            </div>

                            {/* Menu info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-xs font-medium uppercase tracking-wider truncate transition-colors",
                                    isChecked
                                      ? "text-white"
                                      : "text-white/40 hover:text-white/60"
                                  )}
                                >
                                  {menu.name || menu.code}
                                </span>
                                {isRoleLocked && (
                                  <Badge variant="role">
                                    <Shield size={7} />
                                    Role
                                  </Badge>
                                )}
                                {isDirectChecked && !isRoleLocked && (
                                  <Badge variant="direct">
                                    <Plus size={7} />
                                    Direct
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[9px] text-white/20 font-mono mt-0.5 truncate">
                                {menu.href}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Error banner ───────────────────────────────────── */}
        {error && !loading && menus.length > 0 && (
          <div className="px-6 py-2 bg-red-900/20 border-t border-red-500/20 shrink-0">
            <p className="text-[9px] text-red-400 uppercase tracking-widest font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ── Role-based info banner ──────────────────────────── */}
        {!loading && roleMenuIds.size > 0 && (
          <div className="px-6 py-2 bg-violet-900/10 border-t border-violet-500/10 flex items-center gap-2 shrink-0">
            <Info size={11} className="text-violet-400/60 shrink-0" />
            <p className="text-[9px] text-violet-400/60 font-medium">
              <span className="font-bold text-violet-400">{roleMenuIds.size}</span>{" "}
              menu{roleMenuIds.size !== 1 ? "s" : ""} auto-granted via the{" "}
              <span className="font-bold text-violet-400">{user.role}</span> role
              and cannot be removed here.
            </p>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <span className="text-[9px] font-medium text-white/25 uppercase tracking-widest">
            {stats.effective} of {stats.total} effective
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[9px] font-semibold text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-lg cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving || !hasChanges}
              className={cn(
                "px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5 disabled:opacity-40",
                hasChanges
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 cursor-pointer"
                  : "bg-zinc-900 border border-zinc-800 text-white/30 cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={11} />
                  {hasChanges ? "Save Changes" : "No Changes"}
                </>
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
