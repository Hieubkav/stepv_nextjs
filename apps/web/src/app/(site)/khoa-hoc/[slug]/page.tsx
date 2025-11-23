import type { Metadata, ResolvingMetadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { ArrowLeft } from "lucide-react";

import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseDetailClient } from "./components/course-detail-client";
import { generateCanonicalUrl, truncateDescription } from "@/lib/seo/metadata";
import { createCourseSchema, createBreadcrumbSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

type PageParams = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CourseSummary = {
  id: string;
  order: number;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  pricingType: "free" | "paid";
  priceAmount: number | null;
  comparePriceAmount: number | null;
  priceNote: string | null;
  isPriceVisible: boolean;
  active: boolean;
};

type CourseLesson = {
  id: string;
  title: string;
  description: string | null;
  durationSeconds: number | null;
  durationLabel: string | null;
  isPreview: boolean;
  active: boolean;
  order: number;
  videoType?: "youtube" | "drive" | "none";
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  exerciseLink?: string | null;
};

type CourseChapter = {
  id: string;
  title: string;
  summary: string | null;
  order: number;
  active: boolean;
  lessons: CourseLesson[];
};

type ThumbnailInfo = {
  url?: string;
  title?: string | null;
};

type CourseDetailPageData = {
  status: "ready" | "missing_env" | "not_found" | "inactive" | "detail_missing" | "error";
  message: string;
  course: CourseSummary | null;
  chapters: CourseChapter[];
  thumbnail: ThumbnailInfo | null;
  introVideoUrl: string | null;
  totals: {
    chapters: number;
    lessons: number;
    durationSeconds: number;
    previewLessons: number;
    activeLessons: number;
  };
  debug: {
    reason: string | null;
    convexUrl: string | null;
    matchedCourse: {
      id: string;
      order: number | null;
      active: boolean;
      title: string | null;
    } | null;
    availableOrders: number[];
  };
};

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatPrice(
  course: Pick<CourseSummary, "pricingType" | "priceAmount" | "priceNote" | "isPriceVisible">,
) {
  if (course.pricingType === "free") {
    return "Miễn phí";
  }
  if (typeof course.priceAmount === "number" && Number.isFinite(course.priceAmount) && course.priceAmount > 0) {
    return currencyFormatter.format(course.priceAmount);
  }
  if (!course.isPriceVisible) {
    return "Liên hệ";
  }
  return "Liên hệ";
}

function computeComparePrice(course: Pick<CourseSummary, "pricingType" | "comparePriceAmount">, main: string) {
  if (course.pricingType !== "paid") return null;
  if (typeof course.comparePriceAmount !== "number" || !Number.isFinite(course.comparePriceAmount) || course.comparePriceAmount <= 0) {
    return null;
  }
  if (course.comparePriceAmount.toString().replace(/\s+/g, "") === main.replace(/\s+/g, "")) return null;
  return currencyFormatter.format(course.comparePriceAmount);
}

function normalizeCourseDoc(doc: any): CourseSummary {
  return {
    id: String(doc?._id ?? ""),
    order: Number.isFinite(doc?.order) ? Number(doc.order) : 0,
    title: typeof doc?.title === "string" ? doc.title : "Khóa học",
    slug: typeof doc?.slug === "string" ? doc.slug : "",
    subtitle: typeof doc?.subtitle === "string" ? doc.subtitle : null,
    description: typeof doc?.description === "string" ? doc.description : null,
    pricingType: doc?.pricingType === "paid" ? "paid" : "free",
    priceAmount: typeof doc?.priceAmount === "number" ? doc.priceAmount : null,
    comparePriceAmount: typeof doc?.comparePriceAmount === "number" ? doc.comparePriceAmount : null,
    priceNote: typeof doc?.priceNote === "string" ? doc.priceNote : null,
    isPriceVisible: Boolean(doc?.isPriceVisible),
    active: Boolean(doc?.active),
  };
}

function normalizeLessonDoc(doc: any): CourseLesson {
  const rawDuration = typeof doc?.durationSeconds === "number" ? doc.durationSeconds : null;
  const durationSeconds =
    rawDuration !== null && Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration) : null;
  return {
    id: String(doc?._id ?? ""),
    title: typeof doc?.title === "string" ? doc.title : "Bài học",
    description: typeof doc?.description === "string" ? doc.description : null,
    durationSeconds,
    durationLabel: formatLessonDuration(durationSeconds),
    isPreview: Boolean(doc?.isPreview),
    active: Boolean(doc?.active),
    order: Number.isFinite(doc?.order) ? Number(doc.order) : Number.MAX_SAFE_INTEGER,
    videoType: doc?.videoType ?? "youtube",
    videoUrl: typeof doc?.videoUrl === "string" ? doc.videoUrl : null,
    youtubeUrl: typeof doc?.youtubeUrl === "string" ? doc.youtubeUrl : null,
    exerciseLink: typeof doc?.exerciseLink === "string" ? doc.exerciseLink : null,
  };
}

