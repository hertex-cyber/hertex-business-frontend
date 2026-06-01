import React, { useState, useEffect } from 'react';
import { LogOut, FileText, CheckCircle, Loader, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ExitManagementDashboard() {
  const navigate = useNavigate();
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/hr/resignations/');
      setResignations(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <LogOut size={32} className="text-red-500" />
            Exit Management
          </h1>
          <p className="text-sm text-white/40 font-medium">Handle resignations, departmental clearances, and full & final settlements.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-red-500 animate-spin mr-2" />
            <span className="text-white/40">Loading exit data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Pending Resignations</h2>
            
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full bg-[#0a0a0a]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Submitted On</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Last Working Day</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resignations.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">No pending resignations.</td></tr>
                  ) : resignations.map(resig => (
                    <tr key={resig.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{resig.employee?.first_name || 'Unknown Employee'}</div>
                        <div className="text-xs text-white/40">Emp ID: {resig.employee?.employee_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-sm">{resig.submitted_on}</td>
                      <td className="px-6 py-4 text-white/70 text-sm">{resig.approved_last_working_day || resig.requested_last_working_day}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${resig.status === 'Pending' ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'}`}>
                          {resig.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors flex items-center justify-center gap-2 mx-auto">
                          <CheckCircle size={14} /> Start Clearance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-green-400"/> Full & Final Settlements (F&F)</h3>
                <p className="text-sm text-white/40 mb-4">Calculate final payroll, leave encashment, gratuity, and loan recoveries for exiting employees.</p>
                <button className="text-sm text-green-400 hover:text-green-300">Process F&F &rarr;</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
