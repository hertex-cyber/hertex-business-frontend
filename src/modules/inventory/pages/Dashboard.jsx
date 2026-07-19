import React, { useState } from "react";
import {
  Package, IndianRupee, Warehouse, Lock, Truck, AlertTriangle,
  CalendarCheck, ArrowLeftRight, ClipboardList, PackageCheck,
  Scale, RefreshCw, TrendingUp, ShoppingCart, PieChart,
  Clock, AlertCircle, Activity, Box, Eye,
} from "lucide-react";
import { useDashboard, useDashboardCards, useDashboardCharts, useLowStock, useOutOfStock, useReportExport } from "../hooks/useDashboard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart as RePie, Pie, Cell,
} from "recharts";

const CHART_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee", "#fb923c", "#818cf8"];
const BAR_FILL = "rgba(96,165,250,0.7)";
const AREA_FILL = "rgba(52,211,153,0.15)";
const AREA_STROKE = "#34d399";
const AGING_FILL = "rgba(251,191,36,0.7)";
const PURPLE_FILL = "rgba(167,139,250,0.7)";

const formatCurrency = (value) => {
  if (!value && value !== 0) return "—";
  return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "—";
  return Number(value).toLocaleString("en-IN");
};

const CARD_CONFIG = [
  { key: "total_items", label: "Total Items", icon: Package, color: "blue", format: "number" },
  { key: "total_stock_value", label: "Total Stock Value", icon: IndianRupee, color: "emerald", format: "currency" },
  { key: "available_stock_value", label: "Available Stock Value", icon: IndianRupee, color: "green", format: "currency" },
  { key: "reserved_items", label: "Reserved Stock", icon: Lock, color: "amber", format: "number" },
  { key: "in_transit_items", label: "In Transit", icon: Truck, color: "cyan", format: "number" },
  { key: "damaged_items", label: "Damaged Stock", icon: AlertTriangle, color: "red", format: "number" },
  { key: "active_reservations", label: "Active Reservations", icon: CalendarCheck, color: "purple", format: "number" },
  { key: "pending_transfers", label: "Pending Transfers", icon: ArrowLeftRight, color: "orange", format: "number" },
  { key: "pending_purchase_orders", label: "Pending POs", icon: ClipboardList, color: "indigo", format: "number" },
  { key: "pending_grns", label: "Pending GRNs", icon: PackageCheck, color: "teal", format: "number" },
  { key: "pending_stock_counts", label: "Pending Stock Counts", icon: Scale, color: "pink", format: "number" },
  { key: "pending_adjustments", label: "Pending Adjustments", icon: Activity, color: "rose", format: "number" },
];

const colorMap = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const formatCardValue = (val, format) => {
  if (!val && val !== 0) return "—";
  if (format === "currency") return `₹${formatCurrency(val)}`;
  return formatNumber(val);
};

