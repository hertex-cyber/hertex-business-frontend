import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/[0.02] transition-colors" />
    <div className="flex justify-between items-start relative z-10">
      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
        trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      )}>
        {change}
        <ArrowUpRight size={10} />
      </div>
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">{title}</p>
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
    </div>
  </div>
);

export default StatCard;
