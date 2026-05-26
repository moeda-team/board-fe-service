"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, SlidersHorizontal, X, Loader2, Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  useCreateCustomField,
  useCustomFields,
  useDeleteCustomField
} from "@/hooks/api/useCustomFields";
import type { CustomFieldType } from "@/types/type-custom-fields";

const FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" }
];

const createCustomFieldSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    type: z.enum(["text", "number", "date", "dropdown", "checkbox"]),
    options: z.array(z.string().trim().min(1))
  })
  .superRefine((val, ctx) => {
    if (val.type === "dropdown" && val.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one option",
        path: ["options"]
      });
    }
  });

type CreateCustomFieldFormValues = z.infer<typeof createCustomFieldSchema>;

interface CustomFieldManagerProps {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomFieldManager({
  tenantId,
  workspaceId,
  boardId,
  open,
  onOpenChange
}: CustomFieldManagerProps) {
  const { data: fields = [], isLoading } = useCustomFields(
    tenantId,
    workspaceId,
    boardId
  );
  const createCustomField = useCreateCustomField();
  const deleteCustomField = useDeleteCustomField();

  const form = useForm<CreateCustomFieldFormValues>({
    resolver: zodResolver(createCustomFieldSchema),
    defaultValues: { name: "", type: "text", options: [] },
    mode: "onSubmit"
  });

  const type = form.watch("type");
  const options = form.watch("options");

  const [optionInput, setOptionInput] = useState("");
  const canAddOption = useMemo(() => {
    const v = optionInput.trim();
    if (!v) return false;
    return !options.some((o) => o.toLowerCase() === v.toLowerCase());
  }, [optionInput, options]);

  useEffect(() => {
    if (type !== "dropdown" && options.length > 0) {
      form.setValue("options", []);
      form.clearErrors("options");
      setOptionInput("");
    }
  }, [type, options.length, form]);

  const addOption = () => {
    const v = optionInput.trim();
    if (!v) return;
    if (options.some((o) => o.toLowerCase() === v.toLowerCase())) return;
    form.setValue("options", [...options, v], { shouldValidate: true });
    setOptionInput("");
  };

  const removeOption = (idx: number) => {
    form.setValue(
      "options",
      options.filter((_, i) => i !== idx),
      { shouldValidate: true }
    );
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await createCustomField.mutateAsync({
      tenantId,
      workspaceId,
      boardId,
      dto: {
        name: values.name.trim(),
        type: values.type,
        ...(values.type === "dropdown" ? { options: values.options } : {})
      }
    });

    form.reset({ name: "", type: "text", options: [] });
    setOptionInput("");
  });

  const getTypeLabel = (t: CustomFieldType | string) => {
    const opt = FIELD_TYPE_OPTIONS.find((o) => o.value === t);
    return opt?.label || String(t);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <SheetTitle className="text-base font-semibold">
              Manage Custom Fields
            </SheetTitle>
          </div>
          <SheetDescription>
            Add and manage custom fields for tasks on this board.
          </SheetDescription>
        </SheetHeader>

        {/* Existing Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Existing Fields
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Loading custom fields...</span>
            </div>
          ) : fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm">
              <SlidersHorizontal className="h-8 w-8 mb-2 opacity-30" />
              No custom fields yet.
              <span className="mt-1 text-xs">Use the form below to create one.</span>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-xs h-9 font-medium">Name</TableHead>
                    <TableHead className="text-xs h-9 font-medium">Type</TableHead>
                    <TableHead className="text-xs h-9 w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium text-sm py-2.5">
                        {field.name}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {getTypeLabel(field.type)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <button
                          onClick={() =>
                            deleteCustomField.mutate({
                              tenantId,
                              workspaceId,
                              boardId,
                              customFieldId: field.id
                            })
                          }
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Delete ${field.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Add New Field Form */}
        <div className="px-6 py-5 border-t bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Add New Field
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                placeholder="e.g. Story Points"
                {...form.register("name")}
                className="h-9"
              />
              {form.formState.errors.name?.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Type
              </label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {type === "dropdown" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Options
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. High"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    className="h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    onClick={addOption}
                    disabled={!canAddOption}
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt, idx) => (
                      <Badge
                        key={`${opt}-${idx}`}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {opt}
                        <button
                          type="button"
                          className="ml-1 rounded hover:bg-muted-foreground/10"
                          onClick={() => removeOption(idx)}
                          aria-label={`Remove option ${opt}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {form.formState.errors.options?.message && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.options.message as string}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-1"
              disabled={createCustomField.isPending}
            >
              {createCustomField.isPending ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Adding...</span>
                </span>
              ) : (
                "Add Field"
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
