"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export type LessonFormValues = {
  title: string;
  description: string;
  youtubeUrl: string;
  durationSeconds: string;
  exerciseLink: string;
  isPreview: boolean;
  order: string;
  active: boolean;
};

export type LessonFormProps = {
  initialValues: LessonFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: LessonFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function LessonForm({ initialValues, submitting, submitLabel, onSubmit, onCancel }: LessonFormProps) {
  const [values, setValues] = useState(initialValues);

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

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tiêu đề bài học</label>
        <Input value={values.title} onChange={(event) => update("title", event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mô tả</label>
        <Textarea value={values.description} rows={3} onChange={(event) => update("description", event.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube URL</label>
          <Input value={values.youtubeUrl} onChange={(event) => update("youtubeUrl", event.target.value)} />
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Thứ tự</label>
          <Input value={values.order} onChange={(event) => update("order", event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Trạng thái</label>
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.active}
              onCheckedChange={(checked) => update("active", Boolean(checked))}
            />
            <span>{values.active ? "Đang hiện" : "Đang ẩn"}</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.isPreview}
              onCheckedChange={(checked) => update("isPreview", Boolean(checked))}
            />
            <span>Cho phép xem demo</span>
          </label>
        </div>
      </div>
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
    </form>
  );
}
