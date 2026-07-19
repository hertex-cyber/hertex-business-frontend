import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, FolderTree, Ruler, Building2, MapPin, Tags, PackageSearch, ArrowLeftRight, ChevronRight, Scale, CalendarCheck, ClipboardList, PackageCheck, Receipt, Undo2, IndianRupee, LayoutDashboard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureContext } from "@/context/FeatureContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/inventory/dashboard", icon: LayoutDashboard, featureCode: "dashboard" },
  { label: "Reports", href: "/inventory/reports", icon: BarChart3, featureCode: "reports" },
  { label: "Items", href: "/inventory/items", icon: Box, featureCode: "items" },
  { label: "Categories", href: "/inventory/categories", icon: FolderTree, featureCode: "categories" },
  { label: "Units", href: "/inventory/units", icon: Ruler, featureCode: "units" },
  { label: "Brands", href: "/inventory/brands", icon: Building2, featureCode: "brands" },
  { label: "Locations", href: "/inventory/locations", icon: MapPin, featureCode: "locations" },
  { label: "Location Types", href: "/inventory/location-types", icon: Tags, featureCode: "location-types" },
  { label: "Transfers", href: "/inventory/transfers", icon: ArrowLeftRight, featureCode: "transfers" },
  { label: "Adjustments", href: "/inventory/adjustments", icon: Scale, featureCode: "adjustments" },
  { label: "Reservations", href: "/inventory/reservations", icon: CalendarCheck, featureCode: "reservations" },
  { label: "Stock", href: "/inventory/stock", icon: PackageSearch, featureCode: "stock" },
  { label: "Purchase Orders", href: "/inventory/purchase-orders", icon: ClipboardList, featureCode: "purchase-orders" },
  { label: "Goods Receipts", href: "/inventory/goods-receipts", icon: PackageCheck, featureCode: "goods-receipts" },
  { label: "Supplier Invoices", href: "/inventory/supplier-invoices", icon: Receipt, featureCode: "supplier-invoices" },
  { label: "Purchase Returns", href: "/inventory/purchase-returns", icon: Undo2, featureCode: "purchase-returns" },
  { label: "Supplier Payments", href: "/inventory/supplier-payments", icon: IndianRupee, featureCode: "supplier-payments" },
];

const InventorySidebar = () => {
  const location = useLocation();
  const { enabledFeatures, loading } = useFeatureContext();

  const visibleItems = loading
    ? NAV_ITEMS  // Show all while loading
    : NAV_ITEMS.filter(
        (item) => !item.featureCode || enabledFeatures[item.featureCode] !== false
      );

  return (
    <div className="w-56 h-full bg-black/40 border-r border-white/5 flex flex-col shrink-0 no-print">
      {/* Section Header */}
      <div className="px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Box size={14} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Inventory</h2>
            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">Item Master</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-white/5 text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={16}
                  className={cn(
                    "transition-colors shrink-0",
                    isActive ? "text-blue-400" : "group-hover:text-blue-400",
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight
                size={14}
                className={cn(
                  "transition-all shrink-0",
                  isActive
                    ? "opacity-100 text-blue-400"
                    : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-medium">
          Module v2.0
        </p>
      </div>
    </div>
  );
};

export default InventorySidebar;
