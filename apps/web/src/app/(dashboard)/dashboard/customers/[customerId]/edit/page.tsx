"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "sonner";

import { CustomerForm } from "../../_components/customer-form";
import type { CustomerFormValues } from "../../_components/customer-form";

type CustomerDetail = {
  _id: Id<"customers">;
  account: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  notes?: string;
  order: number;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
};

type PurchaseWithMeta = {
  _id: Id<"customer_purchases">;
  customerId: Id<"customers">;
  orderId: Id<"orders">;
  productType: "course" | "resource" | "vfx";
  productId: string;
  createdAt: number;
  product?: Record<string, any> | null;
  order?: { _id: Id<"orders">; orderNumber?: string | null; status?: string; createdAt: number } | null;
};

type ProductOption = { id: string; label: string; type: "course" | "resource" | "vfx" };

type LessonProgress = {
  lessonId: Id<"course_lessons">;
  title: string;
  chapterTitle: string;
  isCompleted: boolean;
  watchedSeconds: number;
  durationSeconds: number;
};

type CourseProgressEntry = {
  purchaseId: Id<"customer_purchases">;
  courseId: Id<"courses">;
  courseTitle: string;
  progressPercent: number;
  status: string;
  totalWatchSeconds: number;
  bestScore: number | null;
  lessons: LessonProgress[];
  completedLessonIds: Id<"course_lessons">[];
  pendingLessonIds: Id<"course_lessons">[];
  enrolledAt: number;
  updatedAt?: number;
};

const buildInitial = (customer: CustomerDetail): CustomerFormValues => ({
  account: customer.account,
  email: customer.email,
  password: customer.password,
  fullName: customer.fullName,
  phone: customer.phone ?? "",
  notes: customer.notes ?? "",
  active: customer.active,
});

const emptyInitial: CustomerFormValues = {
  account: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  notes: "",
  active: true,
};

