import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Settings,
  Server,
  Database,
  Lock,
  Key,
  LayoutGrid,
  Building2,
  Package,
  Users,
} from "lucide-react";
import Button from "@/components/Button";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <ShieldCheck size={10} />
            System Administration
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Admin
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Control system settings and infrastructure
          </p>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40">
              <Server size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                System Infrastructure
              </h3>
              <p className="text-xs text-white/20">
                Manage servers and cloud resources
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-sm font-medium text-white/60">
                Server Cluster 01
              </span>
              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-sm font-medium text-white/60">
                Database Replica
              </span>
              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest">
                Synced
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Security & Access
              </h3>
              <p className="text-xs text-white/20">
                Audit logs and permission control
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="justify-start px-4 bg-white/5 border-none hover:bg-white/10"
            >
              <Key size={14} className="mr-3" />
              Manage API Keys
            </Button>
            <Button
              variant="secondary"
              className="justify-start px-4 bg-white/5 border-none hover:bg-white/10 w-full"
            >
              <ShieldCheck size={14} className="mr-3" />
              View Audit Logs
            </Button>
          </div>
        </div>

        {/* New Platform Management Card */}
        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                User Management
              </h3>
              <p className="text-xs text-white/20">
                Manage users, roles, and permissions
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="justify-start px-4 bg-white/5 border-none hover:bg-white/10 w-full"
              onClick={() => navigate("/admin/users")}
            >
              <Users size={14} className="mr-3" />
              Manage Users
            </Button>
          </div>
        </div>

        {/* Platform Management Card */}
        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Platform Management
              </h3>
              <p className="text-xs text-white/20">
                Manage menus, orgs, and products
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="justify-start px-4 bg-white/5 border-none hover:bg-white/10 w-full"
              onClick={() => navigate("/admin/menus")}
            >
              <LayoutGrid size={14} className="mr-3" />
              Manage Menus
            </Button>
            <Button
              variant="secondary"
              className="justify-start px-4 bg-white/5 border-none hover:bg-white/10 w-full"
              onClick={() => navigate("/admin/organizations")}
            >
              <Building2 size={14} className="mr-3" />
              Manage Organizations
            </Button>
            <Button
              variant="secondary"
              className="justify-start px-4 bg-white/5 border-none hover:bg-white/10 w-full"
              onClick={() => navigate("/admin/products")}
            >
              <Package size={14} className="mr-3" />
              Manage Products
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
