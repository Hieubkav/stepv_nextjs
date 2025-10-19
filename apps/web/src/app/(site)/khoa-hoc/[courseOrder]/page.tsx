import type { ReactNode } from "react";
import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@dohy/backend/convex/_generated/api";

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
      console.error("Khong the tai chi tiet khoa hoc", error);
      detailError = error instanceof Error ? error.message : "UNKNOWN_DETAIL_ERROR";
    }

    base.debug.reason = detailError;

    if (!detail) {
      return {
        ...base,
        status: "detail_missing",
        course: normalizedCourse,
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
        console.warn("Khong the tai thumbnail khoa hoc", mediaError);
      }
    }

    return {
      status: "ready",
      message: "",
      course: normalizedCourse,
      chapters,
      thumbnail,
      totals,
      debug: {
        reason: detailError,
        convexUrl,
        matchedCourse: base.debug.matchedCourse,
        availableOrders: base.debug.availableOrders,
      },
    };
  } catch (error) {
    console.error("Khong the tai danh sach khoa hoc", error);
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

function PageShell({
  children,
  containerClassName,
}: {
  children: ReactNode;
  containerClassName?: string;
}) {
  const container = `relative mx-auto ${containerClassName ?? "max-w-[1200px] px-5 pb-20 pt-24 md:pt-32"}`;
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070f] text-white">
      <div className="pointer-events-none absolute left-[-18%] top-[-28%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,_rgba(245,197,66,0.22)_0%,_transparent_72%)]" />
      <div className="pointer-events-none absolute right-[-22%] top-[-24%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.15)_0%,_transparent_75%)]" />
      <div className="pointer-events-none absolute left-[10%] bottom-[-32%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.1)_0%,_transparent_78%)]" />
      <div className={container}>{children}</div>
    </main>
  );
}

function ErrorState({
  title,
  description,
  debug,
}: {
  title: string;
  description: string;
  debug?: CourseDetailPageData["debug"];
}) {
  return (
    <PageShell containerClassName="max-w-3xl px-5 pb-20 pt-24 md:pt-32">
      <div className="space-y-6">
        <Link
          href="/khoa-hoc"
          className="inline-flex items-center text-sm text-white/70 transition hover:text-[#f5c542]"
        >
          <span aria-hidden>&larr;</span>
          <span className="ml-2">Quay lại danh sách khóa học</span>
        </Link>
        <section className="rounded-3xl border border-white/12 bg-[#0a090f]/90 p-6 shadow-[0_14px_45px_rgba(0,0,0,0.45)]">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-3 text-sm text-white/70">{description}</p>
        </section>
        {debug ? (
          <details className="rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-xs text-white/65">
            <summary className="cursor-pointer text-sm font-semibold text-[#f5c542]">
              Hiển thị thông tin debug
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-relaxed text-white/60">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </details>
        ) : null}
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
    return <ErrorState title={title} description={data.message || "Vui lòng thử lại sau."} debug={data.debug} />;
  }

  const { course, chapters, thumbnail, totals } = data;
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
    "Khóa học đang cập nhật phần mô tả chi tiết, vui lòng xem chương trình học bên dưới.";

  return (
    <PageShell>
      <div className="space-y-8">
        <section className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              <Link href="/" className="transition hover:text-[#f5c542]">
                Trang chủ
              </Link>
              <span className="opacity-60">▶︎</span>
              <Link href="/khoa-hoc" className="transition hover:text-[#f5c542]">
                Khóa học
              </Link>
              <span className="opacity-60">▶︎</span>
              <span className="text-white">{course.title}</span>
            </nav>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  {course.title}
                </h1>
                {!course.active ? (
                  <span className="rounded-full border border-amber-400/60 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">
                    Preview
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-white/70 sm:text-base">{heroDescription}</p>
            </div>
          </div>

          <aside className="lg:w-[340px]">
            <div className="sticky top-28 rounded-3xl border border-white/12 bg-[#0a0d16]/90 p-4 shadow-[0_14px_45px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="aspect-video overflow-hidden rounded-xl bg-[#0f111b]">
                {thumbnail?.url ? (
                  <img src={thumbnail.url} alt={thumbnail.title ?? course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.35em] text-white/35">
                    Đang cập nhật ảnh
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-black text-[#f8d37f]">{priceText}</div>
                {comparePriceText ? <div className="text-xs text-white/50 line-through">{comparePriceText}</div> : null}
              </div>

              {course.priceNote && !comparePriceText ? (
                <div className="mt-1 text-xs text-white/55">{course.priceNote}</div>
              ) : null}

              <div className="mt-3">
                <button
                  type="button"
                  className="w-full rounded-lg bg-gradient-to-br from-[#f6e05e] to-[#f0b429] px-3 py-2 font-bold text-[#1b1309] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(240,180,41,0.35)]"
                >
                  Vào học
                </button>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-white/75">
                {features.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-white/12 bg-[#0a090f]/90 px-6 py-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-extrabold">Mô tả</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {course.description
              ? course.description
              : "Nội dung mô tả chi tiết đang được bổ sung. Hãy xem chương trình học để hiểu rõ cấu trúc khóa học."}
          </p>
        </section>

        <section className="rounded-3xl border border-white/12 bg-[#0a090f]/90 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-extrabold">Nội dung khóa học</h2>
            <span className="text-sm text-white/60">{curriculumSummary}</span>
          </div>

          {chapters.length > 0 ? (
            <div className="divide-y divide-white/10" id="curriculum">
              {chapters.map((chapter, index) => (
                <details key={chapter.id} open={index === 0} className="group">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-white/5">
                    <div className="font-semibold">
                      {index + 1}. {chapter.title}
                    </div>
                    <div className="text-sm text-white/60">{chapter.lessons.length} bài</div>
                  </summary>
                  <div className="px-6 pb-4">
                    {chapter.summary ? <p className="mb-3 text-sm text-white/65">{chapter.summary}</p> : null}
                    <ul className="space-y-2 text-sm">
                      {chapter.lessons.length > 0 ? (
                        chapter.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white"
                          >
                            <span className="flex-1 pr-3">{lesson.title}</span>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              {lesson.isPreview ? (
                                <span className="rounded-full border border-[#f5c542]/60 bg-[#f5c542]/10 px-2 py-0.5 font-semibold uppercase tracking-[0.2em] text-[#f9d97b]">
                                  Preview
                                </span>
                              ) : null}
                              <span>{lesson.durationLabel ?? "00:00"}</span>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="rounded-xl border border-dashed border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-white/60">
                          Bài giảng đang được cập nhật cho chương này.
                        </li>
                      )}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="px-6 py-6 text-sm text-white/60">Chương trình học đang được cập nhật. Vui lòng quay lại sau.</div>
          )}

          {chapters.length > 3 ? (
            <button className="w-full px-6 py-4 text-sm text-[#f8d37f] transition hover:text-[#f5c542]">
              Xem thêm chương
            </button>
          ) : null}
        </section>

        <details className="rounded-3xl border border-white/12 bg-white/[0.05] px-6 py-5 text-xs text-white/65">
          <summary className="cursor-pointer text-sm font-semibold text-[#f5c542]">Debug payload</summary>
          <pre className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-relaxed text-white/60">
            {JSON.stringify(
              {
                preview,
                order: numericOrder,
                debug: data.debug,
                totals,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    </PageShell>
  );
}
