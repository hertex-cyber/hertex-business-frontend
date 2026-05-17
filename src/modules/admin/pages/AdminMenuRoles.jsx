import React, { useEffect, useState } from "react";
import { ChevronLeft, Loader, Search, Save, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const AVAILABLE_ROLES = ["Superadmin", "Admin", "Manager", "Staff", "Vendor", "User"];

export default function AdminMenuRoles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const PAGE_SIZE = 100; // Must match DRF PAGE_SIZE in settings.py

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/menus/", {
        params: { page: currentPage }
      });
      if (response.data && response.data.results) {
        // Standard DRF paginated response: { count, next, previous, results }
        const { count, next, previous, results } = response.data;
        setMenus(results || []);
        setHasNext(!!next);
        setHasPrev(!!previous);
        setTotalPages(count ? Math.ceil(count / PAGE_SIZE) : 1);
      } else if (Array.isArray(response.data)) {
        setMenus(response.data);
        setHasNext(false);
        setHasPrev(false);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [currentPage]);

  const handleRoleToggle = async (menu, role) => {
    // If it's a Custom menu and user is not in the same org
    if (menu.type === "CUSTOM" && user?.organization && menu.organization !== user?.organization) {
      alert("You can only modify menus belonging to your organization.");
      return;
    }

    const hasRole = menu.roles?.includes(role);
    const originalMenus = [...menus];
    
    // Optimistic update
    setMenus((prev) =>
      prev.map((m) => {
        if (m.id === menu.id) {
          return {
            ...m,
            roles: hasRole 
              ? m.roles.filter((r) => r !== role) 
              : [...(m.roles || []), role],
          };
        }
        return m;
      })
    );

    try {
      const endpoint = hasRole ? "remove-role" : "assign-role";
      const payload = {
        role,
        organization: menu.type === "CUSTOM" ? user?.organization : null, // SYSTEM menus are global
      };
      await axios.post(`/api/menus/${menu.id}/${endpoint}/`, payload);
    } catch (err) {
      console.error(err);
      alert("Failed to update role assignment.");
      // Rollback
      setMenus(originalMenus);
    }
  };

  const filteredMenus = menus.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/admin/menus")}
            className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to Menus
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield size={32} className="text-blue-500" />
            Role Assignments
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Map menus to user roles to control access visibility dynamically
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="px-10 py-8">
        <div className="mb-6 relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by Name or Section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
             <span className="text-white/40 animate-pulse">Loading menu configuration...</span>
          </div>
        ) : error ? (
           <div className="p-4 bg-red-500/10 text-red-400 rounded-lg">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full bg-[#0a0a0a]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40 sticky left-0 bg-[#0a0a0a] z-10 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.5)]">
                    Menu Detail
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">
                    Type
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">
                    Status
                  </th>
                  {AVAILABLE_ROLES.map((role) => (
                    <th key={role} className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/60">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMenus.map((menu) => {
                  const canEdit = user?.role === "Superadmin" || user?.role === "Admin";
                  
                  return (
                    <tr key={menu.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-[#0a0a0a] group-hover:bg-[#111] transition-colors z-10 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.5)]">
                         <div className="text-white font-medium">{menu.name}</div>
                         <div className="text-xs text-white/40">{menu.href} <span className="opacity-50 ml-2">({menu.section})</span></div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-medium">
                        <span className={`inline-block px-2 py-1 rounded ${menu.type === "SYSTEM" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                          {menu.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-medium">
                        <span className={`inline-block px-2 py-1 rounded ${menu.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {menu.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {AVAILABLE_ROLES.map((role) => (
                        <td key={`${menu.id}-${role}`} className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={menu.roles?.includes(role) || false}
                            onChange={() => handleRoleToggle(menu, role)}
                            disabled={!canEdit}
                            className="w-4 h-4 rounded bg-white/10 border border-white/20 accent-blue-500 cursor-pointer disabled:opacity-20"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {(hasNext || hasPrev) && (
              <div className="flex gap-2 justify-end p-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-white/60 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasNext}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
