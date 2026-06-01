import React from 'react';
import { Users, Briefcase, Calendar, TrendingUp, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HRAdminDashboard() {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Total Employees', value: '1,245', icon: <Users size={24} className="text-blue-400" />, trend: '+12 this month' },
    { label: 'Open Requisitions', value: '18', icon: <Briefcase size={24} className="text-purple-400" />, trend: '3 critical' },
    { label: 'Employees on Leave', value: '42', icon: <Calendar size={24} className="text-emerald-400" />, trend: 'Today' },
    { label: 'Pending Appraisals', value: '156', icon: <TrendingUp size={24} className="text-orange-400" />, trend: 'Q3 Cycle' },
  ];

  const adminModules = [
    {
      title: 'Employee Master',
      description: 'Manage the core employee database, onboarding, and profiles.',
      icon: <Users size={32} className="text-blue-500" />,
      path: '/hr/admin/employees'
    },
    {
      title: 'Recruitment & ATS',
      description: 'Manage job requisitions, candidates, and interview pipelines.',
      icon: <Briefcase size={32} className="text-purple-500" />,
      path: '/hr/admin/recruitment'
    },
    {
      title: 'Performance (PMS)',
      description: 'Manage appraisal cycles, goals, and performance reviews.',
      icon: <TrendingUp size={32} className="text-orange-500" />,
      path: '/hr/admin/performance'
    },
    {
      title: 'Exit Management',
      description: 'Manage resignations, clearances, and full & final settlements.',
      icon: <LogOut size={32} className="text-red-500" />,
      path: '/hr/admin/exits'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            <Shield size={10} className="text-blue-400" />
            HR Administration
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            HR Admin Hub
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Centralized control for all enterprise HR modules.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                {metric.icon}
              </div>
              <p className="text-sm font-medium text-white/40 mb-4">{metric.label}</p>
              <h3 className="text-3xl font-bold text-white mb-2">{metric.value}</h3>
              <p className="text-xs text-white/30">{metric.trend}</p>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <h2 className="text-xl font-bold text-white mb-6">HR Sub-Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module, index) => (
            <div 
              key={index} 
              onClick={() => navigate(module.path)}
              className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer group"
            >
              <div className="bg-black/50 w-16 h-16 rounded-xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform">
                {module.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{module.title}</h3>
              <p className="text-white/40 leading-relaxed">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
