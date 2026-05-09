"use client";

import { LayoutDashboard, List, GanttChart } from "lucide-react";

export type ViewType = "board" | "list" | "gantt";

interface ViewTabsProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

const tabs: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "board", label: "Board", icon: LayoutDashboard },
  { id: "list", label: "List", icon: List },
  { id: "gantt", label: "Gantt Chart", icon: GanttChart },
];

export function ViewTabs({ activeView, onChange }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
