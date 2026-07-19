import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search, Download, Filter, RefreshCw, Printer, FileText, FileSpreadsheet,
  BarChart3, TrendingUp, AlertTriangle, Clock, Box, Package,
  ArrowLeftRight, Scale, CalendarCheck, ClipboardList, PackageCheck,
  Undo2, Eye, IndianRupee, Truck, Lock, Warehouse, Activity,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Grid3X3, List,
} from "lucide-react";
import { useReportExport } from "../hooks/useDashboard";
import PrintableReport from "../components/PrintableReport";
import {
  useCurrentStockReport,
  useStockLedgerReport,
  useStockSummaryReport,
  useStockMovementReport,
  useAdjustmentsReport,
  useTransfersReport,
  useReservationsReport,
  usePurchaseOrdersReport,
  useGoodsReceiptsReport,
  usePurchaseReturnsReport,
  useStockCountsReport,
  useLowStock,
  useOutOfStock,
  useReorderReport,
  useFastMoving,
  useSlowMoving,
  useDeadStock,
  useInventoryAging,
} from "../hooks/useDashboard";

const REPORT_GROUPS = [
  {
    label: "Stock Reports",
    icon: Package,
    reports: [
      { id: "current-stock", label: "Current Stock", icon: Box, hook: "useCurrentStockReport" },
      { id: "stock-ledger", label: "Stock Ledger", icon: FileText, hook: "useStockLedgerReport" },
      { id: "stock-movement", label: "Stock Movement", icon: TrendingUp, hook: "useStockMovementReport" },
      { id: "stock-summary", label: "Stock Summary", icon: BarChart3, hook: "useStockSummaryReport" },
      { id: "valuation", label: "Inventory Valuation", icon: IndianRupee, hook: "valuation" },
      { id: "reserved-stock", label: "Reserved Stock", icon: Lock, hook: "reserved" },
      { id: "damaged-stock", label: "Damaged Stock", icon: AlertTriangle, hook: "damaged" },
    ],
  },
  {
    label: "Operational Reports",
    icon: Activity,
    reports: [
      { id: "adjustments", label: "Stock Adjustments", icon: Scale, hook: "useAdjustmentsReport" },
      { id: "transfers", label: "Stock Transfers", icon: ArrowLeftRight, hook: "useTransfersReport" },
      { id: "reservations", label: "Reservations", icon: CalendarCheck, hook: "useReservationsReport" },
      { id: "stock-counts", label: "Stock Counts", icon: Eye, hook: "useStockCountsReport" },
    ],
  },
  {
    label: "Purchase Reports",
    icon: ClipboardList,
    reports: [
      { id: "purchase-orders", label: "Purchase Orders", icon: ClipboardList, hook: "usePurchaseOrdersReport" },
      { id: "goods-receipts", label: "Goods Receipts", icon: PackageCheck, hook: "useGoodsReceiptsReport" },
      { id: "purchase-returns", label: "Purchase Returns", icon: Undo2, hook: "usePurchaseReturnsReport" },
    ],
  },
  {
    label: "Analytics Reports",
    icon: BarChart3,
    reports: [
      { id: "low-stock", label: "Low Stock", icon: AlertTriangle, hook: "lowStock" },
      { id: "out-of-stock", label: "Out of Stock", icon: AlertTriangle, hook: "outOfStock" },
      { id: "reorder", label: "Reorder Report", icon: TrendingUp, hook: "reorder" },
      { id: "fast-moving", label: "Fast Moving Items", icon: TrendingUp, hook: "fastMoving" },
      { id: "slow-moving", label: "Slow Moving Items", icon: Clock, hook: "slowMoving" },
      { id: "dead-stock", label: "Dead Stock", icon: Clock, hook: "deadStock" },
      { id: "inventory-aging", label: "Inventory Aging", icon: Clock, hook: "inventoryAging" },
    ],
  },
];

