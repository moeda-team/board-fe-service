"use client";

import { ReactNode } from "react";

type RoleLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode; // for buttons like "Invite Member"
  sidebar?: ReactNode; // roles list (left side)
  children: ReactNode; // main content (right side)
};

export default function LayoutWrapper({
  title,
  description,
  actions,
  sidebar,
  children
}: RoleLayoutProps) {
  return (
    <div className="flex flex-col h-full w-full p-2.5">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">{actions}</div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
