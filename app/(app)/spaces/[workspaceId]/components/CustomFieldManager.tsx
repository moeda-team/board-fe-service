"use client";

import { useEffect, useState } from "react";
import { Trash2, SlidersHorizontal, X, Loader2, Plus, Pencil } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  useDeleteCustomField,
  useUpdateCustomField
} from "@/hooks/api/useCustomFields";
import type {
  CustomField,
  CustomFieldDropdownOption,
  CustomFieldDropdownOptionInput,
  CustomFieldType
} from "@/types/type-custom-fields";

const FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" }
];

const DEFAULT_FIELD_COLOR = "#6366f1";
const DEFAULT_OPTION_COLOR = "#3b82f6";

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color");

const optionalNumberSchema = z.preprocess(
  (v) => {
    if (v === "" || v == null) return undefined;
    if (typeof v === "number") return v;
    return Number(v);
  },
  z.number().finite().optional()
);

const optionalTrimmedStringSchema = z.preprocess(
  (v) => {
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().optional()
);

const dropdownOptionSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  value: z.string().trim().min(1, "Value is required"),
  color: hexColorSchema
});

const createCustomFieldSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    type: z.enum(["text", "number", "date", "dropdown", "checkbox"]),
    color: hexColorSchema,
    dropdownOptions: z.array(dropdownOptionSchema),
    textOptions: z.object({
      placeholder: optionalTrimmedStringSchema,
      maxLength: optionalNumberSchema
    }),
    numberOptions: z.object({
      min: optionalNumberSchema,
      max: optionalNumberSchema
    })
  })
  .superRefine((val, ctx) => {
    if (val.type === "dropdown" && val.dropdownOptions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one option",
        path: ["dropdownOptions"]
      });
    }

    if (val.type === "text") {
      const maxLength = val.textOptions.maxLength;
      if (typeof maxLength === "number" && maxLength <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "maxLength must be greater than 0",
          path: ["textOptions", "maxLength"]
        });
      }
    }

    if (val.type === "number") {
      const min = val.numberOptions.min;
      const max = val.numberOptions.max;
      if (
        typeof min === "number" &&
        typeof max === "number" &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min > max
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "max must be greater than or equal to min",
          path: ["numberOptions", "max"]
        });
      }
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
  const updateCustomField = useUpdateCustomField();
  const deleteCustomField = useDeleteCustomField();

  const [editingCustomFieldId, setEditingCustomFieldId] = useState<string | null>(
    null
  );

  const form = useForm<CreateCustomFieldFormValues>({
    resolver: zodResolver(createCustomFieldSchema),
    defaultValues: {
      name: "",
      type: "text",
      color: DEFAULT_FIELD_COLOR,
      dropdownOptions: [],
      textOptions: { placeholder: undefined, maxLength: undefined },
      numberOptions: { min: undefined, max: undefined }
    },
    mode: "onSubmit"
  });

  const type = form.watch("type");

  const {
    fields: dropdownOptionFields,
    append: appendDropdownOption,
    remove: removeDropdownOption
  } = useFieldArray({
    control: form.control,
    name: "dropdownOptions"
  });

  const slugify = (input: string) => {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  useEffect(() => {
    if (type !== "dropdown") {
      const current = form.getValues("dropdownOptions");
      if (current.length > 0) {
        form.setValue("dropdownOptions", []);
        form.clearErrors("dropdownOptions");
      }
    }

    if (type !== "text") {
      form.setValue("textOptions", { placeholder: undefined, maxLength: undefined });
      form.clearErrors("textOptions");
    }

    if (type !== "number") {
      form.setValue("numberOptions", { min: undefined, max: undefined });
      form.clearErrors("numberOptions");
    }
  }, [type, form]);

  const handleEdit = (field: CustomField) => {
    const fieldColor =
      typeof field.color === "string" && field.color.trim()
        ? field.color
        : DEFAULT_FIELD_COLOR;

    let dropdownOptions: CustomFieldDropdownOptionInput[] = [];
    const textOptions: { placeholder?: string; maxLength?: number } = {};
    const numberOptions: { min?: number; max?: number } = {};

    if (field.type === "dropdown" && Array.isArray(field.options)) {
      dropdownOptions = (field.options as (string | CustomFieldDropdownOption)[])
        .map((o) => {
          if (typeof o === "string") {
            const label = o;
            return {
              label,
              value: slugify(label),
              color: DEFAULT_OPTION_COLOR
            };
          }

          return {
            label: typeof o.label === "string" ? o.label : "",
            value: typeof o.value === "string" ? o.value : "",
            color:
              typeof o.color === "string" && o.color.trim()
                ? o.color
                : DEFAULT_OPTION_COLOR
          };
        })
        .filter((o) => o.label.trim() && o.value.trim());
    }

    if (
      field.type === "text" &&
      field.options &&
      typeof field.options === "object" &&
      !Array.isArray(field.options)
    ) {
      const opt = field.options as Record<string, unknown>;
      if (typeof opt.placeholder === "string") {
        textOptions.placeholder = opt.placeholder;
      }
      if (typeof opt.maxLength === "number" && Number.isFinite(opt.maxLength)) {
        textOptions.maxLength = opt.maxLength;
      }
    }

    if (
      field.type === "number" &&
      field.options &&
      typeof field.options === "object" &&
      !Array.isArray(field.options)
    ) {
      const opt = field.options as Record<string, unknown>;
      if (typeof opt.min === "number" && Number.isFinite(opt.min)) {
        numberOptions.min = opt.min;
      }
      if (typeof opt.max === "number" && Number.isFinite(opt.max)) {
        numberOptions.max = opt.max;
      }
    }

    setEditingCustomFieldId(field.id);
    form.reset({
      name: field.name,
      type: field.type,
      color: fieldColor,
      dropdownOptions,
      textOptions: {
        placeholder: textOptions.placeholder,
        maxLength: textOptions.maxLength
      },
      numberOptions: {
        min: numberOptions.min,
        max: numberOptions.max
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingCustomFieldId(null);
    form.reset({
      name: "",
      type: "text",
      color: DEFAULT_FIELD_COLOR,
      dropdownOptions: [],
      textOptions: { placeholder: undefined, maxLength: undefined },
      numberOptions: { min: undefined, max: undefined }
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const name = values.name.trim();
    const color = values.color.trim();

    const baseDto = {
      name,
      type: values.type,
      color
    };

    let optionsPayload: unknown | undefined;

    if (values.type === "dropdown") {
      optionsPayload = values.dropdownOptions.map((o) => ({
        label: o.label.trim(),
        value: o.value.trim(),
        color: o.color.trim()
      }));
    }

    if (values.type === "text") {
      const opt: Record<string, unknown> = {};
      if (values.textOptions.placeholder) opt.placeholder = values.textOptions.placeholder;
      if (typeof values.textOptions.maxLength === "number") {
        opt.maxLength = values.textOptions.maxLength;
      }
      if (Object.keys(opt).length > 0) optionsPayload = opt;
    }

    if (values.type === "number") {
      const opt: Record<string, unknown> = {};
      if (typeof values.numberOptions.min === "number") {
        opt.min = values.numberOptions.min;
      }
      if (typeof values.numberOptions.max === "number") {
        opt.max = values.numberOptions.max;
      }
      if (Object.keys(opt).length > 0) optionsPayload = opt;
    }

    const dto = {
      ...baseDto,
      ...(optionsPayload !== undefined ? { options: optionsPayload } : {})
    };

    if (editingCustomFieldId) {
      await updateCustomField.mutateAsync({
        tenantId,
        workspaceId,
        boardId,
        customFieldId: editingCustomFieldId,
        dto
      });
      setEditingCustomFieldId(null);
    } else {
      await createCustomField.mutateAsync({
        tenantId,
        workspaceId,
        boardId,
        dto
      });
    }

    form.reset({
      name: "",
      type: "text",
      color: DEFAULT_FIELD_COLOR,
      dropdownOptions: [],
      textOptions: { placeholder: undefined, maxLength: undefined },
      numberOptions: { min: undefined, max: undefined }
    });
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
                    <TableHead className="text-xs h-9 font-medium">Color</TableHead>
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
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-4 w-4 rounded-full border"
                            style={{ backgroundColor: field.color || DEFAULT_FIELD_COLOR }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {field.color || DEFAULT_FIELD_COLOR}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <button
                          onClick={() => handleEdit(field)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1"
                          aria-label={`Edit ${field.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
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
            {editingCustomFieldId ? "Edit Field" : "Add New Field"}
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
                Color
              </label>
              <Controller
                control={form.control}
                name="color"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-12 rounded-md border border-input bg-background p-1"
                    />
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 font-mono"
                    />
                  </div>
                )}
              />
              {form.formState.errors.color?.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.color.message as string}
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
                <div className="grid gap-2">
                  {dropdownOptionFields.length > 0 && (
                    <div className="grid gap-2">
                      {dropdownOptionFields.map((opt, idx) => (
                        <div
                          key={opt.id}
                          className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end"
                        >
                          <div className="grid gap-1">
                            <Input
                              placeholder="Label"
                              className="h-9"
                              {...form.register(
                                `dropdownOptions.${idx}.label` as const
                              )}
                              onBlur={() => {
                                const label = form.getValues(
                                  `dropdownOptions.${idx}.label` as const
                                );
                                const value = form.getValues(
                                  `dropdownOptions.${idx}.value` as const
                                );
                                if (!value.trim() && label.trim()) {
                                  form.setValue(
                                    `dropdownOptions.${idx}.value` as const,
                                    slugify(label),
                                    { shouldValidate: true }
                                  );
                                }
                              }}
                            />
                            {form.formState.errors.dropdownOptions?.[idx]?.label
                              ?.message && (
                              <p className="text-xs text-destructive">
                                {
                                  form.formState.errors.dropdownOptions?.[idx]
                                    ?.label?.message as string
                                }
                              </p>
                            )}
                          </div>

                          <div className="grid gap-1">
                            <Input
                              placeholder="Value"
                              className="h-9"
                              {...form.register(
                                `dropdownOptions.${idx}.value` as const
                              )}
                            />
                            {form.formState.errors.dropdownOptions?.[idx]?.value
                              ?.message && (
                              <p className="text-xs text-destructive">
                                {
                                  form.formState.errors.dropdownOptions?.[idx]
                                    ?.value?.message as string
                                }
                              </p>
                            )}
                          </div>

                          <div className="grid gap-1">
                            <input
                              type="color"
                              className="h-9 w-12 rounded-md border border-input bg-background p-1"
                              {...form.register(
                                `dropdownOptions.${idx}.color` as const
                              )}
                            />
                            {form.formState.errors.dropdownOptions?.[idx]?.color
                              ?.message && (
                              <p className="text-xs text-destructive">
                                {
                                  form.formState.errors.dropdownOptions?.[idx]
                                    ?.color?.message as string
                                }
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => removeDropdownOption(idx)}
                            aria-label="Remove option"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    onClick={() =>
                      appendDropdownOption({
                        label: "",
                        value: "",
                        color: DEFAULT_OPTION_COLOR
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                {form.formState.errors.dropdownOptions?.message && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.dropdownOptions.message as string}
                  </p>
                )}
              </div>
            )}

            {type === "text" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Options
                </label>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Input
                      placeholder="Placeholder"
                      className="h-9"
                      {...form.register("textOptions.placeholder")}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Input
                      type="number"
                      placeholder="maxLength"
                      className="h-9"
                      {...form.register("textOptions.maxLength")}
                    />
                    {form.formState.errors.textOptions?.maxLength?.message && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.textOptions.maxLength.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {type === "number" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Options
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Input
                      type="number"
                      placeholder="min"
                      className="h-9"
                      {...form.register("numberOptions.min")}
                    />
                    {form.formState.errors.numberOptions?.min?.message && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.numberOptions.min.message as string}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Input
                      type="number"
                      placeholder="max"
                      className="h-9"
                      {...form.register("numberOptions.max")}
                    />
                    {form.formState.errors.numberOptions?.max?.message && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.numberOptions.max.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-1"
              disabled={createCustomField.isPending || updateCustomField.isPending}
            >
              {createCustomField.isPending || updateCustomField.isPending ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">
                    {editingCustomFieldId ? "Saving..." : "Adding..."}
                  </span>
                </span>
              ) : (
                <span>{editingCustomFieldId ? "Save Changes" : "Add Field"}</span>
              )}
            </Button>

            {editingCustomFieldId && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
