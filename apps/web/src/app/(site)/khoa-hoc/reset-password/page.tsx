'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const resetPassword = useMutation(api.customers.resetPassword);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Đường dẫn không hợp lệ</h1>
          <p className="text-sm text-muted-foreground">
            Thiếu mã token đặt lại mật khẩu. Vui lòng yêu cầu lại.
          </p>
          <Button onClick={() => router.push("/khoa-hoc/forgot-password")} className="w-full">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Mật khẩu không khớp");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải dài hơn 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({ token, newPassword: password });
      if (!result.ok) {
        setError(result.error || "Không thể đặt lại mật khẩu");
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Đặt lại mật khẩu</h1>
          <p className="text-center text-slate-600 mb-6">Nhập mật khẩu mới của bạn</p>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {done ? (
            <div className="space-y-4">
              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertDescription>Đã đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.</AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => router.push("/khoa-hoc/dang-nhap")}>
                Đăng nhập
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Nhập lại mật khẩu</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Xác nhận đặt lại"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
