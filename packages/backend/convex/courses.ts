// KISS: Convex functions cho module khoa hoc
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = MutationCtx | QueryCtx;
type CourseId = Id<"courses">;
type ChapterId = Id<"course_chapters">;
type LessonId = Id<"course_lessons">;

type CourseDoc = {
  _id: CourseId;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailMediaId?: Id<"media">;
  introVideoUrl?: string;
  pricingType: "free" | "paid";
  priceAmount?: number;
  priceNote?: string;
  isPriceVisible: boolean;
  active: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
};

type ChapterDoc = {
  _id: ChapterId;
  courseId: CourseId;
  active: boolean;
  order: number;
};

type LessonDoc = {
  _id: LessonId;
  courseId: CourseId;
  chapterId: ChapterId;
  title: string;
  description?: string;
  youtubeUrl: string;
  durationSeconds?: number;
  isPreview?: boolean;
  exerciseLink?: string;
  active: boolean;
  order: number;
};

const normalizeCourseSlug = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  return trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const uniqueSlugCandidates = (slug?: string) => {
  if (!slug) return [] as string[];
  const trimmed = slug.trim();
  if (!trimmed) return [] as string[];
  const normalized = normalizeCourseSlug(trimmed);
  const candidates = new Set<string>();
  candidates.add(trimmed);
  if (normalized) candidates.add(normalized);
  return Array.from(candidates);
};

const findCourseBySlug = async (ctx: AnyCtx, slug: string) => {
  for (const candidate of uniqueSlugCandidates(slug)) {
    const result = await ctx.db
      .query('courses')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .first();
    if (result) {
      return result as CourseDoc;
    }
  }
  return null;
};

type EnrollmentDoc = {
  _id: Id<"course_enrollments">;
  courseId: CourseId;
  userId: string;
  enrolledAt: number;
  progressPercent?: number;
  lastViewedLessonId?: LessonId;
  order: number;
  active: boolean;
};

const assertCourseSlugUnique = async (
  ctx: AnyCtx,
  slug: string,
  excludeId?: CourseId,
) => {
  const existed = await ctx.db
    .query("courses")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existed && (!excludeId || existed._id !== excludeId)) {
    throw new Error("Course slug already exists");
  }
};

const ensureCourse = async (ctx: AnyCtx, id: CourseId) => {
  const course = await ctx.db.get(id);
  if (!course) {
    throw new Error("Course not found");
  }
  return course as CourseDoc;
};

const ensureChapterInCourse = async (
  ctx: AnyCtx,
  chapterId: ChapterId,
  courseId: CourseId,
) => {
  const chapter = await ctx.db.get(chapterId);
  if (!chapter) {
    throw new Error("Chapter not found");
  }
  if ((chapter as ChapterDoc).courseId !== courseId) {
    throw new Error("Chapter does not belong to course");
  }
  return chapter as ChapterDoc;
};

const ensureLessonInCourse = async (
  ctx: AnyCtx,
  lessonId: LessonId,
  courseId: CourseId,
) => {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) {
    throw new Error("Lesson not found");
  }
  if ((lesson as LessonDoc).courseId !== courseId) {
    throw new Error("Lesson does not belong to course");
  }
  return lesson as LessonDoc;
};

const getEnrollmentByCourseAndUser = async (
  ctx: AnyCtx,
  courseId: CourseId,
  userId: string,
) => {
  return await ctx.db
    .query("course_enrollments")
    .withIndex("by_course_user", (q) =>
      q.eq("courseId", courseId).eq("userId", userId),
    )
    .first();
};

