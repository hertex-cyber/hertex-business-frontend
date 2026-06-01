import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Filter, Loader, Users, MoreVertical, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RecruitmentDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candRes, reqRes] = await Promise.all([
        axios.get('/api/hr/candidates/'),
        axios.get('/api/hr/job-requisitions/')
      ]);
      setCandidates(candRes.data.results || candRes.data || []);
      setRequisitions(reqRes.data.results || reqRes.data || []);
    } catch (err) {
      console.error("Failed to fetch recruitment data", err);
    } finally {
      setLoading(false);
    }
  };

  const stages = ['Applied', 'Screening', 'L1_Interview', 'L2_Interview', 'HR_Round', 'Offered', 'Accepted'];

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Briefcase size={32} className="text-purple-500" />
            Recruitment & ATS
          </h1>
          <p className="text-sm text-white/40 font-medium">Manage job requisitions and track candidate pipelines.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors font-medium text-sm">
            Add Candidate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors font-medium text-sm">
            <Plus size={18} /> New Requisition
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-purple-500 animate-spin mr-2" />
            <span className="text-white/40">Loading recruitment data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Requisitions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Active Job Requisitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requisitions.length === 0 ? (
                  <p className="text-white/40">No active job requisitions.</p>
                ) : requisitions.map((req) => (
                  <div key={req.id} className="p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">{req.designation?.name || 'Unknown Designation'}</h3>
                        <p className="text-sm text-white/40">{req.department?.name || 'General'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${req.priority === 'High' || req.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {req.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1"><Users size={14} /> {req.vacancies} Vacancies</div>
                      <div>Status: <span className="text-white">{req.status}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Pipeline (Kanban placeholder) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Candidate Pipeline</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" placeholder="Search candidates..." className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <button className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white"><Filter size={16} /></button>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {stages.map(stage => (
                  <div key={stage} className="min-w-[300px] flex-shrink-0 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col max-h-[600px]">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                      <h3 className="font-bold text-white text-sm">{stage.replace('_', ' ')}</h3>
                      <span className="text-xs font-medium text-white/40 bg-white/10 px-2 py-0.5 rounded-full">0</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                      {/* Placeholder for draggable candidate cards */}
                      <div className="p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/20 cursor-pointer">
                        <div className="text-sm text-white/40 italic text-center py-4">No candidates in this stage</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
