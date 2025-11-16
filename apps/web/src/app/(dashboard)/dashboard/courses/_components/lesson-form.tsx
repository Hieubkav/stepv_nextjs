"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FullRichEditor } from "@/components/ui/full-rich-editor";
import { Play } from "lucide-react";

export type LessonFormValues = {
  title: string;
  description: string;
  youtubeUrl: string;
  durationSeconds: string;
  exerciseLink: string;
  isPreview: boolean;
  active: boolean;
};

export type LessonFormProps = {
  initialValues: LessonFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: LessonFormValues) => Promise<void>;
  onCancel?: () => void;
  hideButtons?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
};

export function LessonForm({ initialValues, submitting, submitLabel, onSubmit, onCancel, hideButtons, formRef }: LessonFormProps) {
  const [values, setValues] = useState(initialValues);
  const internalRef = useRef<HTMLFormElement>(null);
  const ref = formRef || internalRef;

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function update(field: keyof LessonFormValues, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  const youtubeThumbUrl = useMemo(() => {
    try {
      const url = new URL(values.youtubeUrl);
      let videoId = "";
      if (url.hostname.includes("youtube.com")) {
        videoId = url.searchParams.get("v") || "";
      } else if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.slice(1).split("?")[0];
      }
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    } catch {
      return null;
    }
  }, [values.youtubeUrl]);

  return (
    <form ref={ref} className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tiêu đề bài học</label>
        <Input value={values.title} onChange={(event) => update("title", event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mô tả</label>
        <FullRichEditor
          value={values.description}
          onChange={(html) => update("description", html)}
          placeholder="Giới thiệu bài học này..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube URL</label>
          <Input value={values.youtubeUrl} onChange={(event) => update("youtubeUrl", event.target.value)} />
          {youtubeThumbUrl && (
            <div className="flex items-center gap-3 rounded-md border p-2 bg-muted/30">
              <img
                src={youtubeThumbUrl}
                alt="YouTube thumbnail"
                className="h-12 w-20 rounded object-cover"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" />
                Preview
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Thời lượng (giây)</label>
          <Input value={values.durationSeconds} onChange={(event) => update("durationSeconds", event.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Link bài tập (Drive, v.v.)</label>
          <Input
            value={values.exerciseLink}
            onChange={(event) => update("exerciseLink", event.target.value)}
            placeholder="https://..."
          />
        </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-md border border-input bg-background/50 px-4 py-3 cursor-pointer hover:bg-accent/50 transition">
          <Checkbox
            checked={values.active}
            onCheckedChange={(checked) => update("active", Boolean(checked))}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Đang hiện</div>
            <div className="text-xs text-muted-foreground">Học viên sẽ thấy bài học này</div>
          </div>
        </label>
        <label className="flex items-center gap-3 rounded-md border border-input bg-background/50 px-4 py-3 cursor-pointer hover:bg-accent/50 transition">
          <Checkbox
            checked={values.isPreview}
            onCheckedChange={(checked) => update("isPreview", Boolean(checked))}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Xem demo</div>
            <div className="text-xs text-muted-foreground">Cho phép xem miễn phí</div>
          </div>
        </label>
        </div>
      {!hideButtons && (
        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
