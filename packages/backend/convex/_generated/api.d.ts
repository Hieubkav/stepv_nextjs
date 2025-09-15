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
import type * as healthCheck from "../healthCheck.js";
import type * as homepage from "../homepage.js";
import type * as pageBlocks from "../pageBlocks.js";
import type * as pages from "../pages.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as todos from "../todos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  healthCheck: typeof healthCheck;
  homepage: typeof homepage;
  pageBlocks: typeof pageBlocks;
  pages: typeof pages;
  seed: typeof seed;
  settings: typeof settings;
  todos: typeof todos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
