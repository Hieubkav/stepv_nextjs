import { Suspense } from "react";
import { CourseDetailScreen } from "@/features/learner/pages/course-detail-screen";

type CourseDetailPageParams = {
  courseSlug: string;
};

type CourseDetailPageProps = {
  params: Promise<CourseDetailPageParams>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseSlug } = await params;

  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Dang tai khoa hoc...</div>}>
      <CourseDetailScreen courseSlug={courseSlug} />
    </Suspense>
  );
}
