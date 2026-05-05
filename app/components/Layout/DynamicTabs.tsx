"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export type TabItem = {
  label: string;
  value: string;
};

type Props = {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export default function DynamicTabs({
  tabs,
  defaultValue,
  value,
  onChange,
  className
}: Props) {
  const [internalValue, setInternalValue] = useState(
    defaultValue || tabs[0]?.value
  );

  const active = value ?? internalValue;

  const handleChange = (val: string) => {
    if (!value) setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className={cn("border-b", className)}>
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = active === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => handleChange(tab.value)}
              className={cn(
                "pb-2 text-sm font-medium transition-colors relative",
                isActive
                  ? "text-blue-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}

              {/* underline */}
              {isActive && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
