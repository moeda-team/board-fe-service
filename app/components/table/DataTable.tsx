"use client";

import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState
} from "@tanstack/react-table";
import { useState } from "react";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  showPagination?: boolean;
};

export function DataTable<TData>({
  data,
  columns,
  showPagination = true
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-xs">
      <table className="w-full text-sm bg-white">
        {/* HEADER */}
        <thead className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3 text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* BODY */}
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-6 text-muted-foreground"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FOOTER */}
      {showPagination && (
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} of {data.length} row(s) selected.
          </span>

          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="sm">
              Previous
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              4
            </Button>
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
