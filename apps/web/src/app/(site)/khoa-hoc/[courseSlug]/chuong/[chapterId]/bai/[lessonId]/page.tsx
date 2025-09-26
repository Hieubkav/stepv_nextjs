import { Suspense } from "react";
import { LessonPlayerScreen } from "@/features/learner/pages/lesson-player-screen";

type LessonPageParams = {
  courseSlug: string;
  chapterId: string;
  lessonId: string;
};

type LessonPageProps = {
  params: Promise<LessonPageParams>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, chapterId, lessonId } = await params;

  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Dang tai bai hoc...</div>}>
      <LessonPlayerScreen
        courseSlug={courseSlug}
        chapterId={chapterId}
        lessonId={lessonId}
      />
    </Suspense>
  );
}