const Dashboard = () => {
  const { dashboard, loading: dashLoading, error, refetch } = useDashboard();
  const { cards, loading: cardsLoading, refetch: refetchCards } = useDashboardCards();
  const { charts, loading: chartsLoading, refetch: refetchCharts } = useDashboardCharts();
  const { data: lowStockData, loading: lowLoading } = useLowStock();
  const { data: outOfStockData, loading: oosLoading } = useOutOfStock();
  const { loading: exportLoading, exportReport } = useReportExport();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchCards(), refetchCharts()]);
    setRefreshing(false);
  };

  const loading = dashLoading || cardsLoading || chartsLoading;
  const cardData = cards || dashboard?.cards;
  const chartData = charts || {};

  const pendingItems = cardData ? [
    { label: "Pending Transfers", count: cardData.pending_transfers || 0, href: "/inventory/transfers", icon: ArrowLeftRight },
    { label: "Pending POs", count: cardData.pending_purchase_orders || 0, href: "/inventory/purchase-orders", icon: ClipboardList },
    { label: "Pending GRNs", count: cardData.pending_grns || 0, href: "/inventory/goods-receipts", icon: PackageCheck },
    { label: "Pending Counts", count: cardData.pending_stock_counts || 0, href: "/inventory/stock-counts", icon: Scale },
    { label: "Pending Adjustments", count: cardData.pending_adjustments || 0, href: "/inventory/adjustments", icon: Activity },
  ] : [];

  const recentTransactions = dashboard?.recent_transactions || [];

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <span className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            Real-Time Overview
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Inventory Dashboard</h1>
          <p className="text-sm text-white/40 font-medium">
            {cardData ? `${formatNumber(cardData.total_items)} items tracked` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} disabled={refreshing}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-2">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "..." : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-10 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="text-white/30 animate-spin" />
        </div>
      ) : (
        <main className="flex-1 p-10 pt-6 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {CARD_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              const val = cardData?.[cfg.key];
              return (
                <div key={cfg.key} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[cfg.color]}`}>
                      <Icon size={15} />
                    </div>
                  </div>
                  <p className="text-xs text-white/30 font-medium mb-0.5">{cfg.label}</p>
                  <p className="text-lg font-bold text-white tracking-tight">
                    {formatCardValue(val, cfg.format)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight mb-4">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* By Category (Donut) */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart size={14} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">By Category</span>
                </div>
                {chartData.category_inventory?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePie>
                        <Pie data={chartData.category_inventory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                          label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}>
                          {chartData.category_inventory.map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                          formatter={(value) => [Number(value).toLocaleString(), "Value"]}
                          cursor={{ fill: 'transparent' }}
                        />
                      </RePie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <PieChart size={24} className="text-white/10 mb-2" />
                    <p className="text-xs text-white/30">No category data</p>
                  </div>
                )}
              </div>

              {/* Stock Movement */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Stock Movement</span>
                </div>
                {chartData.stock_movement?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.stock_movement} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                          itemStyle={{ color: "rgba(255,255,255,0.9)" }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="total" fill={BAR_FILL} radius={[3, 3, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <TrendingUp size={24} className="text-white/10 mb-2" />
                    <p className="text-xs text-white/30">No movement data</p>
                  </div>
                )}
              </div>

              {/* Monthly Purchases */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Monthly Purchases</span>
                </div>
                {chartData.monthly_purchases?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.monthly_purchases} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                          itemStyle={{ color: AREA_STROKE }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Area type="monotone" dataKey="total" stroke={AREA_STROKE} fill={AREA_FILL} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <ShoppingCart size={24} className="text-white/10 mb-2" />
                    <p className="text-xs text-white/30">No purchase data</p>
                  </div>
                )}
              </div>

              {/* Stock Aging */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Stock Aging</span>
                </div>
                {chartData.aging_distribution?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.aging_distribution} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" fill={AGING_FILL} radius={[3, 3, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Clock size={24} className="text-white/10 mb-2" />
                    <p className="text-xs text-white/30">No aging data</p>
                  </div>
                )}
              </div>

              {/* Warehouse Inventory */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Warehouse size={14} className="text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">By Warehouse</span>
                </div>
                {chartData.warehouse_inventory?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.warehouse_inventory} layout="vertical" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="warehouse" type="category" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} width={100} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" fill={PURPLE_FILL} radius={[0, 3, 3, 0]} maxBarSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Warehouse size={24} className="text-white/10 mb-2" />
                    <p className="text-xs text-white/30">No warehouse data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alerts */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Low Stock Alerts</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/60">
                  {lowStockData?.length || 0} items
                </span>
              </div>
              {lowLoading ? (
                <div className="flex justify-center py-6"><RefreshCw size={16} className="text-white/20 animate-spin" /></div>
              ) : lowStockData?.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lowStockData.slice(0, 10).map((item) => (
                    <div key={item.item_id} className="flex items-center justify-between px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                      <div>
                        <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                        <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-400">{item.current_stock}</span>
                        <span className="text-[10px] text-white/30 ml-1">/ {item.min_stock_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <AlertTriangle size={24} className="text-white/10 mb-2" />
                  <p className="text-sm text-white/30">All items are well stocked</p>
                </div>
              )}
            </div>

            {/* Out of Stock Alerts */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">Out of Stock</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/60">
                  {outOfStockData?.length || 0} items
                </span>
              </div>
              {oosLoading ? (
                <div className="flex justify-center py-6"><RefreshCw size={16} className="text-white/20 animate-spin" /></div>
              ) : outOfStockData?.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {outOfStockData.slice(0, 10).map((item) => (
                    <div key={item.item_id} className="flex items-center justify-between px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <div>
                        <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                        <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                      </div>
                      <span className="text-sm font-bold text-red-400">{item.current_stock}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <AlertCircle size={24} className="text-white/10 mb-2" />
                  <p className="text-sm text-white/30">No items out of stock</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Activity Timeline + Pending Workflows + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">
                  Last {recentTransactions.length} transactions
                </span>
              </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {recentTransactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] rounded-lg transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          txn.quantity > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          <Activity size={12} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {txn.item?.item_name || "Unknown item"}
                          </p>
                          <p className="text-[10px] text-white/30 font-medium">
                            {txn.transaction_type} · {txn.location?.location_name || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-sm font-bold ${txn.quantity > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {txn.quantity > 0 ? "+" : ""}{txn.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Activity size={24} className="text-white/10 mb-2" />
                  <p className="text-sm text-white/30">No recent transactions</p>
                </div>
              )}
            </div>

            {/* Pending Workflows */}
            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={14} className="text-orange-400" /> Pending Workflows
                </h3>
                <div className="space-y-2">
                  {pendingItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a key={item.label} href={item.href}
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] rounded-lg transition-colors group">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-white/30 group-hover:text-orange-400 transition-colors" />
                          <span className="text-sm text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                        </div>
                        {item.count > 0 ? (
                          <span className="text-sm font-bold text-orange-400">{item.count}</span>
                        ) : (
                          <span className="text-[10px] text-white/20">—</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Box size={14} className="text-blue-400" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "New Transfer", href: "/inventory/transfers", icon: ArrowLeftRight },
                    { label: "New Adjustment", href: "/inventory/adjustments", icon: Scale },
                    { label: "New Reservation", href: "/inventory/reservations", icon: CalendarCheck },
                    { label: "New PO", href: "/inventory/purchase-orders", icon: ClipboardList },
                    { label: "New GRN", href: "/inventory/goods-receipts", icon: PackageCheck },
                    { label: "Stock Count", href: "/inventory/stock-counts", icon: Eye },
                  ].map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <a key={action.label} href={action.href}
                        className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all group">
                        <ActionIcon size={18} className="text-white/30 group-hover:text-blue-400 transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors">{action.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Dashboard;
