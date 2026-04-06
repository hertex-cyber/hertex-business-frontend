import React from 'react';
import { TrendingUp, Plus, Search, Filter, Target, BarChart3, ArrowUpRight } from 'lucide-react';
import Button from '../components/Button';

const Sales = () => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <TrendingUp size={10} />
            Revenue Operations
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Sales</h1>
          <p className="text-sm text-white/40 font-medium">Track your performance and targets</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="primary" className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            New Deal
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <Target size={20} className="text-white/20" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Q2 Target</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">$450,000</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">65% of Goal Achieved</p>
            </div>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
            <BarChart3 size={20} className="text-white/20" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Avg Deal Size</p>
              <p className="text-3xl font-bold">$12,450</p>
            </div>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
            <TrendingUp size={20} className="text-white/20" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Conversion Rate</p>
              <p className="text-3xl font-bold">24.2%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sales;
