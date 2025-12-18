"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Image, Video, X } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";

export default function StorageCleanupPage() {
  const [deletingOrphans, setDeletingOrphans] = useState(false);
  const [deletingBroken, setDeletingBroken] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const orphanData = useQuery(api.storageCleanup.findOrphanMedia, {});
  const brokenData = useQuery(api.storageCleanup.findBrokenMedia, {});
  const storageIds = useQuery(api.storageCleanup.listAllStorageIds, {});

  const deleteOneMedia = useMutation(api.storageCleanup.deleteOneMedia);
  const deleteOrphanMedia = useMutation(api.storageCleanup.deleteOrphanMedia);
  const deleteBrokenMedia = useMutation(api.storageCleanup.deleteBrokenMedia);

  const handleDeleteOne = async (mediaId: string) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa media này?");
    if (!confirmed) return;

    setDeletingIds(prev => new Set(prev).add(mediaId));
    try {
      await deleteOneMedia({ mediaId: mediaId as Id<"media"> });
      toast.success("Đã xóa media");
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi xóa media");
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(mediaId);
        return next;
      });
    }
  };

  const handleDeleteOrphans = async () => {
    if (!orphanData?.orphanMedia?.length) return;
    
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${orphanData.orphanCount} media cô đơn?\nHành động này không thể hoàn tác!`
    );
    if (!confirmed) return;

    setDeletingOrphans(true);
    try {
      const ids = orphanData.orphanMedia.map((m) => m._id as Id<"media">);
      const result = await deleteOrphanMedia({ mediaIds: ids });
      toast.success(`Đã xóa ${result.deleted} records và ${result.storageDeleted} files`);
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi xóa media");
    } finally {
      setDeletingOrphans(false);
    }
  };

  const handleDeleteBroken = async () => {
    if (!brokenData?.brokenMedia?.length) return;
    
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${brokenData.brokenCount} media hỏng?\nHành động này không thể hoàn tác!`
    );
    if (!confirmed) return;

    setDeletingBroken(true);
    try {
      const ids = brokenData.brokenMedia.map((m) => m._id as Id<"media">);
      const result = await deleteBrokenMedia({ mediaIds: ids });
      toast.success(`Đã xóa ${result.deleted} records`);
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi xóa media");
    } finally {
      setDeletingBroken(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dọn dẹp Storage</h1>
        <p className="text-muted-foreground">
          Quét và xóa các media không được sử dụng hoặc bị hỏng
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orphanData?.totalMedia ?? "..."}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Media cô đơn
            </CardTitle>
            <CardDescription>Không được reference bởi content nào</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orphanData?.orphanCount ?? "..."}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Media hỏng
            </CardTitle>
            <CardDescription>Có record nhưng storage blob không tồn tại</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {brokenData?.brokenCount ?? "..."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orphan Media Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Media cô đơn ({orphanData?.orphanCount ?? 0})
              </CardTitle>
              <CardDescription>
                Các media này không được sử dụng trong bất kỳ content nào (posts, projects, courses, etc.)
              </CardDescription>
            </div>
            {orphanData?.orphanCount ? (
              <Button
                variant="destructive"
                onClick={handleDeleteOrphans}
                disabled={deletingOrphans}
              >
                {deletingOrphans ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa tất cả
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {!orphanData ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Đang quét...
            </div>
          ) : orphanData.orphanCount === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Không có media cô đơn
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {orphanData.orphanMedia.map((m) => (
                <div key={m._id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {m.url ? (
                      m.kind === "image" ? (
                        <img
                          src={m.url}
                          alt={m.title || "Media"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={m.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No preview
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 right-2"
                      variant={m.kind === "image" ? "default" : "outline"}
                    >
                      {m.kind === "image" ? (
                        <Image className="h-3 w-3 mr-1" />
                      ) : (
                        <Video className="h-3 w-3 mr-1" />
                      )}
                      {m.kind}
                    </Badge>
                  </div>
                  <div className="p-3 space-y-2 text-sm">
                    <p className="font-medium truncate">{m.title || "Không tên"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(m.sizeBytes)} · {m.format || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString("vi-VN") : "N/A"}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {m._id}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleDeleteOne(m._id)}
                      disabled={deletingIds.has(m._id)}
                    >
                      {deletingIds.has(m._id) ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Broken Media Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Media hỏng ({brokenData?.brokenCount ?? 0})
              </CardTitle>
              <CardDescription>
                Các records này có trong DB nhưng file storage đã bị xóa
              </CardDescription>
            </div>
            {brokenData?.brokenCount ? (
              <Button
                variant="destructive"
                onClick={handleDeleteBroken}
                disabled={deletingBroken}
              >
                {deletingBroken ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa tất cả
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {!brokenData ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Đang quét...
            </div>
          ) : brokenData.brokenCount === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Không có media hỏng
            </div>
          ) : (
            <div className="space-y-2">
              {brokenData.brokenMedia.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium truncate">{m.title || "Không tên"}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.kind} · {formatBytes(m.sizeBytes)} · Storage: {m.storageId}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      ID: {m._id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-red-600 border-red-600">Missing</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteOne(m._id)}
                      disabled={deletingIds.has(m._id)}
                    >
                      {deletingIds.has(m._id) ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage IDs Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Storage IDs trong DB</CardTitle>
          <CardDescription>
            Tổng {storageIds?.count ?? 0} storage IDs. So sánh với Convex Dashboard để tìm orphan storage files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-40 overflow-y-auto text-xs font-mono bg-muted p-3 rounded-lg">
            {storageIds?.storageIds?.join("\n") || "Loading..."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
