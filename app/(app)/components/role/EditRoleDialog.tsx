"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2, Pencil } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useUpdateRole } from "@/hooks/api/useTenantRoles";

interface EditRoleDialogProps {
  tenantId: string;
  roleId: string | null;
  roleName?: string;
  roleDescription?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleDialog({
  tenantId,
  roleId,
  roleName,
  roleDescription,
  open,
  onOpenChange
}: EditRoleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRole();

  useEffect(() => {
    if (open) {
      setName(roleName ?? "");
      setDescription(roleDescription ?? "");
    }
  }, [open, roleName, roleDescription]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!tenantId || !roleId || !trimmedName || isUpdatingRole) return;
    updateRole(
      {
        tenantId,
        roleId,
        dto: { name: trimmedName, description: description.trim() || undefined }
      },
      {
        onSuccess: () => onOpenChange(false)
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role name and description
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-role-name">
              Role Name
            </label>
            <Input
              id="edit-role-name"
              type="text"
              placeholder="Role name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="edit-role-description"
            >
              Description
            </label>
            <Textarea
              id="edit-role-description"
              placeholder="Role description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white"
              disabled={isUpdatingRole || !name.trim()}
            >
              {isUpdatingRole ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
