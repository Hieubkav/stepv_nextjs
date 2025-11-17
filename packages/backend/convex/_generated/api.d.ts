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
import type * as certificates from "../certificates.js";
import type * as course_favorites from "../course_favorites.js";
import type * as courses from "../courses.js";
import type * as email from "../email.js";
import type * as enrollment from "../enrollment.js";
import type * as healthCheck from "../healthCheck.js";
import type * as homepage from "../homepage.js";
import type * as library from "../library.js";
import type * as media from "../media.js";
import type * as otp from "../otp.js";
import type * as pageBlocks from "../pageBlocks.js";
import type * as pages from "../pages.js";
import type * as paymentSettings from "../paymentSettings.js";
import type * as payments from "../payments.js";
import type * as progress from "../progress.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as students from "../students.js";
import type * as todos from "../todos.js";
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
  certificates: typeof certificates;
  course_favorites: typeof course_favorites;
  courses: typeof courses;
  email: typeof email;
  enrollment: typeof enrollment;
  healthCheck: typeof healthCheck;
  homepage: typeof homepage;
  library: typeof library;
  media: typeof media;
  otp: typeof otp;
  pageBlocks: typeof pageBlocks;
  pages: typeof pages;
  paymentSettings: typeof paymentSettings;
  payments: typeof payments;
  progress: typeof progress;
  quizzes: typeof quizzes;
  seed: typeof seed;
  settings: typeof settings;
  students: typeof students;
  todos: typeof todos;
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
