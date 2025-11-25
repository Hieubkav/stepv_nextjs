"use client";

import { use, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { VfxForm, type VfxFormValues, type VfxAssetForm } from "../../_components/vfx-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

type CustomerMini = {
  _id: Id<"customers">;
  fullName?: string;
  email?: string;
  phone?: string;
  account?: string;
  active?: boolean;
};

type PurchaseWithCustomer = {
  _id: Id<"customer_purchases">;
  customerId: Id<"customers">;
  orderId: Id<"orders">;
  productType: "resource" | "course" | "vfx";
  productId: string;
  orderNumber?: string | null;
  orderStatus?: string | null;
  createdAt: number;
  customer: CustomerMini | null;
};

type VfxTab = "info" | "customers";

const VFX_TABS: { key: VfxTab; label: string }[] = [
  { key: "info", label: "Thông tin" },
  { key: "customers", label: "Khách hàng" },
];

const toMb = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "";
  return (bytes / (1024 * 1024)).toFixed(2).replace(/\.0+$/, "");
};

const normalizeAssets = (list: VfxAssetForm[]) => {
  if (!list.length) return list;
  const sorted = list
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, idx) => ({ ...item, order: idx }));
  const primaryIdx = sorted.findIndex((item) => item.isPrimary && item.active);
  const activeIdx = sorted.findIndex((item) => item.active);
  const target = primaryIdx !== -1 ? primaryIdx : activeIdx !== -1 ? activeIdx : 0;
  return sorted.map((item, idx) => ({ ...item, isPrimary: idx === target }));
};

