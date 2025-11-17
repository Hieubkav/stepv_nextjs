"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/.source";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Copy } from "lucide-react";

export default function CouponsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | null>(true);

  // Queries
  const coupons = useQuery(api.coupons.listCoupons, {
    active: filterActive,
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý Mã Giảm Giá</h1>
        <CreateCouponDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filterActive === null ? "default" : "outline"}
          onClick={() => setFilterActive(null)}
        >
          Tất cả ({coupons?.length || 0})
        </Button>
        <Button
          variant={filterActive === true ? "default" : "outline"}
          onClick={() => setFilterActive(true)}
        >
          Hoạt động ({coupons?.filter((c) => c.active).length || 0})
        </Button>
        <Button
          variant={filterActive === false ? "default" : "outline"}
          onClick={() => setFilterActive(false)}
        >
          Bị vô hiệu hóa ({coupons?.filter((c) => !c.active).length || 0})
        </Button>
      </div>

      {/* Coupons List */}
      {!coupons ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Chưa có mã giảm giá nào
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo mã giảm giá đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <CouponCard key={coupon._id} coupon={coupon} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateCouponDialog({ open, onOpenChange }: CreateCouponDialogProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    "percent"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [appliesTo, setAppliesTo] = useState<"all_courses" | "specific_courses">(
    "all_courses"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCouponMutation = useMutation(api.coupons.createCoupon);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !discountValue) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền tất cả thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCouponMutation({
        code: code.toUpperCase(),
        description: description || undefined,
        discountPercent: discountType === "percent" ? parseInt(discountValue) : undefined,
        discountFixed:
          discountType === "fixed" ? parseInt(discountValue) : undefined,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        minAmount: minAmount ? parseInt(minAmount) : undefined,
        appliesTo,
        expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
      });

      toast({
        title: "Thành công",
        description: "Mã giảm giá đã tạo",
      });

      // Reset form
      setCode("");
      setDescription("");
      setDiscountValue("");
      setMaxUses("");
      setMinAmount("");
      setExpiresAt("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Mã Giảm Giá
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo Mã Giảm Giá Mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã Code</label>
            <Input
              placeholder="VD: SUMMER2024"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={20}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <Textarea
              placeholder="VD: Giảm giá mùa hè cho tất cả khóa học"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Loại Giảm Giá
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="percent"
                  checked={discountType === "percent"}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                />
                <span>Phần trăm (%)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="fixed"
                  checked={discountType === "fixed"}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                />
                <span>Cố định (VND)</span>
              </label>
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá Trị Giảm
            </label>
            <Input
              type="number"
              placeholder={
                discountType === "percent"
                  ? "VD: 20 (20%)"
                  : "VD: 100000 (100.000 VND)"
              }
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Số Lần Sử Dụng (không giới hạn nếu trống)
            </label>
            <Input
              type="number"
              placeholder="VD: 100"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá Trị Đơn Hàng Tối Thiểu (VND)
            </label>
            <Input
              type="number"
              placeholder="VD: 500000"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Hết Hạn (không có hạn nếu trống)
            </label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo Mã"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CouponCardProps {
  coupon: any;
}

function CouponCard({ coupon }: CouponCardProps) {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast({
      title: "Thành công",
      description: "Mã giảm giá đã sao chép",
    });
  };

  const discountDisplay =
    coupon.discountPercent !== undefined
      ? `${coupon.discountPercent}%`
      : `${coupon.discountFixed?.toLocaleString()} VND`;

  const expiresAtDisplay = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN")
    : "Không giới hạn";

  const usageDisplay = coupon.maxUses
    ? `${coupon.usedCount}/${coupon.maxUses}`
    : `${coupon.usedCount}`;

  return (
    <div
      className={`border rounded-lg p-4 ${
        coupon.active
          ? "border-gray-200 dark:border-gray-800"
          : "border-gray-300 dark:border-gray-700 opacity-70"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Code */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mã</p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded font-mono font-semibold">
              {coupon.code}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopyCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Discount & Usage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Giảm Giá
            </p>
            <p className="font-semibold text-lg">{discountDisplay}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Sử Dụng
            </p>
            <p className="font-semibold text-lg">{usageDisplay}</p>
          </div>
        </div>

        {/* Details */}
        <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
          <p>Hết hạn: {expiresAtDisplay}</p>
          <p>Trạng thái: {coupon.active ? "✅ Hoạt động" : "❌ Bị vô hiệu"}</p>
          {coupon.description && <p>Mô tả: {coupon.description}</p>}
        </div>
      </div>
    </div>
  );
}