export default function CustomerEditPage() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();
  const customerId = params.customerId as Id<"customers">;

  const customer = useQuery(api.customers.getCustomer, { id: customerId }) as CustomerDetail | null | undefined;
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const setActive = useMutation(api.customers.setCustomerActive);
  const purchases = useQuery(api.purchases.getCustomerPurchasesWithMeta, { customerId }) as
    | PurchaseWithMeta[]
    | undefined;
  const courses = useQuery(api.courses.listCourses, { includeInactive: true }) as any[] | undefined;
  const resources = useQuery(api.library.listResources, { activeOnly: false }) as any[] | undefined;
  const vfxList = useQuery(api.vfx.listVfxProducts, { activeOnly: false }) as any[] | undefined;
  const grantProduct = useMutation(api.orders.grantProductToCustomer);
  const revokePurchase = useMutation(api.purchases.revokePurchase);
  const courseProgress = useQuery(api.progress.getCustomerCourseProgress, { customerId }) as
    | CourseProgressEntry[]
    | undefined;

  const [submitting, setSubmitting] = useState(false);
  const [granting, setGranting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"course" | "resource" | "vfx">("course");
  const [selectedProductId, setSelectedProductId] = useState("");

  const initialValues = useMemo(() => {
    if (!customer) return emptyInitial;
    return buildInitial(customer);
  }, [customer]);

  const courseOptions = useMemo(
    () =>
      (courses ?? [])
        .slice()
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        .map((c) => ({ id: String(c._id), label: c.title || c.slug || "Course" })),
    [courses],
  );

  const resourceOptions = useMemo(
    () =>
      (resources ?? [])
        .slice()
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        .map((r) => ({ id: String(r._id), label: r.title || r.slug || "Resource" })),
    [resources],
  );

  const vfxOptions = useMemo(
    () =>
      (vfxList ?? [])
        .slice()
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        .map((vfx) => ({ id: String(vfx._id), label: vfx.title || vfx.slug || "VFX" })),
    [vfxList],
  );

  const currentOptions =
    selectedType === "course" ? courseOptions : selectedType === "resource" ? resourceOptions : vfxOptions;

  useEffect(() => {
    if (currentOptions.length && !selectedProductId) {
      setSelectedProductId(currentOptions[0].id);
    }
  }, [currentOptions, selectedProductId]);

  useEffect(() => {
    if (currentOptions.length && selectedProductId && !currentOptions.find((opt) => opt.id === selectedProductId)) {
      setSelectedProductId(currentOptions[0].id);
    }
  }, [currentOptions, selectedProductId]);

  const sortedPurchases = useMemo(() => {
    const list = Array.isArray(purchases) ? [...purchases] : [];
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [purchases]);

  async function handleSubmit(values: CustomerFormValues) {
    if (!customer) return;
    const account = values.account.trim();
    const email = values.email.trim().toLowerCase();
    const fullName = values.fullName.trim();

    if (!account || !email || !fullName) {
      toast.error("Cần nhập account, email và họ tên");
      return;
    }

    setSubmitting(true);
    try {
      await updateCustomer({
        id: customer._id,
        account,
        email,
        password: values.password.trim() || undefined,
        fullName,
        phone: values.phone.trim() || null,
        notes: values.notes.trim() || null,
        active: values.active,
      });
      toast.success("Đã cập nhật khách hàng");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật khách hàng");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProductId) {
      toast.error("Chọn sản phẩm trước khi thêm");
      return;
    }
    setGranting(true);
    try {
      const result = await grantProduct({
        customerId,
        productType: selectedType,
        productId: selectedProductId,
      } as any);
      if (result?.ok) {
        toast.success("Đã cấp quyền sản phẩm cho khách");
      } else if (result?.reason === "already_purchased") {
        toast.info("Khách đã sở hữu sản phẩm này");
      } else if (result?.reason === "has_active_order") {
        toast.info("Khách đang có đơn liên quan, không thể thêm mới.");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể thêm quyền");
    } finally {
      setGranting(false);
    }
  }

  async function handleRevokePurchase(purchaseId: Id<"customer_purchases">) {
    if (!window.confirm("Gỡ quyền sản phẩm này khỏi khách hàng?")) return;
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

  async function handleToggleActive() {
    if (!customer) return;
    try {
      await setActive({ id: customer._id, active: !customer.active });
      toast.success(customer.active ? "Đã khóa khách hàng" : "Đã mở khách hàng");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("vi-VN");
  }

  if (customer === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải khách hàng...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-sm text-muted-foreground">Không tìm thấy khách hàng.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chỉnh sửa khách hàng</h1>
          <p className="text-sm text-muted-foreground">Cập nhật thông tin đăng nhập và liên hệ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/customers")}>Quay lại</Button>
          <Button variant="secondary" onClick={handleToggleActive}>
            {customer.active ? "Đang hoạt động" : "Đang khóa"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu"
            onSubmit={handleSubmit}
            requirePassword={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quyền sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-[1fr,2fr,auto]" onSubmit={handleAddPurchase}>
            <div>
              <label className="text-sm font-medium">Loại sản phẩm</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedType}
                onChange={(event) => {
                  setSelectedType(event.target.value as "course" | "resource" | "vfx");
                  setSelectedProductId("");
                }}
              >
                <option value="course">Khóa học</option>
                <option value="resource">Thư viện</option>
                <option value="vfx">VFX</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Sản phẩm</label>
              {currentOptions.length === 0 ? (
                <div className="mt-2 text-xs text-muted-foreground">Không có sản phẩm khả dụng.</div>
              ) : (
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                >
                  {currentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={granting || !currentOptions.length}>
                {granting ? "Đang thêm..." : "Thêm quyền"}
              </Button>
            </div>
          </form>

          <Separator />

          {purchases === undefined && (
            <div className="text-sm text-muted-foreground">Đang tải danh sách quyền...</div>
          )}
          {purchases && sortedPurchases.length === 0 && (
            <div className="text-sm text-muted-foreground">Khách chưa sở hữu sản phẩm nào.</div>
          )}
          {sortedPurchases.length > 0 && (
            <div className="space-y-2">
              {sortedPurchases.map((purchase) => {
                const product = (purchase.product as any) ?? {};
                const title =
                  product.title ||
                  product.name ||
                  product.subtitle ||
                  product.slug ||
                  "Sản phẩm";
                const typeLabel =
                  purchase.productType === "course"
                    ? "Khóa học"
                    : purchase.productType === "resource"
                      ? "Thư viện"
                      : "VFX";
                const orderNumber = purchase.order?.orderNumber ?? purchase.orderId;
                return (
                  <div
                    key={String(purchase._id)}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{title}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Đơn: {orderNumber}{" "}
                        {purchase.order?.status ? `(${purchase.order?.status})` : ""}
                      </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Tiến trình học tập (khóa học)</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseProgressSection progresses={courseProgress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Tạo lúc</span>
            <span className="font-medium text-foreground">{formatDate(customer.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cập nhật lần cuối</span>
            <span className="font-medium text-foreground">{formatDate(customer.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Thứ tự (order)</span>
            <span className="font-mono text-foreground">{customer.order}</span>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            Mẹo: dùng reorder ở danh sách để thay đổi thứ tự kéo-thả hiển thị.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseProgressSection({
  progresses,
}: {
  progresses: CourseProgressEntry[] | undefined;
}) {
  if (progresses === undefined) {
    return <div className="text-sm text-muted-foreground">Đang tải tiến trình...</div>;
  }

  if (!progresses.length) {
    return <div className="text-sm text-muted-foreground">Khách chưa đăng ký khóa học nào.</div>;
  }

  return (
    <div className="space-y-3">
      {progresses.map((entry) => (
        <CourseProgressItem key={String(entry.purchaseId)} entry={entry} />
      ))}
    </div>
  );
}

function CourseProgressItem({ entry }: { entry: CourseProgressEntry }) {
  const [open, setOpen] = useState(false);
  const totalLessons = entry.lessons.length || Math.max(entry.completedLessonIds.length, entry.pendingLessonIds.length);
  const completedCount = entry.completedLessonIds.length;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border p-3"
    >
      <CourseProgressSummary
        entry={entry}
        open={open}
        totalLessons={totalLessons}
        completedCount={completedCount}
        onToggle={() => setOpen(!open)}
      />
      <CollapsibleContent className="mt-3 border-t pt-3">
        <CourseProgressLessons entry={entry} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function CourseProgressSummary({
  entry,
  open,
  totalLessons,
  completedCount,
  onToggle,
}: {
  entry: CourseProgressEntry;
  open: boolean;
  totalLessons: number;
  completedCount: number;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{entry.courseTitle}</span>
          <Badge variant={getStatusVariant(entry.status)}>{getStatusLabel(entry.status)}</Badge>
          <Badge variant="outline">
            {completedCount}/{totalLessons || 0} bài
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Tiến độ {entry.progressPercent}%</span>
          <span>Thời gian học {formatDuration(entry.totalWatchSeconds)}</span>
          <span>Điểm {entry.bestScore === null ? "chưa có" : `${entry.bestScore}/100`}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-2 w-32 rounded-full bg-muted sm:block">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${Math.min(entry.progressPercent, 100)}%` }}
          />
        </div>
        <Button variant="ghost" size="sm" type="button" onClick={onToggle} className="gap-2">
          {open ? "Ẩn chi tiết" : "Xem chi tiết"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

function CourseProgressLessons({ entry }: { entry: CourseProgressEntry }) {
  const completedLessons = entry.lessons.filter((lesson) => lesson.isCompleted);
  const pendingLessons = entry.lessons.filter((lesson) => !lesson.isCompleted);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LessonColumn title={`Bài đã hoàn thành (${completedLessons.length})`} lessons={completedLessons} completed />
      <LessonColumn title={`Bài chưa hoàn thành (${pendingLessons.length})`} lessons={pendingLessons} />
    </div>
  );
}

function LessonColumn({
  title,
  lessons,
  completed = false,
}: {
  title: string;
  lessons: LessonProgress[];
  completed?: boolean;
}) {
  const Icon = completed ? CheckCircle2 : Circle;
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      {lessons.length === 0 ? (
        <div className="text-xs text-muted-foreground">Chưa có dữ liệu.</div>
      ) : (
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li
              key={String(lesson.lessonId)}
              className="flex items-start gap-2 rounded-md border px-3 py-2"
            >
              <Icon
                className={`mt-1 h-4 w-4 ${completed ? "text-emerald-500" : "text-muted-foreground"}`}
              />
              <div className="space-y-1">
                <div className="text-sm font-medium">{lesson.title}</div>
                <div className="text-xs text-muted-foreground">
                  {lesson.chapterTitle} • {formatDuration(lesson.watchedSeconds)} / {formatDuration(lesson.durationSeconds)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs ? `${secs}s` : ""}`.trim();
  return `${secs}s`;
}

function getStatusLabel(status: string) {
  if (status === "completed") return "Hoàn thành";
  if (status === "active") return "Đang học";
  if (status === "pending") return "Chờ kích hoạt";
  return status;
}

function getStatusVariant(status: string): "default" | "outline" {
  if (status === "completed") return "default";
  if (status === "active") return "default";
  return "outline";
}
