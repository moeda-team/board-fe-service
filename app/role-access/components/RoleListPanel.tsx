import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, Plus, ShieldCheck, UserCircle } from "lucide-react";

export function RoleListPanel() {
  return (
    <div className="w-full lg:w-[320px] flex flex-col gap-4">
      <Card className="shadow-sm border-slate-200 flex flex-col h-full">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Roles</h2>
              <p className="text-xs text-slate-500 mt-1">
                Create and manage roles access levels
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-brand-blue border-brand-soft-blue hover:bg-brand-soft-blue/50"
            >
              <Plus className="mr-1 h-3 w-3" />
              New Role
            </Button>
          </div>

          {/* Role List */}
          <div className="flex flex-col gap-3 mt-2">
            {/* Active Role */}
            <div className="rounded-xl border-2 border-brand-blue bg-brand-soft-blue/50 p-3 cursor-pointer flex justify-between items-start">
              <div className="flex gap-3">
                <div className="mt-0.5 rounded-full bg-brand-soft-blue p-1.5 text-brand-blue">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      Admin
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-brand-soft-blue text-brand-blue hover:bg-brand-soft-blue px-1.5 py-0 text-[10px] h-4"
                    >
                      System
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                    Full access to all functionality
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-900 text-sm">1</span>
                <span className="text-[10px] text-slate-500">members</span>
              </div>
            </div>

            {/* Inactive Role */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer flex justify-between items-start hover:border-slate-300 transition-colors">
              <div className="flex gap-3">
                <div className="mt-0.5 rounded-full bg-slate-100 p-1.5 text-slate-600">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      Client
                    </span>
                    <Badge
                      variant="outline"
                      className="text-slate-600 px-1.5 py-0 text-[10px] h-4 border-slate-200"
                    >
                      Custom
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                    View Timeline
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-900 text-sm">3</span>
                <span className="text-[10px] text-slate-500">members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 pt-0">
          <div className="rounded-lg bg-slate-100 p-3 flex gap-2 items-start">
            <Info className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              System role (Admin, Managers, Developers, Stakeholders) can't
              be deleted
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