const clampProgress = (value?: number) => {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

type CourseChapterWithLessons = ChapterDoc & {
  lessons: LessonDoc[];
};

type CourseStructure = {
  course: CourseDoc;
  chapters: CourseChapterWithLessons[];
  visibleLessons: LessonDoc[];
  lessonLookup: Map<string, LessonDoc>;
};

const collectCourseStructure = async (
  ctx: AnyCtx,
  course: CourseDoc,
  includeInactive: boolean,
): Promise<CourseStructure> => {
  const chapters = (await ctx.db
    .query("course_chapters")
    .withIndex("by_course_order", (q) => q.eq("courseId", course._id))
    .collect()) as ChapterDoc[];

  const lessons = (await ctx.db
    .query("course_lessons")
    .withIndex("by_course_order", (q) => q.eq("courseId", course._id))
    .collect()) as LessonDoc[];

  const lessonLookup = new Map<string, LessonDoc>();
  for (const lesson of lessons) {
    lessonLookup.set(lesson._id as string, lesson);
  }

  const lessonsByChapter: Record<string, LessonDoc[]> = {};
  for (const lesson of lessons) {
    if (!includeInactive && !lesson.active) continue;
    const key = lesson.chapterId as string;
    if (!lessonsByChapter[key]) {
      lessonsByChapter[key] = [];
    }
    lessonsByChapter[key].push(lesson);
  }
  Object.values(lessonsByChapter).forEach((items) =>
    items.sort((a, b) => a.order - b.order),
  );

  const filteredChapters = includeInactive
    ? chapters
    : chapters.filter((chapter) => chapter.active);
  filteredChapters.sort((a, b) => a.order - b.order);

  const detail = filteredChapters.map((chapter) => ({
    ...chapter,
    lessons: lessonsByChapter[chapter._id as string] ?? [],
  }));

  const visibleLessons = detail.flatMap((chapter) => chapter.lessons);

  return {
    course,
    chapters: detail,
    visibleLessons,
    lessonLookup,
  };
};

const computeEnrollmentProgress = (
  structure: CourseStructure,
  enrollment: {
    progressPercent?: number;
    lastViewedLessonId?: LessonId;
  },
) => {
  const lessons = structure.visibleLessons;
  const totalLessons = lessons.length;

  let lastLesson: LessonDoc | null = null;
  let lastIndex = -1;
  if (enrollment.lastViewedLessonId) {
    const id = enrollment.lastViewedLessonId as string;
    lastIndex = lessons.findIndex((lesson) => lesson._id === id);
    lastLesson =
      (lastIndex >= 0 ? lessons[lastIndex] : null) ??
      structure.lessonLookup.get(id) ??
      null;
  }

  const completedLessons = lastIndex >= 0 ? lastIndex + 1 : 0;
  const computedPercent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const storedPercent = clampProgress(enrollment.progressPercent);
  const percent =
    storedPercent === undefined
      ? computedPercent
      : Math.max(storedPercent, computedPercent);

  let nextLesson: LessonDoc | null = null;
  if (totalLessons > 0) {
    if (lastIndex >= 0) {
      nextLesson = lastIndex + 1 < totalLessons ? lessons[lastIndex + 1] : null;
    } else {
      nextLesson = lessons[0];
    }
  }

  return {
    totalLessons,
    completedLessons,
    percent,
    lastLesson,
    nextLesson,
  } as const;
};

export const listCourses = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, { includeInactive = false }) => {
    const courses = await ctx.db.query("courses").collect();
    const filtered = includeInactive
      ? courses
      : courses.filter((course) => course.active);
    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  },
});

export const getCourseDetail = query({
  args: {
    id: v.optional(v.id("courses")),
    slug: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, slug, includeInactive = false }) => {
    if (!id && !slug) {
      throw new Error("Provide id or slug");
    }

    let course = null as CourseDoc | null;
    if (id) {
      const found = await ctx.db.get(id);
      course = (found as CourseDoc) ?? null;
    }
    if (!course && slug) {
      course = await findCourseBySlug(ctx, slug);
    }

    if (!course) return null;
    if (!includeInactive && !course.active) return null;

    const structure = await collectCourseStructure(ctx, course, includeInactive);

    return {
      course: structure.course,
      chapters: structure.chapters,
    } as const;
  },
});