const FILTER_FIELDS = [
  { key: "search", label: "Search", type: "text" },
  { key: "date_from", label: "Date From", type: "date" },
  { key: "date_to", label: "Date To", type: "date" },
  { key: "location_id", label: "Location ID", type: "text" },
  { key: "category_id", label: "Category ID", type: "text" },
  { key: "supplier_id", label: "Supplier ID", type: "text" },
  { key: "status", label: "Status", type: "text" },
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState("current-stock");
  const [activeGroup, setActiveGroup] = useState("Stock Reports");
  const [viewMode, setViewMode] = useState("table");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [reportSidebarOpen, setReportSidebarOpen] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { loading: exportLoading, exportReport } = useReportExport();
  const [printData, setPrintData] = useState(null);

  const currentStock = useCurrentStockReport(filters);
  const stockLedger = useStockLedgerReport(filters);
  const stockSummary = useStockSummaryReport(filters);
  const stockMovement = useStockMovementReport(filters);
  const adjustments = useAdjustmentsReport(filters);
  const transfers = useTransfersReport(filters);
  const reservations = useReservationsReport(filters);
  const purchaseOrders = usePurchaseOrdersReport(filters);
  const goodsReceipts = useGoodsReceiptsReport(filters);
  const purchaseReturns = usePurchaseReturnsReport(filters);
  const stockCounts = useStockCountsReport(filters);
  const lowStock = useLowStock();
  const outOfStock = useOutOfStock();
  const reorder = useReorderReport();
  const fastMoving = useFastMoving();
  const slowMoving = useSlowMoving();
  const deadStock = useDeadStock();
  const inventoryAging = useInventoryAging();

  const dataMap = {
    "current-stock": currentStock,
    "stock-ledger": stockLedger,
    "stock-summary": stockSummary,
    "stock-movement": stockMovement,
    adjustments, transfers, reservations, "stock-counts": stockCounts,
    "purchase-orders": purchaseOrders,
    "goods-receipts": goodsReceipts,
    "purchase-returns": purchaseReturns,
    "low-stock": lowStock,
    "out-of-stock": outOfStock,
    reorder, "fast-moving": fastMoving,
    "slow-moving": slowMoving, "dead-stock": deadStock,
    "inventory-aging": inventoryAging,
  };

  const activeData = dataMap[activeReport];
  const reportConfig = REPORT_GROUPS.flatMap((g) => g.reports).find((r) => r.id === activeReport);
  const reportIcon = reportConfig?.icon || FileText;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    const data = activeData?.data || [];
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [activeData?.data, sortField, sortDir]);

  const paginatedData = sortedData.slice(0, page * pageSize);

  const handleExport = async (fmt) => {
    await exportReport(activeReport, { export_format: fmt, ...filters });
  };

  const handlePrint = () => {
    setPrintData({
      reportType: activeReport,
      title: reportConfig?.label || activeReport,
      data: sortedData,
      filters,
      totalRecords: sortedData.length,
    });
  };

  useEffect(() => {
    if (printData) {
      const timer = setTimeout(() => window.print(), 200);
      return () => clearTimeout(timer);
    }
  }, [printData]);

  useEffect(() => {
    const handler = () => setPrintData(null);
    window.addEventListener('afterprint', handler);
    return () => window.removeEventListener('afterprint', handler);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const SortHeader = ({ field, children }) => (
    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 cursor-pointer select-none hover:text-white/50 transition-colors"
      onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />
        )}
      </div>
    </th>
  );

  const renderTable = () => {
    if (activeData?.loading) {
      return <div className="flex justify-center py-20"><RefreshCw size={24} className="text-white/30 animate-spin" /></div>;
    }

    if (!paginatedData.length) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box size={48} className="text-white/10 mb-4" />
          <h3 className="text-lg font-semibold text-white/40 mb-1">No data found</h3>
          <p className="text-sm text-white/20">Try adjusting your filters.</p>
        </div>
      );
    }

    if (activeReport === "current-stock") {
      const keys = ["item_code", "item_name", "category_name", "physical", "reserved", "available", "in_transit", "damaged"];
      return (
        <table className="w-full">
          <thead><tr className="bg-white/[0.02] border-b border-white/5">
            <SortHeader field="item_code">Item Code</SortHeader>
            <SortHeader field="item_name">Name</SortHeader>
            <SortHeader field="category_name">Category</SortHeader>
            <SortHeader field="physical">Physical</SortHeader>
            <SortHeader field="reserved">Reserved</SortHeader>
            <SortHeader field="available">Available</SortHeader>
            <SortHeader field="in_transit">In Transit</SortHeader>
            <SortHeader field="damaged">Damaged</SortHeader>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.map((row, i) => (
              <tr key={row.item_id || i} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4"><span className="text-xs font-mono font-bold text-white/50">{row.item_code}</span></td>
                <td className="px-5 py-4"><span className="text-sm font-semibold text-white">{row.item_name}</span></td>
                <td className="px-5 py-4"><span className="text-xs text-white/40">{row.category_name || "—"}</span></td>
                <td className="px-5 py-4"><span className="text-sm text-white/70">{row.physical}</span></td>
                <td className="px-5 py-4"><span className="text-sm text-amber-400/80">{row.reserved}</span></td>
                <td className="px-5 py-4"><span className={`text-sm font-bold ${row.available > 0 ? "text-emerald-400" : "text-red-400"}`}>{row.available}</span></td>
                <td className="px-5 py-4"><span className="text-sm text-blue-400/70">{row.in_transit || 0}</span></td>
                <td className="px-5 py-4"><span className="text-sm text-red-400/70">{row.damaged || 0}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (["adjustments", "transfers", "reservations", "stock-counts",
         "purchase-orders", "goods-receipts", "purchase-returns"].includes(activeReport)) {
      const labelMap = {
        adjustments: ["adjustment_number", "status", "location__location_name", "adjustment_type"],
        transfers: ["transfer_number", "status", "source_location__location_name", "destination_location__location_name"],
        reservations: ["reservation_number", "status", "source_location__location_name", "reservation_type"],
        "stock-counts": ["count_number", "status", "location__location_name", "count_type"],
        "purchase-orders": ["order_number", "status", "supplier_name", "total_amount"],
        "goods-receipts": ["grn_number", "status", "location__location_name", "receipt_date"],
        "purchase-returns": ["return_number", "status", "supplier_name", "return_date"],
      };
      const fields = labelMap[activeReport] || Object.keys(paginatedData[0] || {}).slice(0, 6);
      return (
        <table className="w-full">
          <thead><tr className="bg-white/[0.02] border-b border-white/5">
            {fields.map((f) => (
              <SortHeader key={f} field={f}>{f.replace(/_/g, " ").replace("__", " ")}</SortHeader>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.map((row, i) => (
              <tr key={row.id || i} className="group hover:bg-white/[0.02] transition-colors">
                {fields.map((f) => (
                  <td key={f} className="px-5 py-4">
                    <span className="text-sm text-white/70">{row[f] != null ? String(row[f]) : "—"}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="w-full">
        <thead><tr className="bg-white/[0.02] border-b border-white/5">
          {Object.keys(paginatedData[0] || {}).slice(0, 8).map((k) => (
            <SortHeader key={k} field={k}>{k.replace(/_/g, " ")}</SortHeader>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-white/5">
          {paginatedData.map((row, i) => (
            <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
              {Object.entries(row).slice(0, 8).map(([k, v]) => (
                <td key={k} className="px-5 py-4">
                  <span className="text-sm text-white/70">{v != null ? String(v) : "—"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderCardView = () => {
    const data = paginatedData;
    if (!data.length) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box size={48} className="text-white/10 mb-4" />
          <h3 className="text-lg font-semibold text-white/40 mb-1">No data found</h3>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice(0, 30).map((row, i) => (
          <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
            {Object.entries(row).slice(0, 6).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{k.replace(/_/g, " ")}</span>
                <span className="text-sm text-white/70">{v != null ? String(v) : "—"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <><div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <BarChart3 size={10} /> Reports
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {reportConfig?.label || "Reports"}
          </h1>
          <p className="text-sm text-white/40 font-medium">
            {activeData?.data?.length || 0} records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-1.5">
            {viewMode === "table" ? <Grid3X3 size={13} /> : <List size={13} />}
            {viewMode === "table" ? "Card View" : "Table View"}
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-1.5">
            <Filter size={13} /> Filters
          </button>
          <button onClick={() => handleExport("xlsx")} disabled={exportLoading}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-1.5">
            <Download size={13} /> Export Excel
          </button>
          <button onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-1.5">
            <Printer size={13} /> Print
          </button>
        </div>
      </header>

      {/* Report Groups Sidebar */}
      <div className="flex border-b border-white/5">
        {/* Sidebar panel */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 border-r border-white/5 ${
            reportSidebarOpen ? "w-56 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-56 px-4 py-4 space-y-4">
            {REPORT_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              const isActive = group.reports.some((r) => r.id === activeReport);
              return (
                <div key={group.label}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    isActive ? "text-blue-400" : "text-white/30"
                  }`}>
                    <GroupIcon size={14} />
                    {group.label}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {group.reports.map((report) => {
                      const ReportIcon = report.icon;
                      const selected = activeReport === report.id;
                      return (
                        <button key={report.id} onClick={() => { setActiveReport(report.id); setPage(1); setFilters({}); }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                            selected
                              ? "bg-blue-500/10 text-blue-400 font-bold"
                              : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                          }`}>
                          <ReportIcon size={12} />
                          {report.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 relative">
          {/* Toggle button — visible, sits on the sidebar border */}
          <button
            onClick={() => setReportSidebarOpen(!reportSidebarOpen)}
            className={`absolute z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-black/40 ${
              reportSidebarOpen
                ? "-left-3 top-3 bg-gray-800/90 border border-white/15 hover:bg-gray-700 hover:border-white/30"
                : "left-3 top-3 bg-blue-600/90 border border-blue-500/30 hover:bg-blue-500 hover:border-blue-400/50"
            }`}
            title={reportSidebarOpen ? "Collapse report sidebar" : "Expand report sidebar"}
          >
            {reportSidebarOpen ? (
              <ChevronLeft size={15} className="text-white/80" />
            ) : (
              <ChevronRight size={15} className="text-white" />
            )}
          </button>
          {/* Filters */}
          {showFilters && (
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-4 flex-wrap">
                {FILTER_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">{f.label}</label>
                    {f.type === "date" ? (
                      <input type="date" value={filters[f.key] || ""}
                        onChange={(e) => handleFilterChange(f.key, e.target.value)}
                        className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 w-36" />
                    ) : (
                      <input type="text" value={filters[f.key] || ""} placeholder={f.label}
                        onChange={(e) => handleFilterChange(f.key, e.target.value)}
                        className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 w-36 placeholder:text-white/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
            {React.createElement(reportIcon, { size: 14, className: "text-white/30" })}
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
              {reportConfig?.label} — Sorted{sortField ? ` by ${sortField} (${sortDir})` : " by relevance"}
            </span>
            <span className="text-[10px] text-white/20 ml-auto">
              Page {page} · {activeData?.data?.length || 0} total
            </span>
          </div>

          {/* Data */}
          <div className="p-6 overflow-x-auto">
            {viewMode === "table" ? renderTable() : renderCardView()}
          </div>

          {/* Pagination */}
          {sortedData.length > pageSize && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-white/30">
                Showing {Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all disabled:opacity-30">
                  Previous
                </button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= sortedData.length}
                  className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all disabled:opacity-30">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
      {printData && createPortal(
        <PrintableReport printData={printData} />,
        document.body
      )}
    </>);
};

export default Reports;
