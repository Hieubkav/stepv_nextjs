import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPaymentPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Button variant="outline" size="sm" className="gap-2 mb-4" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Quay lại quản lý
            </Link>
          </Button>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Quản lý
            </p>
            <h1 className="text-lg font-semibold leading-tight">Xác nhận thanh toán</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Thanh toán (MVP)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Hệ thống hiện dùng bản MVP: khi học viên nhấn “Xác nhận đặt khóa”, khóa học được kích hoạt ngay và
              không cần gửi minh chứng hay duyệt tay.
            </p>
            <p>Trang này tạm thời không có tác vụ nào khác.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
