import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, LogOut, ChevronRight, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { getLucideIcon } from "@/utils/iconMapper";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sections, loading, error } = useMenu();
  const location = useLocation();
  return (
    <div className="h-screen w-64 bg-black border-r border-white/5 flex flex-col font-inter z-30 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-radial-[circle_at_0%_0%] from-white/5 to-transparent pointer-events-none" />

      {/* Logo Section */}
      <Link
        to="/dashboard"
        className="p-6 flex items-center gap-3 relative z-10 group"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 overflow-hidden">
          <img
            src={logo}
            alt="ByteHive"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          ByteHive
        </span>
      </Link>

      {/* Navigation Groups */}
      <div className="flex-1 px-4 py-6 space-y-8 relative z-10 overflow-y-auto custom-scrollbar">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader size={20} className="text-white/40 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-3 py-2 text-[10px] text-red-400 bg-red-500/10 rounded border border-red-500/20">
            Failed to load menus. Using default menu.
          </div>
        )}

        {/* Menu Sections - Dynamically Rendered from API */}
        {!loading &&
          sections &&
          Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
                {sectionName}
              </h3>
              {items && items.length > 0 ? (
                items
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item) => {
                    const Icon = getLucideIcon(item.icon);
                    const isActive = location.pathname === item.href;

                    return (
                      <Link
                        key={item.id || item.code}
                        to={item.href}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-white/5 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5",
                        )}
                        title={item.name}
                      >
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <Icon
                              size={18}
                              className={cn(
                                "transition-colors",
                                isActive
                                  ? "text-blue-400"
                                  : "group-hover:text-blue-400",
                              )}
                            />
                          )}
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <ChevronRight
                          size={14}
                          className={cn(
                            "transition-all",
                            isActive
                              ? "opacity-100"
                              : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                          )}
                        />
                      </Link>
                    );
                  })
              ) : (
                <p className="px-3 py-2 text-[10px] text-white/20">
                  No menus available
                </p>
              )}
            </div>
          ))}

        {/* Settings Section (static) */}
        <div className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
            Settings
          </h3>
          <Link
            to="/settings"
            className="group flex items-center justify-between px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Settings
                size={18}
                className="transition-colors group-hover:text-blue-400"
              />
              <span className="text-sm font-medium">Preferences</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </Link>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 relative z-10 bg-black">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            {user?.first_name?.charAt(0).toUpperCase() ||
              user?.username?.charAt(0).toUpperCase() ||
              "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || "Admin"}
            </p>
            <p className="text-[10px] font-medium text-white/20 truncate">
              {user?.email || "admin@bytehive.com"}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
