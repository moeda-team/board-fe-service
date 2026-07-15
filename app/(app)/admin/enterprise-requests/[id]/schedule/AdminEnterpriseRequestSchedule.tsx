"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  FileText,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useAdminEnterpriseRequest } from "@/hooks/api/useAdminEnterpriseRequests";
import { gooeyToast } from "goey-toast";

const TIME_OPTIONS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00"
];

const DURATIONS = ["30 min", "45 min", "60 min", "90 min"];

export default function AdminEnterpriseRequestSchedule({ id }: { id: string }) {
  const { status } = useSession();
  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const isSuperAdmin = authMe?.user?.isSuperAdmin === true;
  const router = useRouter();

  const { data: request, isLoading: isRequestLoading } =
    useAdminEnterpriseRequest(id, isSuperAdmin);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60 min");
  const [host, setHost] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading" || isAuthLoading || isRequestLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Authentication required</h2>
        <p className="text-sm text-muted-foreground">
          Please sign in to access this page.
        </p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
        <ShieldAlert className="size-10 text-destructive" />
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page is restricted to super administrators only.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      gooeyToast.success("Discovery meeting scheduled");
      router.push(`/admin/enterprise-requests/${id}`);
    }, 800);
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b bg-white px-6 py-6">
        <button
          onClick={() => router.push(`/admin/enterprise-requests/${id}`)}
          className="mb-3 flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to request
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Schedule Discovery Meeting
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {request ? request.companyName : "Loading company..."}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Calendar className="size-3.5 text-blue-600" />
                  Date
                </Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Clock className="size-3.5 text-blue-600" />
                  Time
                </Label>
                <Select
                  value={time}
                  onValueChange={(v) => v && setTime(v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Clock className="size-3.5 text-blue-600" />
                  Duration
                </Label>
                <Select
                  value={duration}
                  onValueChange={(v) => v && setDuration(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Video className="size-3.5 text-blue-600" />
                Meeting Link
              </Label>
              <Input
                placeholder="https://meet.example.com/abc-defg-hij"
                type="url"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User className="size-3.5 text-blue-600" />
                Host / Account Manager
              </Label>
              <Input
                placeholder="Account manager name"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <FileText className="size-3.5 text-blue-600" />
                Agenda / Notes
              </Label>
              <Textarea
                placeholder="Add discovery agenda and talking points..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/enterprise-requests/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Schedule Meeting
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
