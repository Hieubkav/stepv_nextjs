import type { ReactNode } from "react";
import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { ArrowLeft } from "lucide-react";

import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseDetailClient } from "./components/course-detail-client";

type PageParams = Promise<{ courseOrder: string }>;
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
  youtubeUrl?: string | null;
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
  if (!course.isPriceVisible) {
    return course.priceNote ? course.priceNote : "Liên hệ";
  }
  if (typeof course.priceAmount === "number" && Number.isFinite(course.priceAmount) && course.priceAmount > 0) {
    return currencyFormatter.format(course.priceAmount);
  }
  return course.priceNote ? course.priceNote : "Liên hệ";
}

function computeComparePrice(course: Pick<CourseSummary, "pricingType" | "priceNote">, main: string) {
  if (course.pricingType !== "paid") return null;
  const note = course.priceNote?.trim();
  if (!note) return null;
  if (!/\d/.test(note)) return null;
  if (note.replace(/\s+/g, "") === main.replace(/\s+/g, "")) return null;
  return note;
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
    youtubeUrl: typeof doc?.youtubeUrl === "string" ? doc.youtubeUrl : null,
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

async function loadCourseDetail(order: number, { preview }: { preview: boolean }): Promise<CourseDetailPageData> {
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
    const list = await client.query(api.courses.listCourses, { includeInactive: true });
    base.debug.availableOrders = list
      .map((item: any) => (Number.isFinite(item?.order) ? Number(item.order) : null))
      .filter((value): value is number => value !== null);

    const matched = list.find((item: any) => item?.order === order) ?? null;
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
        message: "Không tìm thấy khóa học với thứ tự đã yêu cầu.",
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

    let detail: any = null;
    let detailError: string | null = null;

    try {
      detail = await client.query(api.courses.getCourseDetail, {
        id: matched._id,
        includeInactive: preview,
      });
      if (!detail) {
        detailError = "DETAIL_NULL";
      }
    } catch (error) {
      console.error("Không thể tải chi tiết khóa học", error);
      detailError = error instanceof Error ? error.message : "UNKNOWN_DETAIL_ERROR";
    }

    base.debug.reason = detailError;

    if (!detail) {
      return {
        ...base,
        status: "detail_missing",
        course: normalizedCourse,
        introVideoUrl: typeof matched?.introVideoUrl === "string" ? matched.introVideoUrl : null,
        message: "Chưa có dữ liệu chi tiết cho khóa học này.",
      };
    }

    const chapters: CourseChapter[] = [];
    for (const chapter of Array.isArray(detail.chapters) ? detail.chapters : []) {
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

      chapters.push({
        id: String(chapter?._id ?? ""),
        title: typeof chapter?.title === "string" ? chapter.title : "Chương học",
        summary: typeof chapter?.summary === "string" ? chapter.summary : null,
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
        reason: detailError,
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
  return <div className="min-h-screen bg-muted/20 text-foreground">{children}</div>;
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



export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams?: SearchParams;
}) {
  const { courseOrder } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const previewRaw = resolvedSearch?.preview;
  const preview = Array.isArray(previewRaw)
    ? previewRaw.some((value) => parsePreviewFlag(value))
    : parsePreviewFlag(previewRaw);

  const numericOrder = Number(courseOrder);
  if (!Number.isFinite(numericOrder)) {
    return (
      <ErrorState
        title="Tham số không hợp lệ"
        description={`Giá trị "${courseOrder}" không phải là số hợp lệ cho Order của khóa học.`}
      />
    );
  }

  const data = await loadCourseDetail(numericOrder, { preview });
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

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 pt-0">
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
          />
        </div>
      </main>
    </PageShell>
  );
}
