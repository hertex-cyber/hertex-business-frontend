/**
 * Admin Menus Management Page
 * Display and manage all system and custom menus
 * Superadmins can manage system menus
 * Org admins can manage their custom menus
 */
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Filter, Search, Loader, Shield, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminMenus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  const [sortBy, setSortBy] = useState("name"); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch menus
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/menus/", {
        params: { page: currentPage }
      });
      if (response.data && response.data.results) {
        setMenus(response.data.results || []);
        if (response.data.count) {
          // Default DRF pagination size is often 10 or 20, calculating total pages based on next/previous existance is safer, or assuming PAGE_SIZE
          // We'll estimate based on returned array length if it's the first page
          const pageSize = response.data.results.length > 0 ? (response.data.results.length >= 20 ? 20 : (response.data.count > response.data.results.length ? response.data.results.length : 20)) : 20;
          setTotalPages(Math.ceil(response.data.count / (pageSize || 20)));
          setTotalCount(response.data.count);
        }
        setError(null);
      } else if (Array.isArray(response.data)) {
        setMenus(response.data);
        setTotalPages(1);
        setTotalCount(response.data.length);
        setError(null);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      setError(err.message || "Failed to load menus");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [currentPage]);

  // Filter and sort menus
  const filteredMenus = menus
    .filter((menu) => {
      // Filter by type
      if (filterType !== "all" && menu.type !== filterType) return false;
      // Filter by search term
      if (
        searchTerm &&
        !menu.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !menu.code.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "section") return a.section.localeCompare(b.section);
      if (sortBy === "created")
        return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  // Check if user can edit/delete menu
  const canManageMenu = (menu) => {
    if (menu.type === "SYSTEM") {
      return user?.role === "Superadmin";
    }
    return user?.role === "Superadmin" || user?.role === "Admin";
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;

    try {
      const response = await axios.delete(`/api/menus/${menuId}/`);
      if (response.data?.success) {
        setMenus(menus.filter((m) => m.id !== menuId));
      } else {
        alert("Failed to delete menu");
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to Admin Panel
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            ⚙️ Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Menus
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Manage system and custom menus
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/menus/roles")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-colors font-medium text-sm"
          >
            <Shield size={18} />
            Assign Roles
          </button>
          <button
            onClick={() => navigate("/admin/menus/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Create Menu
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-10 py-6 border-b border-white/5 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/40" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Menus</option>
              <option value="SYSTEM">System Only</option>
              <option value="CUSTOM">Custom Only</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="name">Sort: Name</option>
            <option value="section">Sort: Section</option>
            <option value="created">Sort: Created</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchMenus}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="text-white/40 animate-spin mr-2" />
            <span className="text-white/40">Loading menus...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {!loading && filteredMenus.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 mb-4">No menus found</p>
            <button
              onClick={() => navigate("/admin/menus/create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20"
            >
              <Plus size={18} />
              Create First Menu
            </button>
          </div>
        )}

        {!loading && filteredMenus.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMenus.map((menu) => (
                  <tr
                    key={menu.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{menu.name}</div>
                      <div className="text-xs text-white/40">{menu.href}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                        {menu.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          menu.type === "SYSTEM"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {menu.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {menu.section}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          menu.is_active
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {menu.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {canManageMenu(menu) && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/admin/menus/${menu.id}/edit`)
                              }
                              className="p-2 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400/40 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {!canManageMenu(menu) && (
                          <span className="text-xs text-white/20">
                            Read-only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats and Pagination */}
        {!loading && filteredMenus.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-4 text-sm text-white/40">
              <span>Total items: {totalCount}</span>
            </div>
            
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-white/60 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
