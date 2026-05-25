"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuthMe } from "@/hooks/api/useAuth";
import {
  useTenantApiKey,
  useGenerateApiKey,
  useRevokeApiKey
} from "@/hooks/api/useApiKeys";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import type { ApiKey } from "@/types/type-api-keys";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard");
  });
}

/**
 * Builds a safe display string from the server-returned hashedKey.
 * Server already masks most chars as "*", so we strip trailing stars
 * and append "••••••••" for a clean look.
 * e.g. prefix="vlx_live_", hashedKey="be54a2****..."
 *   → "vlx_live_be54a2 ••••••••"
 */
function buildMaskedDisplay(prefix: string, hashedKey: string): string {
  const visible = hashedKey.replace(/\*+$/, "").trim();
  return `${prefix}${visible} ••••••••`;
}

// ── RevealKey ─────────────────────────────────────────────────────────────────

interface RevealKeyProps {
  activeKey: ApiKey;
  /** Plaintext only available right after generation */
  plainKey: string | null;
}

function RevealKey({ activeKey, plainKey }: RevealKeyProps) {
  const [visible, setVisible] = useState(false);

  const maskedDisplay = buildMaskedDisplay(
    activeKey.prefix ?? "",
    activeKey.hashedKey ?? ""
  );
  const displayKey = visible && plainKey ? plainKey : maskedDisplay;

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800 break-all select-all">
        {displayKey}
      </code>

      {/* show/hide toggle — only while plainKey is in memory */}
      {plainKey && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-500 hover:text-slate-800"
          onClick={() => setVisible((v) => !v)}
          title={visible ? "Hide key" : "Reveal key"}
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      )}

      {/* copy only available right after generation while plainKey is in memory */}
      {plainKey && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-500 hover:text-slate-800"
          onClick={() => copyToClipboard(plainKey)}
          title="Copy"
        >
          <Copy className="size-4" />
        </Button>
      )}
    </div>
  );
}

// ── NewKeyBanner ──────────────────────────────────────────────────────────────

interface NewKeyBannerProps {
  plainKey: string;
  onDismiss: () => void;
}

function NewKeyBanner({ plainKey, onDismiss }: NewKeyBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-emerald-800">
            Your new API key has been generated
          </p>
          <p className="text-xs text-emerald-700">
            Copy it now — you won&apos;t be able to see it again after leaving
            this page.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-white/70 px-3 py-2 font-mono text-sm text-emerald-900 break-all select-all border border-emerald-200">
              {plainKey}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-emerald-400 hover:text-emerald-700 text-xs"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── RevokeDialog ──────────────────────────────────────────────────────────────

interface RevokeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

function RevokeDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending
}: RevokeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            Revoke API Key
          </DialogTitle>
          <DialogDescription>
            This will permanently revoke your API key. Any applications using
            this key will immediately lose access. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Revoke Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── RegenerateDialog ──────────────────────────────────────────────────────────

interface RegenerateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

function RegenerateDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending
}: RegenerateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <RefreshCw className="size-5" />
            Regenerate API Key
          </DialogTitle>
          <DialogDescription>
            A new API key will be generated and the current one will be
            immediately revoked. Make sure to update your integrations with the
            new key.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Regenerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── AuthSnippet ───────────────────────────────────────────────────────────────

const CURL_SNIPPET = `curl https://api-board.hompimpa.biz.id/api/... \\
  -H 'x-api-key: YOUR_API_KEY'`;

