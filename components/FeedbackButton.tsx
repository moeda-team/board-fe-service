"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  Mail,
  Send,
  Upload,
  X,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSubmitFeedback } from "@/hooks/api/useFeedback";
import { toast } from "sonner";

type FeedbackCategory = "bug" | "feature";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

/* ------------------------------------------------------------------ */
/*  Feedback Dialog (Report Bug / Request Feature)                    */
/* ------------------------------------------------------------------ */
function FeedbackDialog({
  open,
  onOpenChange,
  category
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: FeedbackCategory;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useSubmitFeedback();

  const isBug = category === "bug";

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setEmail("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleOpenChange = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = Array.from(selected);
    const combined = [...files, ...newFiles].slice(0, MAX_FILES);
    const valid = combined.filter((f) => f.size <= MAX_FILE_SIZE);
    if (valid.length < combined.length) {
      toast.error("Some files exceed the 10 MB limit and were skipped.");
    }
    setFiles(valid);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        email: email.trim() || undefined,
        attachments: files.length > 0 ? files : undefined
      },
      {
        onSuccess: () => {
          toast.success(
            isBug
              ? "Bug report submitted. Thank you!"
              : "Feature request submitted. Thank you!"
          );
          handleOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to submit feedback. Please try again.");
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBug ? (
              <Bug className="size-5 text-red-500" />
            ) : (
              <Lightbulb className="size-5 text-amber-500" />
            )}
            {isBug ? "Report a Bug" : "Request a Feature"}
          </DialogTitle>
          <DialogDescription>
            {isBug
              ? "Help us fix it by giving us as much detail as possible."
              : "Share your idea and help us improve."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isBug ? "Short summary of an issue" : "Short summary of an idea"
              }
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isBug
                  ? "What's happening and what did you expect?"
                  : "Describe an idea"
              }
              required
              className="min-h-24"
            />
          </div>

          {/* Attachments */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Attachment
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-primary/40 px-4 py-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/70 hover:bg-primary/5"
            >
              <Upload className="size-5 text-primary" />
              <span>
                Drag or click your attachment{" "}
                <span className="text-muted-foreground/70">
                  | Max {MAX_FILES} files, 10 MB each
                </span>
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.log"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {files.length > 0 && (
              <ul className="flex flex-col gap-1">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md bg-muted/60 px-2 py-1 text-xs"
                  >
                    <span className="truncate pr-2">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Your email{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={isPending || !title.trim() || !description.trim()}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Feedback Button                                          */
/* ------------------------------------------------------------------ */
export function FeedbackButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<FeedbackCategory | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const openDialog = (cat: FeedbackCategory) => {
    setMenuOpen(false);
    setDialogCategory(cat);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6 z-40">
        {/* Dropdown menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-14 right-0 w-48 rounded-xl border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
          >
            <button
              onClick={() => openDialog("bug")}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <Bug className="size-4" />
              Report Bug
            </button>
            <button
              onClick={() => openDialog("feature")}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <Lightbulb className="size-4" />
              Request Feature
            </button>
            <a
              href="mailto:support.papanclip@gmail.com"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              <Mail className="size-4" />
              Send Email
            </a>
          </div>
        )}

        {/* FAB */}
        <button
          ref={buttonRef}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex size-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Feedback"
        >
          <MessageSquarePlus className="size-5" />
        </button>
      </div>

      {/* Dialogs */}
      <FeedbackDialog
        open={dialogCategory === "bug"}
        onOpenChange={(v) => !v && setDialogCategory(null)}
        category="bug"
      />
      <FeedbackDialog
        open={dialogCategory === "feature"}
        onOpenChange={(v) => !v && setDialogCategory(null)}
        category="feature"
      />
    </>
  );
}
