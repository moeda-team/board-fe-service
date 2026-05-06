import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

const modules = [
  { name: "Dashboard", desc: "Create and manage spaces" },
  { name: "Developer KPI", desc: "Create and manage spaces" },
  { name: "Spaces", desc: "Create and manage spaces" },
  { name: "Role & Access", desc: "Create and manage spaces" },
  { name: "Members", desc: "Create and manage spaces" },
  { name: "Spaces", desc: "Create and manage spaces" },
  { name: "Spaces", desc: "Create and manage spaces" },
];

export function PermissionTablePanel() {
  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col h-[500px]">
      {/* Permission Header */}
      <div className="p-5 flex justify-between items-center border-b border-slate-100">
        <div className="flex gap-3 items-center">
          <div className="rounded-full bg-brand-soft-blue p-2 text-brand-blue">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">
                Admin
              </span>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 px-1.5 py-0 text-[10px] h-4"
              >
                System
              </Badge>
            </div>
            <span className="text-sm text-slate-500 mt-0.5">
              Full access to all functionality
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-900 text-base">3</span>
          <span className="text-xs text-slate-500">members</span>
        </div>
      </div>

      {/* Permission Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-[200px] text-slate-900 font-semibold text-xs">
                Module
              </TableHead>
              <TableHead className="text-center text-slate-900 font-semibold text-xs">
                All Access
              </TableHead>
              <TableHead className="text-center text-slate-900 font-semibold text-xs">
                Create
              </TableHead>
              <TableHead className="text-center text-slate-900 font-semibold text-xs">
                Edit
              </TableHead>
              <TableHead className="text-center text-slate-900 font-semibold text-xs">
                Delete
              </TableHead>
              <TableHead className="text-center text-slate-900 font-semibold text-xs">
                View
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module, i) => (
              <TableRow
                key={i}
                className="border-slate-100 hover:bg-slate-50/50"
              >
                <TableCell className="py-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-slate-400">
                      {module.name === "Dashboard" && (
                        <LayoutDashboard className="h-4 w-4" />
                      )}
                      {module.name === "Developer KPI" && (
                        <BarChart3 className="h-4 w-4" />
                      )}
                      {(module.name === "Spaces" ||
                        module.name === "Spaces") && (
                        <Layers className="h-4 w-4" />
                      )}
                      {module.name === "Role & Access" && (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      {module.name === "Members" && (
                        <Users className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-sm">
                        {module.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {module.desc}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={true}
                    className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]"
                  />
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={true}
                    className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]"
                  />
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={true}
                    className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]"
                  />
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={true}
                    className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]"
                  />
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={true}
                    className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
