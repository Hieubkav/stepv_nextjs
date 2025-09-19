"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

type SoftwareDoc = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconImageId?: string;
  order: number;
  active: boolean;
};

export default function LibrarySoftwareListPage() {
  const softwares = useQuery(api.library.listSoftwares, { activeOnly: false }) as SoftwareDoc[] | undefined;
  const updateSoftware = useMutation(api.library.updateSoftware);
  const setSoftwareActive = useMutation(api.library.setSoftwareActive);
  const deleteSoftware = useMutation(api.library.deleteSoftware);
  const iconImages = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;

  const iconLookup = useMemo(() => {
    const lookup: Record<string, any> = {};
    (iconImages ?? []).forEach((img: any) => {
      lookup[String(img._id)] = img;
    });
    return lookup;
  }, [iconImages]);

  const sorted = useMemo(() => {
    if (!softwares) return [] as SoftwareDoc[];
    return [...softwares].sort((a, b) => a.order - b.order);
  }, [softwares]);

  async function handleToggleActive(item: SoftwareDoc) {
    try {
      await setSoftwareActive({ id: item._id as any, active: !item.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat trang thai");
    }
  }

  async function handleDelete(item: SoftwareDoc) {
    if (!window.confirm(`Xoa phan mem "${item.name}"?`)) return;
    try {
      await deleteSoftware({ id: item._id as any });
      toast.success("Da xoa phan mem");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the xoa phan mem");
    }
  }

  async function move(item: SoftwareDoc, direction: "up" | "down") {
    const index = sorted.findIndex((row) => row._id === item._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const target = sorted[targetIndex];
    try {
      await updateSoftware({ id: item._id as any, order: target.order });
      await updateSoftware({ id: target._id as any, order: item.order });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the doi thu tu");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thu vien - Phan mem</h1>
          <p className="text-sm text-muted-foreground">Quan ly danh sach phan mem lien quan den resource.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/library/software/new">
            <Plus className="mr-2 size-4" /> Them phan mem
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sach phan mem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!softwares && <div className="text-sm text-muted-foreground">Dang tai...</div>}
          {softwares && sorted.length === 0 && (
            <div className="text-sm text-muted-foreground">Chua co phan mem nao.</div>
          )}
          {softwares && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((item, index) => {
                const icon = item.iconImageId ? iconLookup[String(item.iconImageId)] ?? null : null;
                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      {item.iconImageId && (
                        <div className="flex items-center justify-center">
                          {icon?.url ? (
                            <img
                              src={icon.url}
                              alt={icon.title || item.name}
                              className="h-16 w-16 rounded border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                              No icon
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{item.name}</span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            order #{item.order}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Slug: {item.slug}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                        )}
                        {item.iconImageId && (
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>ID icon: {item.iconImageId}</div>
                            {icon?.title && <div className="truncate">Ten media: {icon.title}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox checked={item.active} onCheckedChange={() => handleToggleActive(item)} />
                        {item.active ? "Dang hien" : "Dang an"}
                      </label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/library/software/${item._id}/edit`}>
                            <Pencil className="mr-2 size-4" /> Sua
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => move(item, "up")}
                          disabled={index === 0}
                          title="Len"
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => move(item, "down")}
                          disabled={index === sorted.length - 1}
                          title="Xuong"
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title="Xoa"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
