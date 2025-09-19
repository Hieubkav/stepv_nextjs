"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SoftwareForm } from "../../_components/software-form";
import type { SoftwareFormValues } from "../../_components/software-form";

function buildInitial(values?: Partial<SoftwareFormValues>): SoftwareFormValues {
  return {
    name: values?.name ?? "",
    slug: values?.slug ?? "",
    description: values?.description ?? "",
    iconImageId: values?.iconImageId ?? "",
    order: values?.order ?? "0",
    active: values?.active ?? true,
  };
}

export default function LibrarySoftwareCreatePage() {
  const router = useRouter();
  const softwares = useQuery(api.library.listSoftwares, { activeOnly: false }) as { order: number }[] | undefined;
  const createSoftware = useMutation(api.library.createSoftware);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    const order = softwares ? softwares.length : 0;
    return buildInitial({ order: String(order) });
  }, [softwares]);

  async function handleSubmit(values: SoftwareFormValues) {
    const name = values.name.trim();
    const slug = values.slug.trim();
    if (!name || !slug) {
      toast.error("Can nhap day du name va slug");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : softwares?.length ?? 0;

    setSubmitting(true);
    try {
      await createSoftware({
        name,
        slug,
        description: values.description.trim() || undefined,
        iconImageId: values.iconImageId.trim() || undefined,
        order: parsedOrder,
        active: values.active,
      } as any);
      toast.success("Da tao phan mem");
      router.push("/dashboard/library/software");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the tao phan mem");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Them phan mem</CardTitle>
        </CardHeader>
        <CardContent>
          <SoftwareForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tao"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/library/software")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
