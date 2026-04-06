import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <div className="h-screen bg-black text-white relative flex flex-col items-center overflow-hidden font-inter">
      {/* Background blobs for "pop" */}
      <div className="blob -top-[200px] -left-[200px] opacity-40" />
      <div className="blob -bottom-[200px] -right-[200px] opacity-20" style={{ animationDelay: '-5s' }} />
      
      {/* Header */}
      <header className="w-full max-w-[1200px] px-8 py-10 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <span className="text-xl font-bold tracking-tight">ByteHive</span>
        </div>
       
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1200px] flex-1 flex flex-col lg:flex-row items-center justify-between px-8 gap-16 relative z-10 pb-20 mt-10">
        
        {/* Left Side: Hero Section */}
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Now in Private Beta
            </div>
            
            <h1 className="text-6xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-gradient">
              Grow your business <br />
              with precision.
            </h1>
            
            <p className="text-lg text-white/40 max-w-[460px] leading-relaxed">
              The all-in-one CRM platform designed for high-growth teams. 
              Manage leads, automate workflows, and scale your operations with ease.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-[500px]">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] transition-all duration-300 space-y-2 group/card">
              <h3 className="text-sm font-semibold text-white group-hover/card:text-white transition-colors">Real-time Insights</h3>
              <p className="text-xs text-white/30 leading-relaxed group-hover/card:text-white/50 transition-colors">Instant telemetry on your sales pipeline and customer engagement metrics.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] transition-all duration-300 space-y-2 group/card">
              <h3 className="text-sm font-semibold text-white group-hover/card:text-white transition-colors">Automated Flow</h3>
              <p className="text-xs text-white/30 leading-relaxed group-hover/card:text-white/50 transition-colors">Eliminate manual tasks with smart workflows that trigger on customer actions.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1200px] px-8 py-10 flex justify-between items-center z-10 border-t border-white/5">
        <p className="text-xs text-white/20">© 2026 ByteHive Systems Inc.</p>
        <div className="flex gap-8">
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
