"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, GripVertical } from "lucide-react";

type SoftwareDoc = {
  _id: Id<"library_softwares">;
  name: string;
  slug: string;
  iconImageId?: Id<"media">;
  active: boolean;
};

type MappingLink = {
  _id: Id<"library_resource_softwares">;
  softwareId: Id<"library_softwares">;
  note?: string;
  order: number;
  active: boolean;
};

type ResourceSoftwaresManagerProps = {
  resourceId: string;
};

export function ResourceSoftwaresManager({ resourceId }: ResourceSoftwaresManagerProps) {
  const typedResourceId = resourceId as Id<"library_resources">;

  const resourceSoftwares = useQuery(api.library.listResourceSoftwares, {
    resourceId: typedResourceId,
    includeInactive: true,
  }) as { software: SoftwareDoc; link: MappingLink }[] | undefined;

  const allSoftwares = useQuery(api.library.listSoftwares, { activeOnly: true }) as SoftwareDoc[] | undefined;

  const media = useQuery(api.media.list, { kind: "image" }) as { _id: Id<"media">; url: string }[] | undefined;

  const assignSoftware = useMutation(api.library.assignSoftwareToResource);
  const removeSoftware = useMutation(api.library.removeResourceSoftware);

  const [selectedSoftwareId, setSelectedSoftwareId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const mediaMap = useMemo(() => {
    const map = new Map<string, string>();
    if (media) {
      for (const m of media) {
        map.set(String(m._id), m.url);
      }
    }
    return map;
  }, [media]);

  const assignedSoftwareIds = useMemo(() => {
    if (!resourceSoftwares) return new Set<string>();
    return new Set(resourceSoftwares.map((item) => String(item.software._id)));
  }, [resourceSoftwares]);

  const availableSoftwares = useMemo(() => {
    if (!allSoftwares) return [];
    return allSoftwares.filter((s) => !assignedSoftwareIds.has(String(s._id)));
  }, [allSoftwares, assignedSoftwareIds]);

  async function handleAssign(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSoftwareId) {
      toast.error("Vui lòng chọn phần mềm");
      return;
    }
    setAssigning(true);
    try {
      await assignSoftware({
        resourceId: typedResourceId,
        softwareId: selectedSoftwareId as Id<"library_softwares">,
        active: true,
      });
      toast.success("Đã thêm phần mềm");
      setSelectedSoftwareId("");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể thêm phần mềm");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemove(linkId: Id<"library_resource_softwares">) {
    if (!window.confirm("Xóa phần mềm này khỏi tài nguyên?")) return;
    setRemovingId(String(linkId));
    try {
      await removeSoftware({ id: linkId });
      toast.success("Đã xóa phần mềm");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa phần mềm");
    } finally {
      setRemovingId(null);
    }
  }

  const isLoading = resourceSoftwares === undefined || allSoftwares === undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phần mềm liên quan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleAssign}>
          <div className="sm:flex-1">
            <label className="text-sm font-medium">Chọn phần mềm</label>
            {isLoading ? (
              <div className="text-xs text-muted-foreground">Đang tải...</div>
            ) : availableSoftwares.length === 0 ? (
              <div className="text-xs text-muted-foreground">Đã thêm tất cả phần mềm hoặc chưa có phần mềm nào.</div>
            ) : (
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedSoftwareId}
                onChange={(e) => setSelectedSoftwareId(e.target.value)}
              >
                <option value="">-- Chọn phần mềm --</option>
                {availableSoftwares.map((software) => (
                  <option key={String(software._id)} value={String(software._id)}>
                    {software.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex justify-end sm:block">
            <Button type="submit" disabled={assigning || availableSoftwares.length === 0 || !selectedSoftwareId}>
              {assigning ? "Đang thêm..." : "Thêm"}
            </Button>
          </div>
        </form>

        <Separator />

        {isLoading && <div className="text-sm text-muted-foreground">Đang tải danh sách phần mềm...</div>}

        {!isLoading && resourceSoftwares && resourceSoftwares.length === 0 && (
          <div className="text-sm text-muted-foreground">Chưa có phần mềm nào được gán cho tài nguyên này.</div>
        )}

        {resourceSoftwares && resourceSoftwares.length > 0 && (
          <div className="space-y-2">
            {resourceSoftwares.map(({ software, link }) => {
              const iconUrl = software.iconImageId ? mediaMap.get(String(software.iconImageId)) : undefined;
              return (
                <div
                  key={String(link._id)}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                  {iconUrl ? (
                    <img src={iconUrl} alt={software.name} className="size-10 rounded object-cover" />
                  ) : (
                    <div className="size-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{software.name}</div>
                    <div className="text-xs text-muted-foreground">{software.slug}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(link._id)}
                    disabled={removingId === String(link._id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
