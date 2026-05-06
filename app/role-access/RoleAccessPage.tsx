"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import { RoleListPanel } from "./components/RoleListPanel";
import { PermissionTablePanel } from "./components/PermissionTablePanel";
import { HowItWorksPanel } from "./components/HowItWorksPanel";

export default function RoleAccessPage() {
  return (
    <LayoutWrapper
      title={`Role Management & Access Control`}
      description={`Manage roles and control access permission across your workspace`}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-8 w-[250px] bg-white border-slate-200"
            />
          </div>
          <Button className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Invite member
          </Button>
        </div>
      }
    >
      <div className="flex flex-row gap-6">
        <RoleListPanel />

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="flex-1 flex flex-col gap-4">
            <PermissionTablePanel />
            <HowItWorksPanel />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

