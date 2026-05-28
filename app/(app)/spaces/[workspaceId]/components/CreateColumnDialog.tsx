"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface CreateColumnFormValues {
  name: string;
  color: string;
  isDone: boolean;
}

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateColumnFormValues & { position: number }) => void;
  position: number;
}

const presetColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#94a3b8"
];

export function CreateColumnDialog({
  open,
  onOpenChange,
  onSubmit,
  position
}: CreateColumnDialogProps) {
  const form = useForm<CreateColumnFormValues>({
    defaultValues: {
      name: "",
      color: "#e2e8f0",
      isDone: false
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        color: "#e2e8f0",
        isDone: false
      });
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({ ...values, position });
    onOpenChange(false);
  });

  const selectedColor = form.watch("color");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base">New Column</DialogTitle>
          <DialogDescription className="text-xs">
            Create a new column for your board.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="create-column-name"
              className="text-sm font-medium"
            >
              Column name
            </label>
            <div className="relative">
              <Input
                id="create-column-name"
                placeholder="e.g. Backlog, In Progress"
                className="pr-9 h-9"
                {...form.register("name", { required: true })}
              />
              <div
                className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-background"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Color</label>
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {selectedColor}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid grid-cols-6 gap-2 flex-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => form.setValue("color", color)}
                    className={
                      "h-7 w-7 rounded-full border-2 transition-all duration-150 " +
                      (selectedColor === color
                        ? "border-foreground scale-110 shadow-sm"
                        : "border-transparent hover:scale-105 hover:border-muted-foreground/30")
                    }
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>

              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-input bg-background shadow-sm">
                <input
                  type="color"
                  {...form.register("color")}
                  value={selectedColor}
                  onChange={(e) => form.setValue("color", e.target.value)}
                  className="absolute -top-2 -left-2 h-12 w-12 cursor-pointer p-0 border-0"
                />
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
            <Checkbox
              id="create-column-done"
              checked={form.watch("isDone")}
              onCheckedChange={(checked) =>
                form.setValue("isDone", checked === true)
              }
              className="mt-0.5"
            />
            <div className="grid gap-1 leading-none">
              <label
                htmlFor="create-column-done"
                className="text-sm font-medium cursor-pointer"
              >
                Mark as &quot;Done&quot; column
              </label>
              <p className="text-xs text-muted-foreground">
                Tasks moved here will be considered completed.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" />
              Create column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
