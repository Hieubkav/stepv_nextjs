"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export type ChapterFormValues = {
  title: string;
  summary: string;
  order: string;
  active: boolean;
};

export type ChapterFormProps = {
  initialValues: ChapterFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: ChapterFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function ChapterForm({ initialValues, submitting, submitLabel, onSubmit, onCancel }: ChapterFormProps) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function update(field: keyof ChapterFormValues, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tiêu đề chương</label>
        <Input value={values.title} onChange={(event) => update("title", event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tóm tắt</label>
        <Textarea value={values.summary} rows={3} onChange={(event) => update("summary", event.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
