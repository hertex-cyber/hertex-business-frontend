import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Sidebar from '@/components/Sidebar';
import StatCard from '../components/StatCard';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <span className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            Live Operations
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-white/40 font-medium">System status for {user?.username || 'Administrator'}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="w-auto px-4 py-2 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest">
            Refresh Data
          </Button>
          <Button variant="primary" className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            New Project
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 space-y-10 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Active Customers" 
            value="1,284" 
            change="+12%" 
            icon={Users} 
            trend="up" 
          />
          <StatCard 
            title="Sales Velocity" 
            value="42.5%" 
            change="+5.2%" 
            icon={TrendingUp} 
            trend="up" 
          />
          <StatCard 
            title="Net Revenue" 
            value="$124.5k" 
            change="+24%" 
            icon={DollarSign} 
            trend="up" 
          />
          <StatCard 
            title="System Load" 
            value="14.2%" 
            change="-2.1%" 
            icon={Activity} 
            trend="down" 
          />
        </div>

        {/* Recent Activity / CRM Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Pipelines</h2>
              <button className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">View All</button>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                      <Users size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">Customer Deal #{i*234}</p>
                      <p className="text-xs text-white/20 font-medium">Status: Negotiation // Probability: 85%</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight px-2">Notifications</h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 bg-white/[0.02] border-l-2 border-blue-500/50 rounded-r-2xl space-y-2">
                  <p className="text-xs font-bold text-white/80">Inventory Update Required</p>
                  <p className="text-[10px] text-white/30 leading-relaxed font-medium">SKU-0923 and 4 others are below threshold. Re-order recommended.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
