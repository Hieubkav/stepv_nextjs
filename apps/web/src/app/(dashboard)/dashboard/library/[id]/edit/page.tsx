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
import { ResourceForm } from "../../_components/resource-form";
import type { ResourceFormValues } from "../../_components/resource-form";
import { ResourceImagesManager } from "../../_components/resource-images-manager";

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

type LibraryTab = "info" | "images" | "customers";

const LIBRARY_TABS: { key: LibraryTab; label: string }[] = [
  { key: "info", label: "Thông tin" },
  { key: "images", label: "Ảnh mô tả" },
  { key: "customers", label: "Khách hàng" },
];

function toInitial(resource: any | null): ResourceFormValues {
  return {
    title: resource?.title ?? "",
    slug: resource?.slug ?? "",
    description: resource?.description ?? "",
    pricingType: resource?.pricingType ?? "free",
    price:
      resource?.price !== undefined && resource?.price !== null
        ? String(resource.price)
        : resource?.pricingType === "paid"
          ? ""
          : "0",
    originalPrice:
      resource?.originalPrice !== undefined && resource?.originalPrice !== null
        ? String(resource.originalPrice)
        : "",
    downloadUrl: resource?.downloadUrl ?? "",
    isDownloadVisible: resource?.isDownloadVisible ?? true,
    active: resource?.active ?? true,
    order: String(resource?.order ?? 0),
  };
}

export default function LibraryEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const detail = useQuery(
    api.library.getResourceDetail,
    id ? { id: id as any, includeInactive: true } : "skip"
  ) as { resource: any } | null | undefined;

  const updateResource = useMutation(api.library.updateResource);
  const [submitting, setSubmitting] = useState(false);

  const resource = detail?.resource ?? null;

  const purchases = useQuery(
    api.purchases.listPurchasesByProduct,
    resource
      ? { productType: "resource", productId: String(resource._id) }
      : "skip"
  ) as PurchaseWithCustomer[] | undefined;

  const customers = useQuery(api.customers.listCustomers, { activeOnly: true }) as CustomerMini[] | undefined;

  const grantProduct = useMutation(api.orders.grantProductToCustomer);
  const revokePurchase = useMutation(api.purchases.revokePurchase);

  const [activeTab, setActiveTab] = useState<LibraryTab>("info");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [granting, setGranting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const initialValues = useMemo(() => toInitial(resource), [resource]);

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
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  if (!resource) {
    return <div className="text-sm text-muted-foreground">Không tìm thấy tài nguyên.</div>;
  }

  async function handleGrantCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resource) return;
    if (!selectedCustomerId) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }
    setGranting(true);
    try {
      const result = await grantProduct({
        customerId: selectedCustomerId as Id<"customers">,
        productType: "resource",
        productId: String(resource._id),
      } as any);
      if (result?.ok) {
        toast.success("Đã thêm quyền truy cập cho khách hàng");
      } else if (result?.reason === "already_purchased") {
        toast.info("Khách hàng đã có quyền truy cập tài nguyên này");
      } else if (result?.reason === "has_active_order") {
        toast.info("Khách đang có đơn liên quan, không thể thêm mới.");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể thêm khách hàng");
    } finally {
      setGranting(false);
    }
  }

  async function handleRevokePurchase(purchaseId: Id<"customer_purchases">) {
    if (!window.confirm("Gỡ quyền của khách hàng này?")) return;
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

  async function handleSubmit(values: ResourceFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Cần nhập đầy đủ title và slug");
      return;
    }
    const priceNumber = values.pricingType === "paid" ? Number(values.price) : 0;
    if (values.pricingType === "paid" && (!Number.isFinite(priceNumber) || priceNumber <= 0)) {
      toast.error("Vui lòng nhập giá bán hợp lệ");
      return;
    }
    const rawOriginal = values.pricingType === "paid" && values.originalPrice.trim()
      ? Number(values.originalPrice)
      : null;
    const normalizedOriginal = rawOriginal && rawOriginal > priceNumber ? rawOriginal : null;
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : resource.order;

    setSubmitting(true);
    try {
      await updateResource({
        id: resource._id as any,
        title,
        slug,
        description: values.description.trim() || undefined,
        pricingType: values.pricingType,
        price: priceNumber,
        originalPrice: normalizedOriginal ?? undefined,
        downloadUrl: values.downloadUrl.trim() || undefined,
        isDownloadVisible: values.isDownloadVisible,
        order: parsedOrder,
        active: values.active,
      } as any);
      toast.success("Đã cập nhật tài nguyên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật tài nguyên");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LIBRARY_TABS.map((tab) => {
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
            <CardTitle>Chỉnh sửa tài nguyên</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceForm
              initialValues={initialValues}
              submitting={submitting}
              submitLabel="Lưu"
              onSubmit={handleSubmit}
              onCancel={() => router.push("/dashboard/library")}
              mode="edit"
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "images" && <ResourceImagesManager resourceId={String(resource._id)} />}

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
              <div className="text-sm text-muted-foreground">Chưa có khách nào mua tài nguyên này.</div>
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