export const listLearnerCourses = query({
  args: {
    userId: v.string(),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, includeInactive = false }) => {
    const enrollmentsRaw = await ctx.db
      .query("course_enrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const enrollments = (includeInactive
      ? (enrollmentsRaw as EnrollmentDoc[])
      : (enrollmentsRaw as EnrollmentDoc[]).filter((item) => item.active)) as EnrollmentDoc[];

    enrollments.sort((a, b) => a.order - b.order);

    const results: {
      course: CourseDoc;
      enrollment: EnrollmentDoc;
      progress: {
        totalLessons: number;
        completedLessons: number;
        percent: number;
        lastViewedLessonId: LessonId | null;
      };
      counts: {
        chapters: number;
        lessons: number;
      };
      firstLesson: LessonDoc | null;
      nextLesson: LessonDoc | null;
      lastLesson: LessonDoc | null;
    }[] = [];

    for (const enrollment of enrollments) {
      const courseDoc = await ctx.db.get(enrollment.courseId);
      if (!courseDoc) continue;
      const course = courseDoc as CourseDoc;
      if (!includeInactive && !course.active) continue;

      const structure = await collectCourseStructure(ctx, course, includeInactive);
      const progress = computeEnrollmentProgress(structure, enrollment);

      const firstLesson = structure.visibleLessons[0] ?? null;
      const lastLesson = progress.lastLesson ?? null;
      const nextLesson =
        progress.nextLesson ?? (lastLesson ? null : firstLesson);

      results.push({
        course: structure.course,
        enrollment,
        progress: {
          totalLessons: progress.totalLessons,
          completedLessons: progress.completedLessons,
          percent: progress.percent,
          lastViewedLessonId: enrollment.lastViewedLessonId ?? null,
        },
        counts: {
          chapters: structure.chapters.length,
          lessons: structure.visibleLessons.length,
        },
        firstLesson,
        nextLesson,
        lastLesson,
      });
    }

    return results;
  },
});

export const getLearnerCourseDetail = query({
  args: {
    userId: v.string(),
    slug: v.string(),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, slug, includeInactive = false }) => {
    const courseDoc = await findCourseBySlug(ctx, slug);
    if (!courseDoc) return null;

    const course = courseDoc as CourseDoc;
    if (!includeInactive && !course.active) return null;

    const enrollment = (await getEnrollmentByCourseAndUser(
      ctx,
      course._id,
      userId,
    )) as EnrollmentDoc | null;

    if (!enrollment || (!includeInactive && !enrollment.active)) {
      return null;
    }

    const structure = await collectCourseStructure(ctx, course, includeInactive);
    const progress = computeEnrollmentProgress(structure, enrollment);

    const firstLesson = structure.visibleLessons[0] ?? null;

    return {
      course: structure.course,
      chapters: structure.chapters,
      enrollment,
      progress: {
        totalLessons: progress.totalLessons,
        completedLessons: progress.completedLessons,
        percent: progress.percent,
        lastLesson: progress.lastLesson ?? null,
        nextLesson: progress.nextLesson ?? null,
        firstLesson,
      },
    } as const;
  },
});

