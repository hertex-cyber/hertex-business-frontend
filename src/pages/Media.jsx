import React from 'react';
import { Image as ImageIcon, Plus, Search, Filter, Play, MoreVertical } from 'lucide-react';
import Button from '../components/Button';

const Media = () => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <ImageIcon size={10} />
            Digital Asset Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Media</h1>
          <p className="text-sm text-white/40 font-medium">Manage your images, videos and assets</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="primary" className="w-auto px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            Upload Asset
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
            <div className="aspect-video bg-white/5 relative flex items-center justify-center">
              {i % 3 === 0 ? (
                <Play className="text-white/20 group-hover:text-white transition-colors" size={32} />
              ) : (
                <ImageIcon className="text-white/10 group-hover:text-white/20 transition-colors" size={32} />
              )}
              <div className="absolute top-2 right-2 p-1 rounded-md bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={14} className="text-white" />
              </div>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-sm font-bold text-white truncate">Marketing-Campaign-Asset-{i}.png</p>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">1920x1080</p>
                <p className="text-[10px] text-white/20 font-medium">1.2 MB</p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Media;
