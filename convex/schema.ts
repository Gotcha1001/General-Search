import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    // Free-text city/region (e.g. "Durban, South Africa", "Anywhere") used as
    // the default location for this user's searches. Optional so existing
    // users without a preference fall back to DEFAULT_LOCATION.
    location: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  jobSearches: defineTable({
    userId: v.id("users"),
    query: v.string(),
    // Lowercased/trimmed copy of `query` prefixed with the location string,
    // used purely for cache lookups so the same query searched in different
    // locations is cached separately -- see normalizeQuery in lib.ts.
    normalizedQuery: v.string(),
    // Free-text location this search ran against. "" or "Anywhere" means
    // the search wasn't constrained to a place.
    location: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    // Short machine-readable code set when status is "failed", e.g.
    // "missing_api_key" | "http_429" | "tavily_error: ..." | "no_results" |
    // "structuring_failed" | "exception". Lets the dashboard/logs
    // distinguish failure causes without re-running the search. Optional
    // since older rows predate this field.
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_query", ["query"])
    // Powers the caching lookup in jobSearches.start and the race-guard
    // re-check in jobActions.research.
    .index("by_normalized_query", ["normalizedQuery"]),

  // The generated report + structured results for a search. `results` is
  // intentionally generic -- a job posting, a restaurant, a babysitter, and
  // a concert pianist for hire all fit the same shape. The AI-structuring
  // step in jobActions.ts decides what `metadata` makes sense per query;
  // there's no fixed schema per category.
  jobReports: defineTable({
    searchId: v.id("jobSearches"),
    query: v.string(),
    results: v.array(
      v.object({
        title: v.string(), // "Luigi's Trattoria" / "Sarah M. -- Babysitter" / job title
        subtitle: v.optional(v.string()), // "Italian · $$$" / "5 yrs experience" / company name
        description: v.optional(v.string()),
        location: v.optional(v.string()),
        link: v.optional(v.string()), // was applyUrl -- now just "the relevant link"
        metadata: v.optional(
          v.array(v.object({ label: v.string(), value: v.string() })),
        ),
        // e.g. [{label:"Rating", value:"4.8"}] or [{label:"Salary", value:"$90k"}]
      }),
    ),
    summary: v.string(),
    sources: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_search", ["searchId"]),
});
