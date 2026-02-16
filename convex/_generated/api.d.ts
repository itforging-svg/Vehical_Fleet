/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as drivers from "../drivers.js";
import type * as fuelRecords from "../fuelRecords.js";
import type * as notifications from "../notifications.js";
import type * as requests from "../requests.js";
import type * as seed from "../seed.js";
import type * as seedAdmins from "../seedAdmins.js";
import type * as trips from "../trips.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  drivers: typeof drivers;
  fuelRecords: typeof fuelRecords;
  notifications: typeof notifications;
  requests: typeof requests;
  seed: typeof seed;
  seedAdmins: typeof seedAdmins;
  trips: typeof trips;
  vehicles: typeof vehicles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
