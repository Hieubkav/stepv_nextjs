import { Suspense } from "react";
import { CourseOverviewScreen } from "@/features/learner/pages/course-overview-screen";

export default function KhoaHocPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Dang tai noi dung...</div>}>
      <CourseOverviewScreen />
    </Suspense>
  );
}
