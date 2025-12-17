/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as categories from "../categories.js";
import type * as certificates from "../certificates.js";
import type * as comments from "../comments.js";
import type * as coupons from "../coupons.js";
import type * as course_favorites from "../course_favorites.js";
import type * as courses from "../courses.js";
import type * as customers from "../customers.js";
import type * as email from "../email.js";
import type * as enrollment from "../enrollment.js";
import type * as healthCheck from "../healthCheck.js";
import type * as homepage from "../homepage.js";
import type * as library from "../library.js";
import type * as media from "../media.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as otp from "../otp.js";
import type * as pageBlocks from "../pageBlocks.js";
import type * as pages from "../pages.js";
import type * as paymentSettings from "../paymentSettings.js";
import type * as payments from "../payments.js";
import type * as posts from "../posts.js";
import type * as progress from "../progress.js";
import type * as projects from "../projects.js";
import type * as purchases from "../purchases.js";
import type * as quizzes from "../quizzes.js";
import type * as reviews from "../reviews.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as students from "../students.js";
import type * as todos from "../todos.js";
import type * as vfx from "../vfx.js";
import type * as vietqr from "../vietqr.js";
import type * as visitors from "../visitors.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  categories: typeof categories;
  certificates: typeof certificates;
  comments: typeof comments;
  coupons: typeof coupons;
  course_favorites: typeof course_favorites;
  courses: typeof courses;
  customers: typeof customers;
  email: typeof email;
  enrollment: typeof enrollment;
  healthCheck: typeof healthCheck;
  homepage: typeof homepage;
  library: typeof library;
  media: typeof media;
  notifications: typeof notifications;
  orders: typeof orders;
  otp: typeof otp;
  pageBlocks: typeof pageBlocks;
  pages: typeof pages;
  paymentSettings: typeof paymentSettings;
  payments: typeof payments;
  posts: typeof posts;
  progress: typeof progress;
  projects: typeof projects;
  purchases: typeof purchases;
  quizzes: typeof quizzes;
  reviews: typeof reviews;
  search: typeof search;
  seed: typeof seed;
  settings: typeof settings;
  students: typeof students;
  todos: typeof todos;
  vfx: typeof vfx;
  vietqr: typeof vietqr;
  visitors: typeof visitors;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
