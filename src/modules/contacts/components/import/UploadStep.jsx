import React from 'react';
import { Upload, Tag } from 'lucide-react';

const UploadStep = ({ fileInputRef, onFileChange, importName, onImportNameChange }) => (
    <div className="h-full flex flex-col gap-5">
        {/* Import Name */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <Tag size={14} className="text-blue-500/50 shrink-0" />
            <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1.5">Import Name / Source</p>
                <input
                    type="text"
                    value={importName}
                    onChange={(e) => onImportNameChange(e.target.value)}
                    placeholder="e.g. Q1 Trade Show, LinkedIn Export..."
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/20 outline-none border-none focus:outline-none"
                />
            </div>
        </div>

        {/* Drop Zone */}
        <div
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 bg-zinc-900/30 rounded-2xl group hover:bg-zinc-900/50 hover:border-blue-500/20 transition-all duration-500 cursor-pointer relative overflow-hidden"
        >
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/10 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                    <Upload size={28} />
                </div>
            </div>
            <div className="text-center space-y-1 mt-5">
                <h3 className="text-md text-white group-hover:text-blue-400 transition-colors">Upload Contacts File</h3>
                <p className="text-md text-white/50">Click to browse or drop CSV / Excel</p>
            </div>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".csv, .xlsx, .xls" />
        </div>
    </div>
);

export default UploadStep;
