import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

import CourseListView, {
  type CourseListItem,
  type CourseListViewProps,
  type CourseThumbnail,
} from "@/features/learner/pages/course-list-view";

export const dynamic = "force-dynamic";

async function loadCourseList(): Promise<CourseListViewProps> {
  const base: CourseListViewProps = {
    courses: [],
    thumbnails: {},
    error: null,
  };

  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Khong tim thay CONVEX_URL de tai danh sach khoa hoc");
    return { ...base, error: "MISSING_CONVEX_URL" };
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const courses = await client.query(api.courses.listCourses, { includeInactive: true });
    const sorted = courses.slice().sort((a, b) => a.order - b.order);

    const normalized: CourseListItem[] = sorted.map((course) => ({
      id: String(course._id),
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? null,
      description: course.description ?? null,
      thumbnailMediaId: course.thumbnailMediaId ? String(course.thumbnailMediaId) : null,
      pricingType: course.pricingType,
      priceAmount: course.priceAmount ?? null,
      priceNote: course.priceNote ?? null,
      isPriceVisible: course.isPriceVisible,
      order: course.order,
      active: course.active,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    const thumbnailIds = normalized
      .map((course) => course.thumbnailMediaId)
      .filter((value): value is string => Boolean(value));

    const thumbnails: Record<string, CourseThumbnail> = {};
    const thumbnailIdSet = new Set(thumbnailIds);

    if (thumbnailIdSet.size > 0) {
      try {
        const media = await client.query(api.media.list, { kind: "image" });
        for (const item of media as Array<{ _id: string; title?: string; url?: string }>) {
          const key = String(item._id);
          if (thumbnailIdSet.has(key)) {
            thumbnails[key] = {
              url: item.url,
              title: item.title,
            };
          }
        }
      } catch (mediaError) {
        console.warn("Khong the tai danh sach media cho thumbnail", mediaError);
      }
    }

    return {
      courses: normalized,
      thumbnails,
      error: null,
    };
  } catch (error) {
    console.error("Khong the tai danh sach khoa hoc", error);
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ...base, error: message };
  }
}

export default async function KhoaHocPage() {
  const data = await loadCourseList();
  return <CourseListView {...data} />;
}
