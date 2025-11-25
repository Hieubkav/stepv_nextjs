"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, LockKeyhole, UserRound } from "lucide-react";

type AdminLoginFormProps = {
  nextPath: Route;
};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const finishLogin = () => {
    router.replace(nextPath);
    router.refresh();
  };

  const submit = async (usernameValue: string, passwordValue: string) => {
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameValue, password: passwordValue }),
      });
      if (response.ok) return finishLogin();
      const payload = await response.json().catch(() => null);
      setError(typeof payload?.error === "string" ? payload.error : "Sai tài khoản hoặc mật khẩu.");
    } catch {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    await submit(trimmedUsername, trimmedPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 shadow-inner">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Đăng nhập quản trị</CardTitle>
          <CardDescription>Nhập thông tin admin được cấu hình trong biến môi trường.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <UserRound className="size-4 text-slate-500" />
                Tài khoản
              </Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <LockKeyhole className="size-4 text-slate-500" />
                Mật khẩu
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Đang kiểm tra..." : "Đăng nhập"}
            </Button>
          </form>

          <Separator />
          <p className="text-xs text-slate-500 text-center">
            Tài khoản & mật khẩu đang được lấy từ <code>.env.local</code> (ADMIN_USERNAME / ADMIN_PASSWORD).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
