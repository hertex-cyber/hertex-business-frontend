import React from 'react';
import { 
  Users, 
  FileText, 
  Box, 
  Briefcase, 
  CreditCard, 
  Image as ImageIcon, 
  GraduationCap, 
  TrendingUp, 
  ShieldCheck,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { name: 'CRM', icon: Users, href: '/crm' },
  { name: 'Doc Tools', icon: FileText, href: '/docs' },
  { name: 'Inventory', icon: Box, href: '/inventory' },
  { name: 'HR', icon: Briefcase, href: '/hr' },
  { name: 'Accounts', icon: CreditCard, href: '/accounts' },
  { name: 'Media', icon: ImageIcon, href: '/media' },
  { name: 'LMS', icon: GraduationCap, href: '/lms' },
  { name: 'Sales', icon: TrendingUp, href: '/sales' },
  { name: 'Admin', icon: ShieldCheck, href: '/admin' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-black border-r border-white/5 flex flex-col font-inter z-30 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-radial-[circle_at_0%_0%] from-white/5 to-transparent pointer-events-none" />

      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-black rounded-sm" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">ByteHive</span>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-4 py-6 space-y-8 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">Operations</h3>
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="transition-colors group-hover:text-blue-400" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </a>
          ))}
        </div>

        <div className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">Settings</h3>
          <a
            href="/settings"
            className="group flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Settings size={18} className="transition-colors group-hover:text-blue-400" />
            <span className="text-sm font-medium">Preferences</span>
          </a>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 relative z-10 bg-black">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.username || 'Admin'}</p>
            <p className="text-[10px] font-medium text-white/20 truncate">{user?.email || 'admin@bytehive.com'}</p>
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