export const recordLessonProgress = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
    lessonId: v.id("course_lessons"),
  },
  handler: async (ctx, { courseId, userId, lessonId }) => {
    const enrollment = (await getEnrollmentByCourseAndUser(
      ctx,
      courseId,
      userId,
    )) as EnrollmentDoc | null;
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const course = await ensureCourse(ctx, courseId);
    const lesson = await ensureLessonInCourse(ctx, lessonId, courseId);
    if (!lesson.active) {
      throw new Error("Lesson is inactive");
    }

    const structure = await collectCourseStructure(ctx, course, false);
    const lessons = structure.visibleLessons;
    if (!lessons.length) {
      await ctx.db.patch(enrollment._id, {
        lastViewedLessonId: lessonId,
        progressPercent: 0,
      } as any);
      const updated = (await ctx.db.get(enrollment._id)) as EnrollmentDoc | null;
      return {
        enrollment: updated,
        progress: {
          totalLessons: 0,
          completedLessons: 0,
          percent: 0,
          lastLesson: null,
          nextLesson: null,
        },
      } as const;
    }

    const index = lessons.findIndex((item) => item._id === lessonId);
    if (index === -1) {
      throw new Error("Lesson not accessible");
    }

    const completedLessons = index + 1;
    const totalLessons = lessons.length;
    const percent = Math.min(
      100,
      Math.round((completedLessons / totalLessons) * 100),
    );

    await ctx.db.patch(enrollment._id, {
      lastViewedLessonId: lessonId,
      progressPercent: percent,
    } as any);

    const updated = (await ctx.db.get(enrollment._id)) as EnrollmentDoc | null;
    const nextLesson = index + 1 < lessons.length ? lessons[index + 1] : null;

    return {
      enrollment: updated,
      progress: {
        totalLessons,
        completedLessons,
        percent,
        lastLesson: lessons[index],
        nextLesson,
      },
    } as const;
  },
});
export const createCourse = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnailMediaId: v.optional(v.id("media")),
    introVideoUrl: v.optional(v.string()),
    pricingType: v.union(v.literal("free"), v.literal("paid")),
    priceAmount: v.optional(v.number()),
    priceNote: v.optional(v.string()),
    isPriceVisible: v.boolean(),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await assertCourseSlugUnique(ctx, args.slug);
    const now = Date.now();
    const id = await ctx.db.insert("courses", {
      slug: args.slug,
      title: args.title,
      subtitle: args.subtitle,
      description: args.description,
      thumbnailMediaId: args.thumbnailMediaId,
      introVideoUrl: args.introVideoUrl,
      pricingType: args.pricingType,
      priceAmount: args.priceAmount,
      priceNote: args.priceNote,
      isPriceVisible: args.isPriceVisible,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateCourse = mutation({
  args: {
    id: v.id("courses"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    subtitle: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.union(v.string(), v.null())),
    thumbnailMediaId: v.optional(v.union(v.id("media"), v.null())),
    introVideoUrl: v.optional(v.union(v.string(), v.null())),
    pricingType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    priceAmount: v.optional(v.union(v.number(), v.null())),
    priceNote: v.optional(v.union(v.string(), v.null())),
    isPriceVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, slug, subtitle, description, thumbnailMediaId, introVideoUrl, pricingType, priceAmount, priceNote, isPriceVisible, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Course not found");
    if (slug && slug !== (existing as CourseDoc).slug) {
      await assertCourseSlugUnique(ctx, slug, id);
    }

    const patch: Record<string, unknown> = { ...rest };
    if (slug !== undefined) patch.slug = slug;
    if (subtitle !== undefined) patch.subtitle = subtitle ?? undefined;
    if (description !== undefined) patch.description = description ?? undefined;
    if (thumbnailMediaId !== undefined) {
      patch.thumbnailMediaId = thumbnailMediaId ?? undefined;
    }
    if (introVideoUrl !== undefined) {
      patch.introVideoUrl = introVideoUrl ?? undefined;
    }
    if (pricingType !== undefined) patch.pricingType = pricingType;
    if (priceAmount !== undefined) patch.priceAmount = priceAmount ?? undefined;
    if (priceNote !== undefined) patch.priceNote = priceNote ?? undefined;
    if (isPriceVisible !== undefined) patch.isPriceVisible = isPriceVisible;
    patch.updatedAt = Date.now();

    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const setCourseActive = mutation({
  args: { id: v.id("courses"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const reorderCourses = mutation({
  args: { orderedIds: v.array(v.id("courses")) },
  handler: async (ctx, { orderedIds }) => {
    const now = Date.now();
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { order: i, updatedAt: now });
    }
    const courses = await ctx.db.query("courses").collect();
    courses.sort((a, b) => a.order - b.order);
    return courses;
  },
});


export const deleteCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    const course = await ctx.db.get(id);
    if (!course) {
      return { ok: false } as const;
    }
    const chapters = await ctx.db
      .query("course_chapters")
      .withIndex("by_course_order", (q) => q.eq("courseId", id))
      .collect();
    for (const chapter of chapters) {
      const lessons = await ctx.db
        .query("course_lessons")
        .withIndex("by_chapter_order", (q) => q.eq("chapterId", chapter._id))
        .collect();
      for (const lesson of lessons) {
        await ctx.db.delete(lesson._id);
      }
      await ctx.db.delete(chapter._id);
    }
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", id))
      .collect();
    for (const enrollment of enrollments) {
      await ctx.db.delete(enrollment._id);
    }
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

export const listCourseChapters = query({
  args: {
    courseId: v.id("courses"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { courseId, includeInactive = false }) => {
    await ensureCourse(ctx, courseId);
    const chapters = (await ctx.db
      .query("course_chapters")
      .withIndex("by_course_order", (q) => q.eq("courseId", courseId))
      .collect()) as ChapterDoc[];
    const filtered = includeInactive
      ? chapters
      : chapters.filter((chapter) => chapter.active);
    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  },
});

export const createChapter = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    summary: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ensureCourse(ctx, args.courseId);
    const now = Date.now();
    const id = await ctx.db.insert("course_chapters", {
      courseId: args.courseId,
      title: args.title,
      summary: args.summary,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateChapter = mutation({
  args: {
    id: v.id("course_chapters"),
    title: v.optional(v.string()),
    summary: v.optional(v.union(v.string(), v.null())),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, summary, ...rest }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Chapter not found");
    const patch: Record<string, unknown> = { ...rest };
    if (summary !== undefined) {
      patch.summary = summary ?? undefined;
    }
    patch.updatedAt = Date.now();
    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const setChapterActive = mutation({
  args: { id: v.id("course_chapters"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const reorderChapters = mutation({
  args: { courseId: v.id("courses"), orderedIds: v.array(v.id("course_chapters")) },
  handler: async (ctx, { courseId, orderedIds }) => {
    await ensureCourse(ctx, courseId);
    const now = Date.now();
    for (let i = 0; i < orderedIds.length; i++) {
      const chapter = await ctx.db.get(orderedIds[i]);
      if (!chapter) continue;
      if ((chapter as ChapterDoc).courseId !== courseId) {
        throw new Error("Chapter does not belong to course");
      }
      await ctx.db.patch(orderedIds[i], { order: i, updatedAt: now });
    }
    const chapters = (await ctx.db
      .query("course_chapters")
      .withIndex("by_course_order", (q) => q.eq("courseId", courseId))
      .collect()) as ChapterDoc[];
    chapters.sort((a, b) => a.order - b.order);
    return chapters;
  },
});


export const deleteChapter = mutation({
  args: { id: v.id("course_chapters") },
  handler: async (ctx, { id }) => {
    const chapter = await ctx.db.get(id);
    if (!chapter) {
      return { ok: false } as const;
    }
    const lessons = await ctx.db
      .query("course_lessons")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", id))
      .collect();
    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

export const listChapterLessons = query({
  args: {
    chapterId: v.id("course_chapters"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { chapterId, includeInactive = false }) => {
    const chapter = await ctx.db.get(chapterId);
    if (!chapter) throw new Error("Chapter not found");
    const lessons = (await ctx.db
      .query("course_lessons")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", chapterId))
      .collect()) as LessonDoc[];
    const filtered = includeInactive
      ? lessons
      : lessons.filter((lesson) => lesson.active);
    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  },
});

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    chapterId: v.id("course_chapters"),
    title: v.string(),
    description: v.optional(v.string()),
    youtubeUrl: v.string(),
    durationSeconds: v.optional(v.number()),
    isPreview: v.optional(v.boolean()),
    exerciseLink: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ensureCourse(ctx, args.courseId);
    await ensureChapterInCourse(ctx, args.chapterId, args.courseId);
    const now = Date.now();
    const id = await ctx.db.insert("course_lessons", {
      courseId: args.courseId,
      chapterId: args.chapterId,
      title: args.title,
      description: args.description,
      youtubeUrl: args.youtubeUrl,
      durationSeconds: args.durationSeconds,
      isPreview: args.isPreview ?? false,
      exerciseLink: args.exerciseLink,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateLesson = mutation({
  args: {
    id: v.id("course_lessons"),
    chapterId: v.optional(v.id("course_chapters")),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    youtubeUrl: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    isPreview: v.optional(v.boolean()),
    exerciseLink: v.optional(v.union(v.string(), v.null())),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, chapterId, description, exerciseLink, ...rest }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Lesson not found");
    const patch: Record<string, unknown> = { ...rest };

    if (chapterId !== undefined) {
      const chapter = await ctx.db.get(chapterId);
      if (!chapter) throw new Error("Chapter not found");
      patch.chapterId = chapterId;
      patch.courseId = (chapter as ChapterDoc).courseId;
    }

    if (description !== undefined) {
      patch.description = description ?? undefined;
    }
    if (exerciseLink !== undefined) {
      patch.exerciseLink = exerciseLink ?? undefined;
    }

    patch.updatedAt = Date.now();
    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const setLessonActive = mutation({
  args: { id: v.id("course_lessons"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const reorderLessons = mutation({
  args: {
    chapterId: v.id("course_chapters"),
    orderedIds: v.array(v.id("course_lessons")),
  },
  handler: async (ctx, { chapterId, orderedIds }) => {
    const chapter = await ctx.db.get(chapterId);
    if (!chapter) throw new Error("Chapter not found");
    const now = Date.now();
    for (let i = 0; i < orderedIds.length; i++) {
      const lesson = await ctx.db.get(orderedIds[i]);
      if (!lesson) continue;
      if ((lesson as LessonDoc).chapterId !== chapterId) {
        throw new Error("Lesson does not belong to chapter");
      }
      await ctx.db.patch(orderedIds[i], { order: i, updatedAt: now });
    }
    const lessons = (await ctx.db
      .query("course_lessons")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", chapterId))
      .collect()) as LessonDoc[];
    lessons.sort((a, b) => a.order - b.order);
    return lessons;
  },
});


export const deleteLesson = mutation({
  args: { id: v.id("course_lessons") },
  handler: async (ctx, { id }) => {
    const lesson = await ctx.db.get(id);
    if (!lesson) {
      return { ok: false } as const;
    }
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

export const listEnrollmentsByCourse = query({
  args: {
    courseId: v.id("courses"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { courseId, includeInactive = false }) => {
    await ensureCourse(ctx, courseId);
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    const filtered = includeInactive
      ? enrollments
      : enrollments.filter((item) => item.active);
    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  },
});

export const listEnrollmentsByUser = query({
  args: {
    userId: v.string(),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, includeInactive = false }) => {
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const filtered = includeInactive
      ? enrollments
      : enrollments.filter((item) => item.active);
    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  },
});

export const upsertEnrollment = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
    active: v.optional(v.boolean()),
    progressPercent: v.optional(v.number()),
    lastViewedLessonId: v.optional(v.union(v.id("course_lessons"), v.null())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ensureCourse(ctx, args.courseId);
    let lastViewedLessonId = args.lastViewedLessonId ?? undefined;
    if (lastViewedLessonId !== undefined) {
      if (lastViewedLessonId === null) {
        lastViewedLessonId = undefined;
      } else {
        await ensureLessonInCourse(ctx, lastViewedLessonId, args.courseId);
      }
    }

    const existing = await getEnrollmentByCourseAndUser(
      ctx,
      args.courseId,
      args.userId,
    );
    const progress = clampProgress(args.progressPercent);

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (args.active !== undefined) patch.active = args.active;
      if (progress !== undefined) patch.progressPercent = progress;
      if (args.order !== undefined) patch.order = args.order;
      if (args.lastViewedLessonId !== undefined) {
        patch.lastViewedLessonId = lastViewedLessonId;
      }
      if (Object.keys(patch).length === 0) {
        return await ctx.db.get(existing._id);
      }
      await ctx.db.patch(existing._id, patch as any);
      return await ctx.db.get(existing._id);
    }

    const now = Date.now();
    const id = await ctx.db.insert("course_enrollments", {
      courseId: args.courseId,
      userId: args.userId,
      enrolledAt: now,
      progressPercent: progress ?? 0,
      lastViewedLessonId,
      order: args.order ?? now,
      active: args.active ?? true,
    });
    return await ctx.db.get(id);
  },
});

export const updateEnrollmentProgress = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
    progressPercent: v.optional(v.number()),
    lastViewedLessonId: v.optional(v.union(v.id("course_lessons"), v.null())),
  },
  handler: async (ctx, args) => {
    const enrollment = await getEnrollmentByCourseAndUser(
      ctx,
      args.courseId,
      args.userId,
    );
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    let lastViewedLessonId = args.lastViewedLessonId ?? undefined;
    if (lastViewedLessonId !== undefined) {
      if (lastViewedLessonId === null) {
        lastViewedLessonId = undefined;
      } else {
        await ensureLessonInCourse(ctx, lastViewedLessonId, args.courseId);
      }
    }

    const patch: Record<string, unknown> = {};
    if (args.progressPercent !== undefined) {
      patch.progressPercent = clampProgress(args.progressPercent);
    }
    if (args.lastViewedLessonId !== undefined) {
      patch.lastViewedLessonId = lastViewedLessonId;
    }
    if (Object.keys(patch).length === 0) {
      return await ctx.db.get(enrollment._id);
    }
    await ctx.db.patch(enrollment._id, patch as any);
    return await ctx.db.get(enrollment._id);
  },
});

export const setEnrollmentActive = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, { courseId, userId, active }) => {
    const enrollment = await getEnrollmentByCourseAndUser(ctx, courseId, userId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    await ctx.db.patch(enrollment._id, { active });
    return { ok: true } as const;
  },
});

export const removeEnrollment = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
  },
  handler: async (ctx, { courseId, userId }) => {
    const enrollment = await getEnrollmentByCourseAndUser(ctx, courseId, userId);
    if (!enrollment) {
      return { ok: false } as const;
    }
    await ctx.db.delete(enrollment._id);
    return { ok: true } as const;
  },
});






