import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CourseHeader({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string | null;
}) {
  return (
    <header className="sticky top-0 z-[51] border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/khoa-hoc">
              <ArrowLeft className="h-4 w-4" />
              Tất cả khóa học
            </Link>
          </Button>
          <div className="hidden h-6 w-px bg-border md:block" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Course</p>
            <h1 className="text-lg font-semibold leading-tight text-balance">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="#description">Nội dung</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#curriculum">Lộ trình học</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#support">Hỗ trợ</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
