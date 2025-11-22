'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const requestReset = useMutation(api.customers.requestPasswordReset);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await requestReset({ email });
      if (!result.ok) {
        setError(result.error || "Không tìm thấy email");
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Lấy lại mật khẩu</h1>
          <p className="text-center text-slate-600 mb-6">
            Nhập email tài khoản khách hàng để nhận liên kết đặt lại mật khẩu.
          </p>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {done ? (
            <div className="space-y-4">
              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertDescription>
                  Đã gửi yêu cầu. Kiểm tra hộp thư và làm theo hướng dẫn đặt lại mật khẩu.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => router.push("/khoa-hoc/dang-nhap")}>
                Quay lại đăng nhập
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
