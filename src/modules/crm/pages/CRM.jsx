import React from 'react';
import { Users, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CRM = () => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <Users size={10} />
            Customer Relations
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">CRM</h1>
          <p className="text-sm text-white/40 font-medium">Manage your customers and pipelines</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40 transition-colors" size={16} />
            <Input 
              type="text" 
              placeholder="Search customers..." 
              className="rounded-full pl-10 w-64 h-9 bg-white/5 border-white/10 focus:border-white/20 transition-all text-xs"
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-4 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest">
            <Filter size={14} className="mr-2" />
            Filter
          </Button>
          <Button variant="default" size="sm" className="h-9 px-6 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            Add Customer
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Customer</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Status</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Value</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Last Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/[0.01] transition-colors cursor-pointer group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">John Doe #{i}</p>
                        <p className="text-[10px] text-white/20">john.doe@example.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest">
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-medium text-white/60">$12,400</TableCell>
                  <TableCell className="px-6 py-4 text-xs text-white/20 font-medium">2 hours ago</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default CRM;
