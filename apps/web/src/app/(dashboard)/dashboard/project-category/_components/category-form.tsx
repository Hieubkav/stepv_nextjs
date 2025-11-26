"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export type ProjectCategoryFormValues = {
  name: string;
  description: string;
  active: boolean;
};

export type ProjectCategoryFormProps = {
  initialValues: ProjectCategoryFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: ProjectCategoryFormValues) => Promise<void>;
  onCancel?: () => void;
  mode?: "new" | "edit";
};

export function ProjectCategoryForm({
  initialValues,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: ProjectCategoryFormProps) {
  const [values, setValues] = useState<ProjectCategoryFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function update(field: keyof ProjectCategoryFormValues, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value } as ProjectCategoryFormValues));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Tên danh mục <span className="text-destructive">*</span>
        </label>
        <Input
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Dự án thương mại"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mô tả</label>
        <Textarea
          rows={4}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Giới thiệu ngắn về nhóm dự án"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="active"
          checked={values.active}
          onCheckedChange={(checked) => update("active", !!checked)}
        />
        <label htmlFor="active" className="text-sm text-muted-foreground">
          Hiển thị danh mục này
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

