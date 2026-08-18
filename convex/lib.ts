import type { QueryCtx, MutationCtx } from "./_generated/server";

// How long a completed report stays eligible for cache reuse before we
// consider it stale and re-search. Results churn (job postings, restaurant
// hours, availability), so this is deliberately short.
export const SEARCH_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Fallback location used when a search doesn't specify one and the user has
// no saved preference. Free text, no fixed code list -- just a sensible
// default for location-aware queries.
export const DEFAULT_LOCATION = "United States";

// A search has no meaningful geographic constraint if the location is blank
// or explicitly "Anywhere" (e.g. entertainment recommendations, "best
// productivity apps", a fully remote job). In that case jobActions.ts skips
// appending a location to the search query instead of searching a literal
// place called "Anywhere".
export function isAnywhereLocation(location: string): boolean {
  const normalized = location.trim().toLowerCase();
  return normalized.length === 0 || normalized === "anywhere";
}

// Cache key includes the location -- the same query needs a separate cached
// report per region, since results differ (e.g. "pizza" searched in
// "Durban" surfaces different results than "pizza" in "Cape Town").
export function normalizeQuery(query: string, location: string): string {
  return `${location.trim().toLowerCase()}:${query.trim().toLowerCase()}`;
}

// Shared identity -> users-table lookup. Returns null if signed out or if
// the Clerk identity has no matching row yet (rather than throwing), so
// queries can early-return [] and mutations can decide how strict to be.
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
}