function AuthSnippet() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CURL_SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <pre className="rounded-lg bg-slate-900 px-4 py-3 text-xs font-mono text-slate-300 overflow-x-auto">
        <span className="text-slate-500">curl </span>
        <span className="text-blue-400">
          https://api-board.hompimpa.biz.id/api/...
        </span>
        {" \\\n  "}
        <span className="text-slate-400">-H </span>
        <span className="text-yellow-300">
          &apos;x-api-key: YOUR_API_KEY&apos;
        </span>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 size-7 text-slate-400 hover:text-white hover:bg-white/10"
        onClick={handleCopy}
        title="Copy"
      >
        {copied ? (
          <CheckCircle2 className="size-3.5 text-emerald-400" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ApiKeysPage() {
  const { data: authMe, isLoading: isAuthLoading, isFetched: isAuthFetched } =
    useAuthMe();

  const tenantId = authMe?.tenants?.[0]?.tenant?.id ?? "";

  const {
    data: activeKey,
    isLoading: isKeyLoading,
    isFetched: isKeyFetched
  } = useTenantApiKey(tenantId);

  const generateMutation = useGenerateApiKey();
  const revokeMutation = useRevokeApiKey();

  /** Plaintext key held in memory only until the user dismisses the banner */
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);

  // ── action handlers ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!tenantId) return;
    try {
      const created = await generateMutation.mutateAsync({
        tenantId,
        dto: { name: "Default" }
      });
      if (created.plainKey) setPlainKey(created.plainKey);
    } catch {
      toast.error("Failed to generate API key");
    }
  };

  const handleRevoke = async () => {
    if (!tenantId || !activeKey) return;
    try {
      await revokeMutation.mutateAsync({ tenantId, apiKeyId: activeKey.id });
      setPlainKey(null);
      setShowRevoke(false);
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  const handleRegenerate = async () => {
    if (!tenantId || !activeKey) return;
    try {
      await revokeMutation.mutateAsync({ tenantId, apiKeyId: activeKey.id });
      const created = await generateMutation.mutateAsync({
        tenantId,
        dto: { name: "Default" }
      });
      if (created.plainKey) setPlainKey(created.plainKey);
      setShowRegenerate(false);
    } catch {
      toast.error("Failed to regenerate API key");
    }
  };

  // ── loading state ──────────────────────────────────────────────────────────

  const isLoading =
    (isAuthLoading && !isAuthFetched) || (isKeyLoading && !isKeyFetched);

  if (isLoading) {
    return (
      <LayoutWrapper title="API Key" description="Loading your API key...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-brand-blue" />
        </div>
      </LayoutWrapper>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────

  const isMutating =
    generateMutation.isPending || revokeMutation.isPending;

  return (
    <>
      <LayoutWrapper
        title="API Key"
        description="Manage your workspace API key for programmatic access"
      >
        <div className="max-w-2xl space-y-6">
          {/* Info callout */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
            <p className="text-sm text-blue-800">
              Your workspace supports <strong>one active API key</strong> at a
              time. Generating a new key or regenerating will revoke the
              previous one immediately.
            </p>
          </div>

          {/* One-time plain-key banner */}
          {plainKey && (
            <NewKeyBanner
              plainKey={plainKey}
              onDismiss={() => setPlainKey(null)}
            />
          )}

          {/* Key card */}
          <div className="rounded-xl border bg-white shadow-sm">
            {/* Card header */}
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <KeyRound className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {activeKey ? (activeKey.name ?? "API Key") : "No API Key"}
                </p>
                <p className="text-xs text-slate-500">
                  {activeKey
                    ? "Active — use this key to authenticate API requests"
                    : "Generate a key to get programmatic access to your workspace"}
                </p>
              </div>
              <Badge
                className={
                  activeKey
                    ? "ml-auto bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "ml-auto bg-slate-100 text-slate-500 border-slate-200"
                }
                variant="outline"
              >
                {activeKey ? "Active" : "None"}
              </Badge>
            </div>

            <Separator />

            {/* Key body */}
            {activeKey ? (
              <div className="space-y-4 px-5 py-4">
                <RevealKey activeKey={activeKey} plainKey={plainKey} />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    Created {formatDate(activeKey.createdAt)}
                  </span>
                  {activeKey.lastUsedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Last used {formatDate(activeKey.lastUsedAt as string)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <KeyRound className="size-10 text-slate-300" />
                <p className="text-sm text-slate-500">
                  No API key has been generated yet.
                </p>
              </div>
            )}

            <Separator />

            {/* Card actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3">
              {!activeKey ? (
                <Button
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white"
                  onClick={handleGenerate}
                  disabled={isMutating}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Generate API Key
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => setShowRegenerate(true)}
                    disabled={isMutating}
                  >
                    <RefreshCw className="size-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowRevoke(true)}
                    disabled={isMutating}
                  >
                    <Trash2 className="size-4" />
                    Revoke
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Usage guide */}
          <div className="rounded-xl border bg-white shadow-sm px-5 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Authentication</p>
            <p className="text-xs text-slate-500">
              Pass your API key in the{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">
                x-api-key
              </code>{" "}
              header on every request:
            </p>
            <AuthSnippet />
          </div>
        </div>
      </LayoutWrapper>

      <RevokeDialog
        open={showRevoke}
        onOpenChange={setShowRevoke}
        onConfirm={handleRevoke}
        isPending={revokeMutation.isPending}
      />

      <RegenerateDialog
        open={showRegenerate}
        onOpenChange={setShowRegenerate}
        onConfirm={handleRegenerate}
        isPending={isMutating}
      />
    </>
  );
}
