"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SoftwareForm } from "../../../_components/software-form";
import type { SoftwareFormValues } from "../../../_components/software-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

function toInitial(software: any | null): SoftwareFormValues {
  return {
    name: software?.name ?? "",
    slug: software?.slug ?? "",
    description: software?.description ?? "",
    iconImageId: software?.iconImageId ?? "",
    order: String(software?.order ?? 0),
    active: software?.active ?? true,
  };
}

export default function LibrarySoftwareEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const software = useQuery(api.library.listSoftwares, { activeOnly: false }) as any[] | undefined;
  const updateSoftware = useMutation(api.library.updateSoftware);

  const [submitting, setSubmitting] = useState(false);

  const current = useMemo(() => {
    if (!software) return undefined;
    return software.find((item) => String(item._id) === String(id));
  }, [software, id]);

  const initialValues = useMemo(() => toInitial(current ?? null), [current]);

  if (software === undefined) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  if (!current) {
    return <div className="text-sm text-muted-foreground">Không tìm thấy phần mềm.</div>;
  }

  async function handleSubmit(values: SoftwareFormValues) {
    const name = values.name.trim();
    const slug = values.slug.trim();
    if (!name || !slug) {
      toast.error("Cần nhập đầy đủ name và slug");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : current.order;

    setSubmitting(true);
    try {
      await updateSoftware({
        id: current._id as any,
        name,
        slug,
        description: values.description.trim() || undefined,
        iconImageId: values.iconImageId.trim() || undefined,
        order: parsedOrder,
        active: values.active,
      } as any);
      toast.success("Đã cập nhật phần mềm");
      router.push("/dashboard/library/software");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật phần mềm");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa phần mềm</CardTitle>
        </CardHeader>
        <CardContent>
          <SoftwareForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/library/software")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
