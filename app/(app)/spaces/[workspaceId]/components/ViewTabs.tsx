"use client";

import { LayoutDashboard, List, GanttChart, Plus } from "lucide-react";

export type ViewType = "board" | "list" | "gantt";

interface ViewTabsProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

const tabs: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "board", label: "Board", icon: LayoutDashboard },
  { id: "list", label: "List", icon: List },
  { id: "gantt", label: "Gantt Chart", icon: GanttChart }
];

export function ViewTabs({ activeView, onChange }: ViewTabsProps) {
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mx-3 h-4 w-px bg-gray-300" />
      <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
        <Plus className="h-4 w-4" />
        <span className="text-sm">View</span>
      </button>
    </div>
  );
}
