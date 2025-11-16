// KISS: Convex functions cho học viên
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = MutationCtx | QueryCtx;
type StudentId = Id<"students">;

type StudentDoc = {
  _id: StudentId;
  account: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type PublicStudent = {
  _id: StudentId;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

const toPublicStudent = (student: StudentDoc): PublicStudent => ({
  _id: student._id,
  account: student.account,
  fullName: student.fullName,
  email: student.email ?? undefined,
  phone: student.phone ?? undefined,
  notes: student.notes ?? undefined,
  tags: student.tags ?? [],
  order: student.order,
  active: student.active,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

const requireUniqueAccount = async (
  ctx: AnyCtx,
  account: string,
  excludeId?: StudentId,
) => {
  const existing = await ctx.db
    .query("students")
    .withIndex("by_account", (q) => q.eq("account", account))
    .first();
  if (existing && (!excludeId || existing._id !== excludeId)) {
    throw new Error("Account already exists");
  }
};

const normalizeTags = (tags?: string[]) => {
  if (!tags) return undefined;
  const cleaned = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  if (!cleaned.length) return [] as string[];
  return Array.from(new Set(cleaned));
};

export const listStudents = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    search: v.optional(v.string()),
    withCourseCount: v.optional(v.boolean()),
  },
  handler: async (ctx, { activeOnly = false, search, withCourseCount = false }) => {
    let students = await ctx.db.query("students").collect();
    if (activeOnly) {
      students = students.filter((item) => item.active);
    }
    if (search && search.trim().length > 0) {
      const keyword = search.trim().toLowerCase();
      students = students.filter((item) => {
        const values = [
          item.account,
          item.fullName,
          item.email ?? "",
          item.phone ?? "",
          item.tags?.join(" ") ?? "",
        ];
        return values.some((value) => value.toLowerCase().includes(keyword));
      });
    }
    students.sort((a, b) => a.order - b.order);
    if (withCourseCount && students.length > 0) {
      const pairs = await Promise.all(
        students.map(async (student) => {
          const userId = String(student._id);
          const enrollments = await ctx.db
            .query("course_enrollments")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
          const count = enrollments.filter((item) => item.active).length;
          return { userId, count };
        }),
      );
      const map = new Map<string, number>();
      for (const pair of pairs) {
        map.set(pair.userId, pair.count);
      }
      return students.map((student) => ({
        ...student,
        courseCount: map.get(String(student._id)) ?? 0,
      }));
    }
    return students;
  },
});

export const getStudent = query({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    return (await ctx.db.get(id)) ?? null;
  },
});

export const getStudentProfile = query({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    const student = await ctx.db.get(id);
    if (!student) return null;
    return toPublicStudent(student as StudentDoc);
  },
});

export const authenticateStudent = mutation({
  args: {
    account: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { account, password }) => {
    const normalizedAccount = account.trim();
    const normalizedPassword = password.trim();
    if (!normalizedAccount || !normalizedPassword) {
      return null;
    }

    const student = await ctx.db
      .query("students")
      .withIndex("by_account", (q) => q.eq("account", normalizedAccount))
      .first();

    if (!student) return null;

    const doc = student as StudentDoc;
    if (!doc.active) return null;
    if (doc.password !== normalizedPassword) return null;

    return toPublicStudent(doc);
  },
});

export const createStudent = mutation({
  args: {
    account: v.string(),
    password: v.string(),
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const account = args.account.trim();
    if (!account) throw new Error("Account is required");
    const password = args.password.trim();
    if (!password) throw new Error("Password is required");
    const now = Date.now();
    const tags = normalizeTags(args.tags);
    await requireUniqueAccount(ctx, account);
    const id = await ctx.db.insert("students", {
      account,
      password,
      fullName: args.fullName.trim(),
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      tags,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateStudent = mutation({
  args: {
    id: v.id("students"),
    account: v.optional(v.string()),
    password: v.optional(v.string()),
    fullName: v.optional(v.string()),
    email: v.optional(v.union(v.string(), v.null())),
    phone: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, account, password, tags, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Student not found");

    const patch: Record<string, unknown> = { ...rest };

    if (account !== undefined) {
      const trimmed = account.trim();
      if (!trimmed) throw new Error("Account is required");
      if (trimmed !== (existing as StudentDoc).account) {
        await requireUniqueAccount(ctx, trimmed, id);
      }
      patch.account = trimmed;
    }

    if (password !== undefined) {
      const trimmedPassword = password.trim();
      if (!trimmedPassword) throw new Error("Password is required");
      patch.password = trimmedPassword;
    }

    if (rest.fullName !== undefined) {
      patch.fullName = rest.fullName.trim();
    }

    if (rest.email !== undefined) {
      patch.email = rest.email ? rest.email.trim() : undefined;
    }

    if (rest.phone !== undefined) {
      patch.phone = rest.phone ? rest.phone.trim() : undefined;
    }

    if (rest.notes !== undefined) {
      patch.notes = rest.notes ? rest.notes.trim() : undefined;
    }

    if (tags !== undefined) {
      patch.tags = normalizeTags(tags);
    }

    patch.updatedAt = Date.now();

    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const setStudentActive = mutation({
  args: { id: v.id("students"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const reorderStudents = mutation({
  args: { orderedIds: v.array(v.id("students")) },
  handler: async (ctx, { orderedIds }) => {
    const now = Date.now();
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { order: i, updatedAt: now });
    }
    const students = await ctx.db.query("students").collect();
    students.sort((a, b) => a.order - b.order);
    return students;
  },
});

export const deleteStudent = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return { ok: false } as const;
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_user", (q) => q.eq("userId", String(id)))
      .collect();
    for (const enrollment of enrollments) {
      await ctx.db.delete(enrollment._id);
    }
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});



