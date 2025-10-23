/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookings from "../bookings.js";
import type * as courts from "../courts.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as memberships from "../memberships.js";
import type * as otp from "../otp.js";
import type * as pricing from "../pricing.js";
import type * as router from "../router.js";
import type * as settings from "../settings.js";
import type * as simpleAuth from "../simpleAuth.js";
import type * as teams from "../teams.js";
import type * as trainers from "../trainers.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  courts: typeof courts;
  crons: typeof crons;
  emails: typeof emails;
  http: typeof http;
  memberships: typeof memberships;
  otp: typeof otp;
  pricing: typeof pricing;
  router: typeof router;
  settings: typeof settings;
  simpleAuth: typeof simpleAuth;
  teams: typeof teams;
  trainers: typeof trainers;
  waitlist: typeof waitlist;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
