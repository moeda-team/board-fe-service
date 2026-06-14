"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Quote,
  UploadCloud,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
  CalendarDays,
  Info,
  Loader2,
  GripVertical,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useCreateChangelog,
  useUpdateChangelog
} from "@/hooks/api/useAdminChangelogs";
import type { Changelog, ChangelogFormDto } from "@/types/type-changelogs";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const MENU_OPTIONS = [
  "Dashboard",
  "Check-in",
  "Hermes AI",
  "Meetings",
  "Projects",
  "Resource Allocation",
  "Settings",
  "Lainnya"
];

function formatDate(value: string | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FormState {
  menu: string;
  version: string;
  releaseDate: string;
  title: string;
  content: string;
  attachments: File[];
  youtubeUrl: string;
  highlights: string[];
}

function buildInitialState(changelog: Changelog | null): FormState {
  return {
    menu: changelog?.menu ?? "",
    version: changelog?.version ?? "",
    releaseDate: changelog?.releaseDate
      ? new Date(changelog.releaseDate).toISOString().slice(0, 10)
      : "",
    title: changelog?.title ?? "",
    content: changelog?.content ?? "",
    attachments: [],
    youtubeUrl: changelog?.youtubeUrl ?? "",
    highlights: changelog?.highlights?.length
      ? [...changelog.highlights]
      : [""]
  };
}

interface ChangelogFormProps {
  changelog: Changelog | null;
  onClose: () => void;
}

const SectionNumber = ({ n }: { n: number }) => (
  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
    {n}
  </span>
);

const ToolbarBtn = ({ children }: { children: React.ReactNode }) => (
  <button
    type="button"
    className="flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
    tabIndex={-1}
  >
    {children}
  </button>
);

export default function ChangelogForm({
  changelog,
  onClose
}: ChangelogFormProps) {
  const isEdit = !!changelog;
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(changelog)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateChangelog();
  const updateMutation = useUpdateChangelog();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const previewImages = useMemo(
    () => form.attachments.map((f) => URL.createObjectURL(f)),
    [form.attachments]
  );
  const [activePreview, setActivePreview] = useState(0);
  const youtubeId = getYoutubeId(form.youtubeUrl);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const valid: File[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 10MB limit`);
        continue;
      }
      valid.push(file);
    }
    setForm((prev) => {
      const merged = [...prev.attachments, ...valid];
      if (merged.length > MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} files`);
      }
      return { ...prev, attachments: merged.slice(0, MAX_FILES) };
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) =>
    update(
      "attachments",
      form.attachments.filter((_, i) => i !== index)
    );

  const updateHighlight = (index: number, value: string) =>
    update(
      "highlights",
      form.highlights.map((h, i) => (i === index ? value : h))
    );

  const addHighlight = () => update("highlights", [...form.highlights, ""]);

  const removeHighlight = (index: number) =>
    update(
      "highlights",
      form.highlights.filter((_, i) => i !== index)
    );

  const submit = (isDraft: boolean) => {
    if (!form.title.trim()) {
      toast.error("Nama update wajib diisi");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Deskripsi update wajib diisi");
      return;
    }

    const dto: ChangelogFormDto = {
      menu: form.menu || undefined,
      version: form.version.trim() || undefined,
      title: form.title.trim(),
      content: form.content.trim(),
      releaseDate: form.releaseDate || undefined,
      youtubeUrl: form.youtubeUrl.trim() || undefined,
      highlights: form.highlights.filter((h) => h.trim()),
      attachments: form.attachments.length ? form.attachments : undefined,
      isDraft
    };

    const onSuccess = () => onClose();

    if (isEdit) {
      updateMutation.mutate({ id: changelog!.id, dto }, { onSuccess });
    } else {
      createMutation.mutate({ dto }, { onSuccess });
    }
  };

  const previewHighlights = form.highlights.filter((h) => h.trim());

  return (
    <div className="min-h-full bg-slate-50">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-6 pt-5 text-sm text-slate-400">
        <button
          onClick={onClose}
          className="text-blue-600 hover:underline"
          type="button"
        >
          Changelog
        </button>
        <ChevronRight className="size-3.5" />
        <span className="text-slate-500">
          {isEdit ? "Edit Update" : "Create Update"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-5 lg:grid-cols-[1fr_360px]">
        {/* ── Form column ─────────────────────────────────────────── */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Changelog" : "Buat Changelog Baru"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update akan langsung dipublish setelah disimpan.
          </p>

          {/* Versi + Tanggal Rilis */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">
                Versi
              </label>
              <Input
                placeholder="e.g. 1.2.0"
                value={form.version}
                onChange={(e) => update("version", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">
                Tanggal Rilis
              </label>
              <Input
                type="date"
                value={form.releaseDate}
                onChange={(e) => update("releaseDate", e.target.value)}
              />
            </div>
          </div>

          {/* 1. Menu yang Diupdate */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <SectionNumber n={1} />
              <span className="text-sm font-semibold text-slate-900">
                Menu yang Diupdate <span className="text-red-500">*</span>
              </span>
            </div>
            <p className="mb-2 ml-7 text-xs text-slate-500">
              Pilih menu atau modul yang mengalami perubahan.
            </p>
            <div className="relative ml-7">
              <select
                value={form.menu}
                onChange={(e) => update("menu", e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-input bg-white px-3 pr-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Pilih menu...</option>
                {MENU_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* 2. Nama Update */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <SectionNumber n={2} />
              <span className="text-sm font-semibold text-slate-900">
                Nama Update <span className="text-red-500">*</span>
              </span>
            </div>
            <p className="mb-2 ml-7 text-xs text-slate-500">
              Berikan nama singkat dan jelas untuk update ini.
            </p>
            <div className="ml-7">
              <Input
                placeholder="Dashboard Analytics Export PDF"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>
          </div>

          {/* 3. Deskripsi Update */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <SectionNumber n={3} />
              <span className="text-sm font-semibold text-slate-900">
                Deskripsi Update <span className="text-red-500">*</span>
              </span>
            </div>
            <p className="mb-2 ml-7 text-xs text-slate-500">
              Jelaskan perubahan atau fitur baru secara detail.
            </p>
            <div className="ml-7 overflow-hidden rounded-lg border border-input">
              <div className="flex items-center gap-0.5 border-b bg-slate-50 px-2 py-1">
                <ToolbarBtn>
                  <Bold className="size-4" />
                </ToolbarBtn>
                <ToolbarBtn>
                  <Italic className="size-4" />
                </ToolbarBtn>
                <span className="mx-1 h-4 w-px bg-slate-200" />
                <ToolbarBtn>
                  <List className="size-4" />
                </ToolbarBtn>
                <ToolbarBtn>
                  <ListOrdered className="size-4" />
                </ToolbarBtn>
                <span className="mx-1 h-4 w-px bg-slate-200" />
                <ToolbarBtn>
                  <Link2 className="size-4" />
                </ToolbarBtn>
                <ToolbarBtn>
                  <Quote className="size-4" />
                </ToolbarBtn>
              </div>
              <Textarea
                rows={5}
                maxLength={2000}
                className="rounded-none border-0 focus-visible:ring-0"
                placeholder="Kami menambahkan fitur export dashboard ke PDF..."
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
              />
              <div className="bg-white px-3 py-1.5 text-right text-[11px] text-slate-400">
                {form.content.length} / 2000
              </div>
            </div>
          </div>

          {/* 4. Screenshot */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <SectionNumber n={4} />
              <span className="text-sm font-semibold text-slate-900">
                Screenshot (Multiple Images)
              </span>
            </div>
            <p className="mb-2 ml-7 text-xs text-slate-500">
              Upload beberapa screenshot untuk menunjukkan perubahan.
            </p>
            <div className="ml-7">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleSelectFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50"
              >
                <UploadCloud className="size-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Upload Screenshot
                </span>
                <span className="text-[11px] text-slate-400">
                  PNG, JPG, GIF. Maks 10MB per file
                </span>
              </button>

              {form.attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {form.attachments.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="group relative overflow-hidden rounded-lg border bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewImages[index]}
                        alt={file.name}
                        className="h-20 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:text-red-500"
                      >
                        <X className="size-3" />
                      </button>
                      <div className="px-2 py-1">
                        <p className="truncate text-[11px] font-medium text-slate-700">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Demo Video */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <SectionNumber n={5} />
              <span className="text-sm font-semibold text-slate-900">
                Demo Video (YouTube URL){" "}
                <span className="font-normal text-slate-400">(Opsional)</span>
              </span>
            </div>
            <p className="mb-2 ml-7 text-xs text-slate-500">
              Tempel link YouTube untuk menampilkan video demo.
            </p>
            <div className="ml-7">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtubeUrl}
                onChange={(e) => update("youtubeUrl", e.target.value)}
              />
              {youtubeId && (
                <div className="mt-2 flex items-center gap-3 rounded-lg border bg-slate-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                    alt="thumbnail"
                    className="h-12 w-20 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {form.title || "Demo Video"}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                      <CheckCircle2 className="size-3" /> Link valid
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Highlight Perubahan */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <SectionNumber n={6} />
              <span className="text-sm font-semibold text-slate-900">
                Highlight Perubahan
              </span>
            </div>
            <p className="mb-2 ml-7 text-xs text-slate-500">
              Tampilkan poin penting dari update ini.
            </p>
            <div className="ml-7 space-y-2">
              {form.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="size-4 shrink-0 text-slate-300" />
                  <div className="relative flex-1">
                    <CheckCircle2 className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
                    <Input
                      className="pl-8"
                      placeholder="Tulis highlight..."
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHighlight}
              >
                <Plus className="size-4" />
                Tambah Highlight
              </Button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-8 flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={() => submit(true)}
              disabled={isSaving}
            >
              Simpan Draft
            </Button>
            <div className="flex-1 text-center sm:text-right">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                onClick={() => submit(false)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Publish Update (Auto Publish)
              </Button>
              <p className="mt-1 text-[11px] text-slate-400">
                Update akan langsung tampil di halaman What&apos;s New
              </p>
            </div>
          </div>
        </div>

        {/* ── Preview column ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-medium text-slate-400">
              Preview{" "}
              <span className="text-slate-300">
                (Akan tampil untuk pengguna)
              </span>
            </p>

            {form.menu && (
              <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                {form.menu}
              </Badge>
            )}

            <h2 className="text-lg font-bold text-slate-900">
              {form.title || "Judul update"}
            </h2>

            {form.content && (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {form.content}
              </p>
            )}

            {previewHighlights.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {previewHighlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {previewImages.length > 0 && (
              <div className="relative mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImages[activePreview] ?? previewImages[0]}
                  alt="preview"
                  className="h-40 w-full rounded-lg border object-cover"
                />
                {previewImages.length > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {previewImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePreview(i)}
                        className={`size-1.5 rounded-full ${
                          i === activePreview ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {youtubeId && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  Demo Video
                </p>
                <div className="relative overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt="demo video"
                    className="h-36 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="flex size-11 items-center justify-center rounded-full bg-red-600 text-white">
                      <Play className="size-5" fill="white" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays className="size-3.5" />
                {formatDate(form.releaseDate)}
              </span>
              {form.version && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  v{form.version.replace(/^v/i, "")}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-800">Informasi</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  Setelah dipublish, update ini akan langsung muncul di halaman
                  What&apos;s New untuk semua pengguna.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
