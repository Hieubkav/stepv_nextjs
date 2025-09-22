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
      const found = await ctx.db
        .query("courses")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      course = (found as CourseDoc) ?? null;
    }

    if (!course) return null;
    if (!includeInactive && !course.active) return null;

    const chapters = (await ctx.db
      .query("course_chapters")
      .withIndex("by_course_order", (q) => q.eq("courseId", course._id))
      .collect()) as ChapterDoc[];

    const lessons = (await ctx.db
      .query("course_lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", course._id))
      .collect()) as LessonDoc[];

    const lessonsByChapter: Record<string, LessonDoc[]> = {};
    for (const lesson of lessons) {
      if (!includeInactive && !lesson.active) continue;
      const key = lesson.chapterId as string;
      if (!lessonsByChapter[key]) lessonsByChapter[key] = [];
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

    return { course, chapters: detail } as const;
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
