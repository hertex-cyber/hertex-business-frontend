import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import InventorySidebar from "./InventorySidebar";

const InventoryLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-full">
      {/* Sidebar with collapse animation */}
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          sidebarOpen ? "w-56 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <InventorySidebar />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Toggle button — big, visible, sits on the sidebar border */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-black/40 ${
            sidebarOpen
              ? "left-2 top-4 bg-gray-800/90 border border-white/15 hover:bg-gray-700 hover:border-white/30"
              : "left-3 top-4 bg-blue-600/90 border border-blue-500/30 hover:bg-blue-500 hover:border-blue-400/50"
          }`}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={15} className="text-white/80" />
          ) : (
            <ChevronRight size={15} className="text-white" />
          )}
        </button>
        {children}
      </div>
    </div>
  );
};

export default InventoryLayout;
