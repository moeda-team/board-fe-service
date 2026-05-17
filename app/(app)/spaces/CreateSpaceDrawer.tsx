"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import type { Workspace } from "@/types/type-workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  useCreateWorkspace,
  useUpdateWorkspace
} from "@/hooks/api/useWorkspaces";

interface CreateSpaceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWorkspace: Workspace | null;
  tenantId: string;
}

export default function CreateSpaceDrawer({
  open,
  onOpenChange,
  editingWorkspace,
  tenantId
}: CreateSpaceDrawerProps) {
  const { mutate: createWorkspace, isPending: isCreating } =
    useCreateWorkspace();
  const { mutate: updateWorkspace, isPending: isUpdating } =
    useUpdateWorkspace();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMutating = isCreating || isUpdating;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreview(null);
  }, [image]);

  useEffect(() => {
    if (open) {
      if (editingWorkspace) {
        setName(editingWorkspace.name ?? "");
        setDescription(editingWorkspace.description ?? "");
        setColor(editingWorkspace.color ?? "");
      } else {
        setName("");
        setDescription("");
        setColor("");
        setImage(null);
      }
    }
  }, [open, editingWorkspace]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !name.trim() || isMutating) return;

    const dto = {
      name: name.trim(),
      description: description.trim() || undefined,
      color: color.trim() || undefined,
      image: image ?? undefined
    };

    if (editingWorkspace?.id) {
      updateWorkspace(
        { tenantId, workspaceId: editingWorkspace.id, dto },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createWorkspace(
        { tenantId, dto },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>
              {editingWorkspace ? "Edit Space" : "Create New Space"}
            </SheetTitle>
            <SheetDescription>
              {editingWorkspace
                ? "Update your workspace details."
                : "Add a new workspace to organize your projects."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 px-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="space-name">
                Name
              </label>
              <Input
                id="space-name"
                placeholder="e.g. Your new project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                htmlFor="space-description"
              >
                Description
              </label>
              <Textarea
                id="space-description"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="space-color">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="space-color"
                  type="color"
                  value={color || "#227bfe"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
                <Input
                  placeholder="#227bfe"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="space-image">
                Image
              </label>
              <input
                ref={fileInputRef}
                id="space-image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImage(file);
                  if (e.target) e.target.value = "";
                }}
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground shadow hover:bg-accent"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-4 w-4" />
                  Upload image
                </Button>
              )}
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isMutating || !name.trim()}>
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingWorkspace ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingWorkspace ? "Update Space" : "Create Space"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
