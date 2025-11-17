import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Advanced Search & Filter for Courses
 * - Search by title, description, category
 * - Filter by price, rating, type
 * - Sort by various criteria
 */

interface SearchParams {
  query?: string;
  categoryId?: string;
  pricingType?: "free" | "paid";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "newest" | "popular" | "rating" | "price_asc" | "price_desc";
  limit?: number;
  offset?: number;
}

/**
 * Advanced search & filter courses
 */
export const searchCourses = query({
  args: {
    q: v.optional(v.string()), // search query
    categoryId: v.optional(v.id("course_categories")),
    pricingType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minRating: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("newest"),
        v.literal("popular"),
        v.literal("rating"),
        v.literal("price_asc"),
        v.literal("price_desc")
      )
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    const sortBy = args.sortBy || "newest";

    // Start with active courses
    let courses = await ctx.db
      .query("courses")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .order("desc")
      .collect();

    // Filter by search query (title or description)
    if (args.q) {
      const searchTerm = args.q.toLowerCase();
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm) ||
          course.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (args.categoryId) {
      courses = courses.filter((course) => course.categoryId === args.categoryId);
    }

    // Filter by pricing type
    if (args.pricingType) {
      courses = courses.filter((course) => course.pricingType === args.pricingType);
    }

    // Filter by price range
    const { minPrice, maxPrice, minRating } = args;

    if (minPrice !== undefined) {
      courses = courses.filter(
        (course) => course.priceAmount === undefined || course.priceAmount >= minPrice
      );
    }

    if (maxPrice !== undefined) {
      courses = courses.filter(
        (course) => course.priceAmount === undefined || course.priceAmount <= maxPrice
      );
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      courses = courses.filter(
        (course) => course.averageRating === undefined || course.averageRating >= minRating
      );
    }

    // Sort
    let sorted = courses;
    switch (sortBy) {
      case "popular":
        // Sort by enrollment count
        sorted = courses.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
        break;
      case "rating":
        // Sort by average rating
        sorted = courses.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "price_asc":
        // Sort by price ascending
        sorted = courses.sort((a, b) => {
          const aPrice = a.pricingType === "free" ? 0 : a.priceAmount || 0;
          const bPrice = b.pricingType === "free" ? 0 : b.priceAmount || 0;
          return aPrice - bPrice;
        });
        break;
      case "price_desc":
        // Sort by price descending
        sorted = courses.sort((a, b) => {
          const aPrice = a.pricingType === "free" ? 0 : a.priceAmount || 0;
          const bPrice = b.pricingType === "free" ? 0 : b.priceAmount || 0;
          return bPrice - aPrice;
        });
        break;
      case "newest":
      default:
        // Already sorted by desc createdAt from index
        break;
    }

    // Get total count for pagination
    const totalCount = sorted.length;

    // Paginate
    const items = sorted.slice(offset, offset + limit);

    return {
      items,
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  },
});

/**
 * Get course statistics for filters
 */
export const getCourseStatistics = query({
  args: {},
  async handler(ctx) {
    // Get all active courses
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect();

    // Calculate statistics
    const stats = {
      totalCourses: courses.length,
      freeCourses: courses.filter((c) => c.pricingType === "free").length,
      paidCourses: courses.filter((c) => c.pricingType === "paid").length,
      priceRange: {
        min: 0,
        max: 0,
      },
      averageRatingRange: {
        min: 0,
        max: 5,
      },
      enrollmentRange: {
        min: 0,
        max: 0,
      },
      categories: {} as Record<string, number>,
    };

    if (courses.length > 0) {
      // Calculate price range
      const paidCourses = courses.filter(
        (c) => c.pricingType === "paid" && c.priceAmount
      );
      if (paidCourses.length > 0) {
        const prices = paidCourses.map((c) => c.priceAmount || 0);
        stats.priceRange.min = Math.min(...prices);
        stats.priceRange.max = Math.max(...prices);
      }

      // Calculate enrollment range
      const enrollments = courses
        .map((c) => c.enrollmentCount || 0)
        .filter((e) => e > 0);
      if (enrollments.length > 0) {
        stats.enrollmentRange.max = Math.max(...enrollments);
      }

      // Count courses by category
      for (const course of courses) {
        if (course.categoryId) {
          const categoryId = course.categoryId;
          stats.categories[categoryId] = (stats.categories[categoryId] || 0) + 1;
        }
      }
    }

    return stats;
  },
});

/**
 * Get courses by category (with pagination)
 */
export const getCoursesByCategory = query({
  args: {
    categoryId: v.id("course_categories"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    const courses = (
      await ctx.db
        .query("courses")
        .withIndex("by_category_order", (q) =>
          q.eq("categoryId", args.categoryId)
        )
        .collect()
    ).filter((course) => course.active);

    const items = courses.slice(offset, offset + limit);

    return {
      items,
      totalCount: courses.length,
      hasMore: offset + limit < courses.length,
    };
  },
});

/**
 * Get popular courses (by enrollments)
 */
export const getPopularCourses = query({
  args: {
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 10;

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect()
      .then((items) =>
        items
          .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
          .slice(0, limit)
      );

    return courses;
  },
});

/**
 * Get top-rated courses
 */
export const getTopRatedCourses = query({
  args: {
    limit: v.optional(v.number()),
    minReviews: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 10;
    const minReviews = args.minReviews || 1;

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect()
      .then((items) =>
        items
          .filter((c) => (c.totalReviews || 0) >= minReviews)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, limit)
      );

    return courses;
  },
});