function toInitial(product: any | null, assets: any[]): VfxFormValues {
  const previewAssets: VfxAssetForm[] = assets
    .filter((a) => a.kind === "preview")
    .map((a) => ({
      id: String(a._id),
      mediaId: String(a.mediaId),
      source: a.mediaId ? "media" : "link",
      url: "",
      label: a.label ?? "",
      variant: a.variant ?? "",
      isPrimary: Boolean(a.isPrimary),
      active: Boolean(a.active),
      order: a.order ?? 0,
      kind: "preview",
    }));

  const downloadAssets: VfxAssetForm[] = assets
    .filter((a) => a.kind === "download")
    .map((a) => ({
      id: String(a._id),
      mediaId: String(a.mediaId),
      source: a.mediaId ? "media" : "link",
      url: "",
      label: a.label ?? "",
      variant: a.variant ?? "",
      isPrimary: Boolean(a.isPrimary),
      active: Boolean(a.active),
      order: a.order ?? 0,
      kind: "download",
    }));

  if (!previewAssets.length && product?.previewVideoId) {
    previewAssets.push({
      id: undefined,
      mediaId: String(product.previewVideoId),
      source: "media",
      url: "",
      label: "",
      variant: "",
      isPrimary: true,
      active: true,
      order: 0,
      kind: "preview",
    });
  }

  if (!downloadAssets.length && product?.downloadFileId) {
    downloadAssets.push({
      id: undefined,
      mediaId: String(product.downloadFileId),
      source: "media",
      url: "",
      label: "",
      variant: "",
      isPrimary: true,
      active: true,
      order: 0,
      kind: "download",
    });
  }

  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    subtitle: product?.subtitle ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "other",
    pricingType: product?.pricingType ?? "paid",
    price: product?.price ? String(product.price) : "",
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
    duration: product?.duration ? String(product.duration) : "1",
    resolution: product?.resolution ?? "1920x1080",
    frameRate: product?.frameRate ? String(product.frameRate) : "30",
    format: product?.format ?? "MOV",
    hasAlpha: product?.hasAlpha ?? true,
    fileSize: toMb(product?.fileSize) || "0",
    order: product?.order !== undefined ? String(product.order) : "0",
    active: product?.active ?? true,
    thumbnailId: product?.thumbnailId ? String(product.thumbnailId) : "",
    previews: normalizeAssets(previewAssets),
    downloads: normalizeAssets(downloadAssets),
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
  };
}

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function EditVfxPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const detail = useQuery(api.vfx.getVfxProduct, id ? { id: id as any } : "skip") as any | undefined;
  const assetList = useQuery(api.vfx.listVfxAssets, id ? { vfxId: id as any } : "skip") as any[] | undefined;
  const updateVfx = useMutation(api.vfx.updateVfxProduct);
  const createMediaLink = useMutation(api.media.createVideo);
  const [submitting, setSubmitting] = useState(false);
  const purchases = useQuery(
    api.purchases.listPurchasesByProduct,
    id ? { productType: "vfx", productId: String(id) } : "skip"
  ) as PurchaseWithCustomer[] | undefined;
  const customers = useQuery(api.customers.listCustomers, { activeOnly: true }) as CustomerMini[] | undefined;

  const grantProduct = useMutation(api.orders.grantProductToCustomer);
  const revokePurchase = useMutation(api.purchases.revokePurchase);

  const [activeTab, setActiveTab] = useState<VfxTab>("info");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [granting, setGranting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const product = detail ?? null;
  const initialValues = useMemo(() => toInitial(product, assetList ?? []), [product, assetList]);

  const customerOptions = useMemo(() => {
    if (!customers) return [] as { id: string; label: string }[];
    return customers
      .slice()
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""))
      .map((c) => ({
        id: String(c._id),
        label: `${c.fullName || c.account} (${c.account})`,
      }));
  }, [customers]);

  const sortedPurchases = useMemo(() => {
    const list = Array.isArray(purchases) ? [...purchases] : [];
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [purchases]);

  useEffect(() => {
    if (!selectedCustomerId && customerOptions.length > 0) {
      setSelectedCustomerId(customerOptions[0].id);
    }
  }, [customerOptions, selectedCustomerId]);

  if (detail === undefined) {
    return <div className="text-sm text-muted-foreground">Đang tải dữ liệu VFX...</div>;
  }

  if (!product) {
    return <div className="text-sm text-muted-foreground">Không tìm thấy VFX.</div>;
  }

  async function handleGrantCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }
    setGranting(true);
    try {
      const result = await grantProduct({
        customerId: selectedCustomerId as Id<"customers">,
        productType: "vfx",
        productId: String(product._id),
      } as any);
      if (result?.ok) {
        toast.success("Đã cấp quyền VFX cho khách hàng");
      } else if (result?.reason === "already_purchased") {
        toast.info("Khách hàng đã có quyền với VFX này");
      } else if (result?.reason === "has_active_order") {
        toast.info("Khách đang có đơn liên quan, không thể thêm mới.");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể thêm khách");
    } finally {
      setGranting(false);
    }
  }

  async function handleRevokePurchase(purchaseId: Id<"customer_purchases">) {
    if (!window.confirm("Gỡ quyền VFX của khách hàng này?")) return;
    setRevokingId(String(purchaseId));
    try {
      await revokePurchase({ purchaseId });
      toast.success("Đã gỡ quyền truy cập");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể gỡ quyền");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleSubmit(values: VfxFormValues) {
    const title = values.title.trim();
    const activePreviews = values.previews.filter((item) => item.active);
    const activeDownloads = values.downloads.filter((item) => item.active);

    if (!title || !values.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ Title và Slug");
      return;
    }

    if (!activePreviews.length || !activeDownloads.length) {
      toast.error("Cần ít nhất 1 preview và 1 file download (đang bật)");
      return;
    }

    setSubmitting(true);
    try {
      const price = values.pricingType === "free" ? 0 : Math.max(0, toNumber(values.price));
      const comparePrice = values.pricingType === "free" ? null : toNumber(values.originalPrice || "", 0) || null;
      const duration = Math.max(0.1, toNumber(values.duration, 1));
      const frameRate = Math.max(1, toNumber(values.frameRate, 30));
      const fileSizeBytes = Math.max(0, toNumber(values.fileSize, 0)) * 1024 * 1024;
      const order = toNumber(values.order, product.order ?? 0);
      const tags = values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      async function ensureMediaId(asset: (typeof values.previews)[number]) {
        if (asset.mediaId) return asset.mediaId as any;
        if (asset.source === "link" && asset.url.trim()) {
          return (await createMediaLink({ externalUrl: asset.url.trim(), title: title || undefined })) as any;
        }
        throw new Error("Thiếu media cho asset");
      }

      const allAssets = [...values.previews, ...values.downloads];
      const assetsPayload = [] as any[];
      for (const asset of allAssets) {
        const mediaId = await ensureMediaId(asset);
        assetsPayload.push({
          id: asset.id ? (asset.id as any) : undefined,
          mediaId,
          kind: asset.kind,
          label: asset.label?.trim() || undefined,
          variant: asset.variant?.trim() || undefined,
          isPrimary: Boolean(asset.isPrimary),
          active: asset.active,
          order: asset.order,
        });
      }

      await updateVfx({
        id: product._id as any,
        title,
        slug: values.slug.trim().toLowerCase(),
        subtitle: values.subtitle.trim() || null,
        description: values.description.trim() || null,
        category: values.category as any,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : null,
        pricingType: values.pricingType,
        priceAmount: price,
        comparePriceAmount: comparePrice,
        duration,
        resolution: values.resolution.trim() || "1920x1080",
        frameRate,
        format: values.format.trim() || "MOV",
        hasAlpha: values.hasAlpha,
        fileSize: fileSizeBytes,
        tags,
        order,
        active: values.active,
        assets: assetsPayload,
      } as any);

      toast.success("Đã cập nhật VFX");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật VFX");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chỉnh sửa VFX</h1>
        <p className="text-sm text-muted-foreground">Cập nhật thông tin, media và thông số kỹ thuật của hiệu ứng.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VFX_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[140px] rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-muted ${
                isActive ? "bg-background text-foreground shadow" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "info" && (
        <Card>
          <CardHeader>
            <CardTitle>{product.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <VfxForm
              initialValues={initialValues}
              submitting={submitting}
              submitLabel="Lưu thay đổi"
              onSubmit={handleSubmit}
              onCancel={() => router.push("/dashboard/vfx")}
              mode="edit"
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "customers" && (
        <Card>
          <CardHeader>
            <CardTitle>Khách hàng đã mua</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleGrantCustomer}>
              <div className="sm:flex-1">
                <label className="text-sm font-medium">Khách hàng</label>
                {customers === undefined ? (
                  <div className="text-xs text-muted-foreground">Đang tải danh sách khách hàng...</div>
                ) : customerOptions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Chưa có khách hàng nào.</div>
                ) : (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedCustomerId}
                    onChange={(event) => setSelectedCustomerId(event.target.value)}
                  >
                    {customerOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end sm:block">
                <Button type="submit" disabled={granting || customerOptions.length === 0}>
                  {granting ? "Đang thêm..." : "Thêm quyền"}
                </Button>
              </div>
            </form>

            <Separator />

            {purchases === undefined && (
              <div className="text-sm text-muted-foreground">Đang tải danh sách mua...</div>
            )}
            {purchases && sortedPurchases.length === 0 && (
              <div className="text-sm text-muted-foreground">Chưa có khách nào mua VFX này.</div>
            )}
            {sortedPurchases.length > 0 && (
              <div className="space-y-2">
                {sortedPurchases.map((purchase) => {
                  const customer = purchase.customer;
                  return (
                    <div
                      key={String(purchase._id)}
                      className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {customer?.fullName || customer?.account || "Không rõ tên"}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                          {customer?.email && <span>Email: {customer.email}</span>}
                          {customer?.phone && <span>• {customer.phone}</span>}
                          {customer?.account && <span>• TK: {customer.account}</span>}
                        </div>
                        {purchase.orderNumber && (
                          <div className="text-xs text-muted-foreground">
                            Đơn: {purchase.orderNumber} {purchase.orderStatus ? `(${purchase.orderStatus})` : ""}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokePurchase(purchase._id)}
                          disabled={revokingId === String(purchase._id)}
                        >
                          {revokingId === String(purchase._id) ? "Đang gỡ..." : "Gỡ quyền"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
