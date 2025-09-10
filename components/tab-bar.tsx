"use client";

import { cn } from "@/lib/utils";
import {
  X,
  FileSpreadsheet,
  LayoutDashboard,
  Calculator,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpreadsheetStore } from "@/lib/spreadsheet-store";

export interface Tab {
  id: string;
  type: "spreadsheet" | "dashboard" | "analysis" | "vibe";
  title: string;
  permanent?: boolean;
  metadata?: {
    sourceColumns?: string[];
    createdAt?: Date;
    prompt?: string;
  };
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
}: TabBarProps) {
  const getTabIcon = (type: Tab["type"]) => {
    switch (type) {
      case "spreadsheet":
        return FileSpreadsheet;
      case "dashboard":
        return LayoutDashboard;
      case "analysis":
        return Calculator;
      case "vibe":
        return Sparkles;
      default:
        return FileSpreadsheet;
    }
  };

  const handleAddVibeTab = () => {
    const { addTab, setActiveTab } = useSpreadsheetStore.getState();
    const newTabId = `vibe-${Date.now()}`;
    addTab({
      id: newTabId,
      type: "vibe",
      title: "Vibe Mode ✨",
      permanent: false,
    });
    setActiveTab(newTabId);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.type);
            const isActive = tab.id === activeTab;

            return (
              <div
                key={tab.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer transition-colors",
                  isActive
                    ? "bg-gray-50 border-t border-x border-gray-200"
                    : "hover:bg-gray-100",
                )}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-4 w-4 text-gray-600" />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-gray-900" : "text-gray-600",
                  )}
                >
                  {tab.title}
                </span>

                {/* Source indicator for non-data tabs */}
                {tab.metadata?.sourceColumns &&
                  tab.metadata.sourceColumns.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {tab.metadata.sourceColumns.length} cols
                    </span>
                  )}

                {/* Close button for non-permanent tabs */}
                {!tab.permanent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Vibe Mode Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddVibeTab}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <Plus className="h-4 w-4" />
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Vibe Mode</span>
        </Button>
      </div>
    </div>
  );
}