function formatLessonDuration(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  const total = Math.max(1, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function formatTotalDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "Thời lượng đang cập nhật";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    if (minutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${minutes} phút`;
  }
  if (minutes > 0) {
    return `${minutes} phút`;
  }
  const seconds = totalSeconds % 60;
  return `${seconds} giây`;
}

function parsePreviewFlag(value: string | undefined) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "preview";
}

function createBaseData(): CourseDetailPageData {
  return {
    status: "error",
    message: "",
    course: null,
    chapters: [],
    thumbnail: null,
    introVideoUrl: null,
    totals: {
      chapters: 0,
      lessons: 0,
      durationSeconds: 0,
      previewLessons: 0,
      activeLessons: 0,
    },
    debug: {
      reason: null,
      convexUrl: process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? null,
      matchedCourse: null,
      availableOrders: [],
    },
  };
}

async function loadCourseDetail(slug: string, { preview }: { preview: boolean }): Promise<CourseDetailPageData> {
  const base = createBaseData();
  const convexUrl = base.debug.convexUrl;
  if (!convexUrl) {
    return {
      ...base,
      status: "missing_env",
      message: "Thiếu biến môi trường CONVEX_URL nên không thể tải dữ liệu khóa học.",
    };
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const result = await client.query(api.courses.getCourseDetail, {
      slug,
      includeInactive: true,
    });

    const matched = result?.course;
    base.debug.matchedCourse = matched
      ? {
          id: String(matched._id ?? ""),
          order: Number.isFinite(matched.order) ? Number(matched.order) : null,
          active: Boolean(matched.active),
          title: typeof matched.title === "string" ? matched.title : null,
        }
      : null;

    if (!matched) {
      return {
        ...base,
        status: "not_found",
        message: "Không tìm thấy khóa học với slug đã yêu cầu.",
      };
    }

    const normalizedCourse = normalizeCourseDoc(matched);

    if (!preview && !normalizedCourse.active) {
      return {
        ...base,
        status: "inactive",
        course: normalizedCourse,
        introVideoUrl: typeof matched?.introVideoUrl === "string" ? matched.introVideoUrl : null,
        message: "Khóa học này đang được ẩn. Hãy quay lại sau hoặc mở chế độ preview để xem nội dung.",
      };
    }

    const chapters: CourseChapter[] = [];
    const detailChapters = result?.chapters ?? [];
    
    for (const chapter of Array.isArray(detailChapters) ? detailChapters : []) {
      const chapterActive = Boolean(chapter?.active);
      if (!preview && !chapterActive) {
        continue;
      }

      const lessons: CourseLesson[] = [];
      for (const lesson of Array.isArray(chapter?.lessons) ? chapter.lessons : []) {
        const lessonActive = Boolean(lesson?.active);
        if (!preview && !lessonActive) {
          continue;
        }
        lessons.push(normalizeLessonDoc(lesson));
      }

      lessons.sort((a, b) => a.order - b.order);

      const chapterData = chapter as any;
      chapters.push({
        id: String(chapter?._id ?? ""),
        title: typeof chapterData?.title === "string" ? chapterData.title : "Chương học",
        summary: typeof chapterData?.summary === "string" ? chapterData.summary : null,
        order: Number.isFinite(chapter?.order) ? Number(chapter.order) : Number.MAX_SAFE_INTEGER,
        active: chapterActive,
        lessons,
      });
    }

    chapters.sort((a, b) => a.order - b.order);

    const totals = chapters.reduce(
      (acc, chapter) => {
        acc.chapters += 1;
        acc.lessons += chapter.lessons.length;
        for (const lesson of chapter.lessons) {
          if (typeof lesson.durationSeconds === "number") {
            acc.durationSeconds += lesson.durationSeconds;
          }
          if (lesson.isPreview) {
            acc.previewLessons += 1;
          }
          if (lesson.active) {
            acc.activeLessons += 1;
          }
        }
        return acc;
      },
      {
        chapters: 0,
        lessons: 0,
        durationSeconds: 0,
        previewLessons: 0,
        activeLessons: 0,
      },
    );

    let thumbnail: ThumbnailInfo | null = null;
    const thumbnailId = matched?.thumbnailMediaId ? String(matched.thumbnailMediaId) : null;
    if (thumbnailId) {
      try {
        const mediaList = (await client.query(api.media.list, { kind: "image" })) as Array<{
          _id?: unknown;
          title?: string | null;
          url?: string | null;
        }>;
        const media = mediaList.find((item) => String(item?._id ?? "") === thumbnailId);
        if (media) {
          thumbnail = {
            url: typeof media?.url === "string" ? media.url : undefined,
            title: typeof media?.title === "string" ? media.title : null,
          };
        }
      } catch (mediaError) {
        console.warn("Không thể tải thumbnail khóa học", mediaError);
      }
    }

    const introVideoUrl = typeof matched?.introVideoUrl === "string" ? matched.introVideoUrl : null;

    return {
      status: "ready",
      message: "",
      course: normalizedCourse,
      chapters,
      thumbnail,
      introVideoUrl,
      totals,
      debug: {
        reason: null,
        convexUrl,
        matchedCourse: base.debug.matchedCourse,
        availableOrders: base.debug.availableOrders,
      },
    };
  } catch (error) {
    console.error("Không thể tải danh sách khóa học", error);
    return {
      ...base,
      status: "error",
      message: error instanceof Error ? error.message : "Không thể tải dữ liệu khóa học.",
    };
  }
}

function buildFeatureLines(data: CourseDetailPageData) {
  const lines: string[] = ["Truy cập trọn đời"];
  const totalDurationText = formatTotalDuration(data.totals.durationSeconds);
  if (data.totals.durationSeconds > 0) {
    lines.push(`${totalDurationText} video theo yêu cầu`);
  } else {
    lines.push("Thời lượng đang cập nhật");
  }
  lines.push(`${data.totals.chapters} chương · ${data.totals.lessons} bài học`);
  if (data.totals.previewLessons > 0) {
    lines.push(`${data.totals.previewLessons} bài học xem thử`);
  } else {
    lines.push("Chứng chỉ hoàn thành");
  }
  return lines;
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      {children}
    </div>
  );
}

function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <PageShell>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Course</p>
          <h1 className="text-lg font-semibold leading-tight text-balance">Chi tiết khóa học</h1>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}



export async function generateMetadata(
  { params }: { params: PageParams },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return {
      title: "Khóa học | DOHY Media",
      description: "Chi tiết khóa học từ DOHY Media",
    };
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const result = await client.query(api.courses.getCourseDetail, {
      slug,
      includeInactive: true,
    });

    const course = result?.course;
    if (!course || !course.active) {
      return {
        title: "Khóa học | DOHY Media",
        description: "Chi tiết khóa học từ DOHY Media",
      };
    }

    const url = generateCanonicalUrl(`/khoa-hoc/${slug}`);
    const title = `${course.title} | DOHY Media`;
    const description = truncateDescription(
      course.description || course.subtitle || "Khóa học từ DOHY Media",
    );

    return {
      title,
      description,
      keywords: [course.title, "khóa học", "3D", "design"],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for course:", slug, error);
    return {
      title: "Khóa học | DOHY Media",
      description: "Chi tiết khóa học từ DOHY Media",
    };
  }
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams?: SearchParams;
}) {
  const { slug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const previewRaw = resolvedSearch?.preview;
  const preview = Array.isArray(previewRaw)
    ? previewRaw.some((value) => parsePreviewFlag(value))
    : parsePreviewFlag(previewRaw);

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    return (
      <ErrorState
        title="Tham số không hợp lệ"
        description="Slug khóa học không được cung cấp hoặc không hợp lệ."
      />
    );
  }

  const data = await loadCourseDetail(slug, { preview });
  if (data.status !== "ready" || !data.course) {
    const errorTitleMap: Record<CourseDetailPageData["status"], string> = {
      ready: "",
      missing_env: "Thiếu cấu hình Convex",
      not_found: "Không tìm thấy khóa học",
      inactive: "Khóa học đang bị ẩn",
      detail_missing: "Chưa có nội dung chi tiết",
      error: "Đã xảy ra lỗi",
    };
    const title = errorTitleMap[data.status] || "Không thể tải khóa học";
    return <ErrorState title={title} description={data.message || "Vui lòng thử lại sau."} />;
  }

  const { course, chapters, thumbnail, totals, introVideoUrl } = data;
  const priceText = formatPrice(course);
  const comparePriceText = computeComparePrice(course, priceText);
  const features = buildFeatureLines(data);
  const totalDurationText = totals.durationSeconds > 0 ? formatTotalDuration(totals.durationSeconds) : null;
  const curriculumSummaryParts = [`${totals.chapters} chương`, `${totals.lessons} bài giảng`, totalDurationText].filter(
    Boolean,
  );
  const curriculumSummary = curriculumSummaryParts.join(" · ");

  const heroDescription =
    course.subtitle ??
    course.description ??
    "Khóa học đang cập nhật phần mở từ chi tiết, vui lòng xem chương trình học bên dưới.";
  const heroStats = [
    { label: "Chương học", value: `${totals.chapters}` },
    { label: "Bài giảng", value: `${totals.lessons}` },
    { label: "Thời lượng", value: totalDurationText ?? "Đang cập nhật" },
  ];

  const descriptionBody = course.description ?? heroDescription;

  const badges = [
    course.pricingType === "free" ? "Miễn phí" : "Trả phí",
    `${totals.chapters} chương`,
    `${totals.lessons} bài học`,
  ];
  if (totals.previewLessons > 0) {
    badges.push(`${totals.previewLessons} bài xem thử`);
  }

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", url: generateCanonicalUrl("/") },
    { name: "Khóa học", url: generateCanonicalUrl("/khoa-hoc") },
    { name: course.title, url: generateCanonicalUrl(`/khoa-hoc/${course.slug}`) },
  ]);

  const courseSchema = createCourseSchema({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    subtitle: course.subtitle,
    price: course.priceAmount,
    pricingType: course.pricingType,
    lessonsCount: totals.activeLessons,
    durationSeconds: totals.durationSeconds,
  });

  return (
    <PageShell>
      <JsonLd data={[breadcrumbSchema, courseSchema]} />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-32 lg:pt-36 lg:pb-14">
        <Button variant="outline" size="sm" className="gap-2 mb-8" asChild>
          <Link href="/khoa-hoc">
            <ArrowLeft className="h-4 w-4" />
            Tất cả khóa học
          </Link>
        </Button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <CourseDetailClient
            course={course}
            chapters={chapters}
            thumbnail={thumbnail}
            introVideoUrl={introVideoUrl}
            totalDurationText={totalDurationText}
            priceText={priceText}
            comparePriceText={comparePriceText}
            descriptionBody={descriptionBody}
            heroStats={heroStats}
            features={features}
            curriculumSummary={curriculumSummary}
            badges={badges}
            heroDescription={heroDescription}
            courseId={course.id}
          />
        </div>
      </main>
    </PageShell>
  );
}
