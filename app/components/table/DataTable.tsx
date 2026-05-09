"use client";

import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState
} from "@tanstack/react-table";
import { useState } from "react";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  showPagination?: boolean;
  pageSize?: number;
  manualPagination?: boolean;
  pageCount?: number;
  pageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
};

export function DataTable<TData>({
  data,
  columns,
  showPagination = true,
  pageSize = 10,
  manualPagination = false,
  pageCount,
  pageIndex,
  onPageChange
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      ...(manualPagination && pageIndex !== undefined
        ? { pagination: { pageIndex, pageSize } }
        : {})
    },
    initialState: {
      pagination: {
        pageSize
      }
    },
    manualPagination,
    pageCount,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const handlePreviousPage = () => {
    if (manualPagination && onPageChange && pageIndex !== undefined) {
      onPageChange(pageIndex - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (manualPagination && onPageChange && pageIndex !== undefined) {
      onPageChange(pageIndex + 1);
    } else {
      table.nextPage();
    }
  };

  const handlePageIndexChange = (idx: number) => {
    if (manualPagination && onPageChange) {
      onPageChange(idx);
    } else {
      table.setPageIndex(idx);
    }
  };

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
            {Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>

          <div className="flex gap-2 items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handlePreviousPage}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            
            {Array.from({ length: table.getPageCount() }, (_, i) => {
              // Show max 5 pages logic could be added, but keeping it simple for now
              const isCurrent = table.getState().pagination.pageIndex === i;
              return (
                <Button 
                  key={i}
                  variant={isCurrent ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handlePageIndexChange(i)}
                >
                  {i + 1}
                </Button>
              );
            })}

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleNextPage}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
