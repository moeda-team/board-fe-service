"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { columns } from "./columns";
import type { Task } from "@/types/type-tasks";

interface ListViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function ListView({ tasks, onTaskClick }: ListViewProps) {
  const data = useMemo(() => tasks, [tasks]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => onTaskClick?.(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
