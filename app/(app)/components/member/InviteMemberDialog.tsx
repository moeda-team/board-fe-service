"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useInviteMember } from "@/hooks/api/useTenantMembers";
import { useRoles } from "@/hooks/api/useTenantRoles";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
import { Plus, Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canInviteMember?: boolean;
  onSuccess?: () => void;
}

export function InviteMemberDialog({
  tenantId,
  open,
  onOpenChange,
  canInviteMember = true,
  onSuccess,
}: InviteMemberDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const { data: roles = [], isLoading: isRolesLoading } = useRoles(tenantId);
  const { data: workspaces = [], isLoading: isWorkspacesLoading } =
    useWorkspaces(tenantId);
  const { mutate: inviteMember, isPending: isInvitingMember } =
    useInviteMember();

  const roleOptions = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [roles]
  );
  const selectedInviteRole = roleOptions.find(
    (role) => role.id === inviteRoleId
  );
  const selectedInviteWorkspace = workspaces.find(
    (ws) => ws.id === inviteWorkspaceId
  );

  useEffect(() => {
    if (!inviteRoleId && roleOptions[0]?.id) {
      setInviteRoleId(roleOptions[0].id as string);
    }
  }, [inviteRoleId, roleOptions]);

  useEffect(() => {
    if (!open) {
      setInviteEmail("");
      setInviteWorkspaceId("");
      setInviteMessage("");
    }
  }, [open]);

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!tenantId || !email || !inviteRoleId || isInvitingMember) return;

    if (!canInviteMember) {
      toast.error("You don't have permission to invite members.");
      return;
    }

    const workspaceIds = inviteWorkspaceId ? [inviteWorkspaceId] : [];
    inviteMember(
      { tenantId, dto: { email, roleId: inviteRoleId, workspaceIds } },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteWorkspaceId("");
          setInviteMessage("");
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Invite new members to your workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="invite-email">
              Email Address
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select
              value={inviteRoleId}
              onValueChange={(value) => value && setInviteRoleId(value)}
              disabled={isRolesLoading}
            >
              <SelectTrigger className="w-full">
                {inviteRoleId && selectedInviteRole
                  ? selectedInviteRole.name
                  : "Select role"}
              </SelectTrigger>
              <SelectContent>
                {roleOptions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No roles available
                  </SelectItem>
                ) : (
                  roleOptions.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Space Invite</label>
            <Select
              value={inviteWorkspaceId}
              onValueChange={(value) => value && setInviteWorkspaceId(value)}
              disabled={isWorkspacesLoading}
            >
              <SelectTrigger className="w-full">
                {inviteWorkspaceId && selectedInviteWorkspace
                  ? selectedInviteWorkspace.name || "Untitled"
                  : "Select space"}
              </SelectTrigger>
              <SelectContent>
                {workspaces.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No spaces available
                  </SelectItem>
                ) : (
                  workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name || "Untitled"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="invite-message">
              Email Message
            </label>
            <Textarea
              id="invite-message"
              placeholder="Hi, saya invite kamu kedalam project A"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white"
              disabled={
                isInvitingMember ||
                isRolesLoading ||
                isWorkspacesLoading ||
                !inviteEmail.trim() ||
                !inviteRoleId
              }
            >
              {isInvitingMember ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Sent Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
