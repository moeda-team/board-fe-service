"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  BarChart3,
  Info,
  Layers,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  UserCircle,
  Users
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

export default function RoleAccessPage() {
  return (
    <div className="flex h-full flex-col p-6 gap-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Role Management & Access Control</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage roles and control access permission across your workspace
          </p>
        </div>
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
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Roles */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
          <Card className="shadow-sm border-slate-200 flex flex-col h-[500px]">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">Roles</h2>
                  <p className="text-xs text-slate-500 mt-1">Create and manage roles access levels</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-brand-blue border-brand-soft-blue hover:bg-brand-soft-blue/50">
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
                        <span className="font-semibold text-slate-900 text-sm">Admin</span>
                        <Badge variant="secondary" className="bg-brand-soft-blue text-brand-blue hover:bg-brand-soft-blue px-1.5 py-0 text-[10px] h-4">System</Badge>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">Full access to all functionality</span>
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
                        <span className="font-semibold text-slate-900 text-sm">Client</span>
                        <Badge variant="outline" className="text-slate-600 px-1.5 py-0 text-[10px] h-4 border-slate-200">Custom</Badge>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">View Timeline</span>
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
                  System role (Admin, Managers, Developers, Stakeholders) can't be deleted
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Permissions */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col h-[500px]">
            {/* Permission Header */}
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <div className="flex gap-3 items-center">
                <div className="rounded-full bg-brand-soft-blue p-2 text-brand-blue">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Admin</span>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 px-1.5 py-0 text-[10px] h-4">System</Badge>
                  </div>
                  <span className="text-sm text-slate-500 mt-0.5">Full access to all functionality</span>
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
                    <TableHead className="w-[200px] text-slate-900 font-semibold text-xs">Module</TableHead>
                    <TableHead className="text-center text-slate-900 font-semibold text-xs">All Access</TableHead>
                    <TableHead className="text-center text-slate-900 font-semibold text-xs">Create</TableHead>
                    <TableHead className="text-center text-slate-900 font-semibold text-xs">Edit</TableHead>
                    <TableHead className="text-center text-slate-900 font-semibold text-xs">Delete</TableHead>
                    <TableHead className="text-center text-slate-900 font-semibold text-xs">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module, i) => (
                    <TableRow key={i} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="py-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 text-slate-400">
                            {module.name === "Dashboard" && <LayoutDashboard className="h-4 w-4" />}
                            {module.name === "Developer KPI" && <BarChart3 className="h-4 w-4" />}
                            {(module.name === "Spaces" || module.name === "Spaces") && <Layers className="h-4 w-4" />}
                            {module.name === "Role & Access" && <ShieldCheck className="h-4 w-4" />}
                            {module.name === "Members" && <Users className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 text-sm">{module.name}</span>
                            <span className="text-[10px] text-slate-400">{module.desc}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Checkbox checked={true} className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]" />
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Checkbox checked={true} className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]" />
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Checkbox checked={true} className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]" />
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Checkbox checked={true} className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]" />
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Checkbox checked={true} className="border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-[4px]" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* How it works */}
      <Card className="shadow-sm border-slate-200 mt-2">
        <div className="p-5">
          <h2 className="font-semibold text-slate-900">How it works</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Setup roles and access in 3 steps</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
              <div className="rounded-full bg-brand-soft-purple flex items-center justify-center h-6 w-6 shrink-0 mt-0.5">
                <span className="text-brand-purple font-bold text-xs">1</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-sm">Create or Select Role</span>
                <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Create new role or use existing system role
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
              <div className="rounded-full bg-brand-soft-purple flex items-center justify-center h-6 w-6 shrink-0 mt-0.5">
                <span className="text-brand-purple font-bold text-xs">2</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-sm">Configure Permission</span>
                <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Set permission for each module and features
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
              <div className="rounded-full bg-brand-soft-purple flex items-center justify-center h-6 w-6 shrink-0 mt-0.5">
                <span className="text-brand-purple font-bold text-xs">3</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-sm">Assign to Member</span>
                <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Assign the role to members or teams
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
