import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Doc } from "@dohy/backend/convex/_generated/dataModel";

import CourseListView, {
  type CourseListItem,
  type CourseListViewProps,
  type CourseThumbnail,
  type SoftwareItem,
} from "@/features/learner/pages/course-list-view";
import { normalizeSlug } from "@/lib/slug";
import { createMetadata } from "@/lib/seo/metadata";
import { generateCanonicalUrl } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Khóa học trực tuyến | DOHY Media",
  description: "Khám phá các khóa học trực tuyến về hình ảnh 3D, design, và marketing từ các chuyên gia tại DOHY Media.",
  keywords: ["khóa học", "3D", "design", "hình ảnh", "video"],
  url: generateCanonicalUrl("/khoa-hoc"),
});

async function loadCourseList(): Promise<CourseListViewProps> {
  const base: CourseListViewProps = {
    courses: [],
    thumbnails: {},
    softwares: [],
    softwareIcons: {},
    error: null,
  };

  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Không tìm thấy CONVEX_URL để tải danh sách khóa học");
    return { ...base, error: "MISSING_CONVEX_URL" };
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    
    // Load courses with softwares
    const coursesWithSoftwares = (await client.query(api.courses.listCoursesWithSoftwares, {
      includeInactive: true,
    })) as Array<Doc<"courses"> & { softwares: Doc<"library_softwares">[] }>;
    
    const sorted = coursesWithSoftwares.slice().sort((a, b) => a.order - b.order);

    const normalized: CourseListItem[] = sorted.map((course) => {
      const cleanSlug = normalizeSlug(course.slug || course.title || "");
      return {
        id: String(course._id),
        slug: cleanSlug || course.slug || "",
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
        softwareIds: (course.softwares || []).map((s) => String(s._id)),
      };
    });

    // Load all softwares for filter
    const allSoftwares = (await client.query(api.library.listSoftwares, {
      activeOnly: true,
    })) as Doc<"library_softwares">[];

    const softwareItems: SoftwareItem[] = allSoftwares.map((software) => ({
      id: String(software._id),
      name: software.name,
      slug: software.slug,
      iconImageId: software.iconImageId ? String(software.iconImageId) : null,
    }));

    const thumbnailIds = normalized
      .map((course) => course.thumbnailMediaId)
      .filter((value): value is string => Boolean(value));

    const thumbnails: Record<string, CourseThumbnail> = {};
    const thumbnailIdSet = new Set(thumbnailIds);

    // Load software icons
    const softwareIconIds = softwareItems
      .map((s) => s.iconImageId)
      .filter((value): value is string => Boolean(value));
    const iconIdSet = new Set(softwareIconIds);

    const softwareIcons: Record<string, string> = {};

    if (thumbnailIdSet.size > 0 || iconIdSet.size > 0) {
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
          if (iconIdSet.has(key) && item.url) {
            softwareIcons[key] = item.url;
          }
        }
      } catch (mediaError) {
        console.warn("Không thể tải danh sách media cho thumbnail", mediaError);
      }
    }

    return {
      courses: normalized,
      thumbnails,
      softwares: softwareItems,
      softwareIcons,
      error: null,
    };
  } catch (error) {
    console.error("Không thể tải danh sách khóa học", error);
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ...base, error: message };
  }
}

export default async function KhoaHocPage() {
  const data = await loadCourseList();
  return <CourseListView {...data} />;
}
