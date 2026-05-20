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
import { Loader2, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useCreateRole } from "@/hooks/api/useTenantRoles";

interface CreateRoleDialogProps {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (roleId: string) => void;
}

export function CreateRoleDialog({
  tenantId,
  open,
  onOpenChange,
  onCreated
}: CreateRoleDialogProps) {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const { mutate: createRole, isPending: isCreatingRole } = useCreateRole();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newRoleName.trim();
    if (!tenantId || !name || isCreatingRole) return;
    createRole(
      {
        tenantId,
        dto: { name, description: newRoleDescription.trim() || undefined }
      },
      {
        onSuccess: (createdRole) => {
          setNewRoleName("");
          setNewRoleDescription("");
          onOpenChange(false);
          if (createdRole?.id) {
            onCreated?.(createdRole.id as string);
          }
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>
            Create new role and new access
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="role-name">
              Role Name
            </label>
            <Input
              id="role-name"
              type="text"
              placeholder="Role"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="role-description">
              Description
            </label>
            <Textarea
              id="role-description"
              placeholder="Role Description"
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white"
              disabled={isCreatingRole || !newRoleName.trim()}
            >
              {isCreatingRole ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
