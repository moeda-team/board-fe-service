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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useInviteMember } from "@/hooks/api/useTenantMembers";
import { useRoles } from "@/hooks/api/useTenantRoles";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
import { Plus, Loader2, ChevronDown } from "lucide-react";
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
  onSuccess
}: InviteMemberDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteWorkspaceIds, setInviteWorkspaceIds] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

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
  const selectedWorkspaces = useMemo(
    () => workspaces.filter((ws) => inviteWorkspaceIds.includes(ws.id)),
    [workspaces, inviteWorkspaceIds]
  );
  const filteredWorkspaces = useMemo(() => {
    const q = workspaceSearch.toLowerCase();
    return workspaces.filter((ws) => (ws.name || "").toLowerCase().includes(q));
  }, [workspaces, workspaceSearch]);

  useEffect(() => {
    if (!inviteRoleId && roleOptions[0]?.id) {
      setInviteRoleId(roleOptions[0].id as string);
    }
  }, [inviteRoleId, roleOptions]);

  useEffect(() => {
    if (!open) {
      setInviteEmail("");
      setInviteWorkspaceIds([]);
      setInviteMessage("");
    }
  }, [open]);

  const handleWorkspaceToggle = (workspaceId: string, checked: boolean) => {
    setInviteWorkspaceIds((prev) =>
      checked ? [...prev, workspaceId] : prev.filter((id) => id !== workspaceId)
    );
  };

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!tenantId || !email || !inviteRoleId || isInvitingMember) return;

    if (!canInviteMember) {
      toast.error("You don't have permission to invite members.");
      return;
    }

    inviteMember(
      {
        tenantId,
        dto: { email, roleId: inviteRoleId, workspaceIds: inviteWorkspaceIds }
      },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteWorkspaceIds([]);
          setInviteMessage("");
          onOpenChange(false);
          onSuccess?.();
        }
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
            {isWorkspacesLoading ? (
              <div className="text-sm text-slate-500">Loading spaces...</div>
            ) : workspaces.length === 0 ? (
              <div className="text-sm text-slate-500">No spaces available</div>
            ) : (
              <Popover open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
                <PopoverTrigger className="flex min-h-9 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                  <div className="flex flex-wrap gap-1">
                    {selectedWorkspaces.length === 0 ? (
                      <span className="text-slate-500">Select spaces...</span>
                    ) : (
                      selectedWorkspaces.map((ws) => (
                        <Badge
                          key={ws.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {ws.name || "Untitled"}
                        </Badge>
                      ))
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${workspaceOpen ? "rotate-180" : ""}`}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <Input
                    placeholder="Search spaces..."
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    className="mb-2 h-8 text-sm"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredWorkspaces.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-slate-500">
                        No spaces found
                      </div>
                    ) : (
                      filteredWorkspaces.map((ws) => (
                        <label
                          key={ws.id}
                          className="flex items-center gap-2 cursor-pointer px-2 py-2 hover:bg-slate-100 rounded"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Checkbox
                            checked={inviteWorkspaceIds.includes(ws.id)}
                            onCheckedChange={(checked) =>
                              handleWorkspaceToggle(ws.id, checked === true)
                            }
                          />
                          <span className="text-sm">
                            {ws.name || "Untitled"}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
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
