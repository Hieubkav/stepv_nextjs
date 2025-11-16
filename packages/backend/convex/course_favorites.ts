// KISS: Convex functions cho course favorites (wishlist)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type StudentId = Id<"students">;
type CourseId = Id<"courses">;

// Toggle favorite (thêm hoặc xóa)
export const toggleCourseFavorite = mutation({
    args: {
        studentId: v.id("students"),
        courseId: v.id("courses"),
    },
    handler: async (ctx, { studentId, courseId }) => {
        // Check if already favorited
        const existing = await ctx.db
            .query("course_favorites")
            .withIndex("by_student_course", (q) =>
                q.eq("studentId", studentId).eq("courseId", courseId)
            )
            .first();

        if (existing) {
            // Remove favorite
            await ctx.db.delete(existing._id);
            return { ok: true, isFavorited: false } as const;
        } else {
            // Add favorite
            await ctx.db.insert("course_favorites", {
                studentId,
                courseId,
                createdAt: Date.now(),
            });
            return { ok: true, isFavorited: true } as const;
        }
    },
});

// Remove favorite explicitly
export const removeCourseFavorite = mutation({
    args: {
        studentId: v.id("students"),
        courseId: v.id("courses"),
    },
    handler: async (ctx, { studentId, courseId }) => {
        const existing = await ctx.db
            .query("course_favorites")
            .withIndex("by_student_course", (q) =>
                q.eq("studentId", studentId).eq("courseId", courseId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { ok: true } as const;
        }
        return { ok: false, error: "Favorite not found" } as const;
    },
});

// List student's favorite courses
export const listStudentFavorites = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, { studentId }) => {
        const favorites = await ctx.db
            .query("course_favorites")
            .withIndex("by_student", (q) => q.eq("studentId", studentId))
            .collect();

        const courseIds = favorites.map((f) => f.courseId);
        if (courseIds.length === 0) return [];

        const courses = await Promise.all(
            courseIds.map((id) => ctx.db.get(id))
        );

        return courses
            .filter((c) => c !== null && (c as any).active)
            .sort((a, b) => {
                const aOrder = (a as any).order ?? 0;
                const bOrder = (b as any).order ?? 0;
                return aOrder - bOrder;
            });
    },
});

// Check if course is favorited by student
export const isCourseFavorited = query({
    args: {
        studentId: v.id("students"),
        courseId: v.id("courses"),
    },
    handler: async (ctx, { studentId, courseId }) => {
        const existing = await ctx.db
            .query("course_favorites")
            .withIndex("by_student_course", (q) =>
                q.eq("studentId", studentId).eq("courseId", courseId)
            )
            .first();

        return { isFavorited: !!existing } as const;
    },
});

// Get favorite count for a course
export const getCourseFavoriteCount = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, { courseId }) => {
        const favorites = await ctx.db
            .query("course_favorites")
            .withIndex("by_course", (q) => q.eq("courseId", courseId))
            .collect();

        return { count: favorites.length } as const;
    },
});
