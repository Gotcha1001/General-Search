import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  getCurrentUser,
  normalizeQuery,
  SEARCH_CACHE_TTL_MS,
  DEFAULT_LOCATION,
} from "./lib";

export const start = mutation({
  args: { query: v.string(), location: v.optional(v.string()) },
  returns: v.id("jobSearches"),
  handler: async (ctx, { query: rawQuery, location: rawLocation }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const trimmedQuery = rawQuery.trim();
    const trimmedLocation = rawLocation?.trim();
    const location =
      trimmedLocation && trimmedLocation.length > 0
        ? trimmedLocation
        : (user.location ?? DEFAULT_LOCATION);
    const normalizedQuery = normalizeQuery(trimmedQuery, location);

    // --- Cache check --------------------------------------------------
    const cachedSearch = await ctx.db
      .query("jobSearches")
      .withIndex("by_normalized_query", (q) =>
        q.eq("normalizedQuery", normalizedQuery),
      )
      .filter((q) => q.eq(q.field("status"), "complete"))
      .order("desc")
      .first();

    if (
      cachedSearch &&
      Date.now() - cachedSearch.createdAt < SEARCH_CACHE_TTL_MS
    ) {
      const cachedReport = await ctx.db
        .query("jobReports")
        .withIndex("by_search", (q) => q.eq("searchId", cachedSearch._id))
        .first();

      if (cachedReport) {
        const searchId = await ctx.db.insert("jobSearches", {
          userId: user._id,
          query: trimmedQuery,
          normalizedQuery,
          location,
          status: "complete",
          createdAt: Date.now(),
        });
        await ctx.db.insert("jobReports", {
          searchId,
          query: trimmedQuery,
          results: cachedReport.results,
          summary: cachedReport.summary,
          sources: cachedReport.sources,
          createdAt: Date.now(),
        });
        return searchId;
      }
    }

    // --- No usable cache entry: run the real pipeline ------------------
    const searchId = await ctx.db.insert("jobSearches", {
      userId: user._id,
      query: trimmedQuery,
      normalizedQuery,
      location,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.jobActions.research, {
      searchId,
      query: trimmedQuery,
      location,
    });

    return searchId;
  },
});

export const getMine = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("jobSearches"),
      _creationTime: v.float64(),
      query: v.string(),
      normalizedQuery: v.string(),
      location: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("complete"),
        v.literal("failed"),
      ),
      createdAt: v.float64(),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const searches = await ctx.db
      .query("jobSearches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
    return searches.map((search) => ({
      _id: search._id,
      _creationTime: search._creationTime,
      query: search.query,
      normalizedQuery: search.normalizedQuery,
      location: search.location,
      status: search.status,
      createdAt: search.createdAt,
    }));
  },
});

export const getReport = query({
  args: { searchId: v.id("jobSearches") },
  handler: async (ctx, { searchId }) => {
    return await ctx.db
      .query("jobReports")
      .withIndex("by_search", (q) => q.eq("searchId", searchId))
      .first();
  },
});

export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("jobSearches"),
      _creationTime: v.float64(),
      query: v.string(),
      normalizedQuery: v.string(),
      location: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("complete"),
        v.literal("failed"),
      ),
      createdAt: v.float64(),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const searches = await ctx.db
      .query("jobSearches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);
    return searches.map((search) => ({
      _id: search._id,
      _creationTime: search._creationTime,
      query: search.query,
      normalizedQuery: search.normalizedQuery,
      location: search.location,
      status: search.status,
      createdAt: search.createdAt,
    }));
  },
});

export const findCompletedForNormalizedQuery = internalQuery({
  args: {
    normalizedQuery: v.string(),
    excludeSearchId: v.id("jobSearches"),
  },
  handler: async (ctx, { normalizedQuery, excludeSearchId }) => {
    const candidate = await ctx.db
      .query("jobSearches")
      .withIndex("by_normalized_query", (q) =>
        q.eq("normalizedQuery", normalizedQuery),
      )
      .filter((q) => q.eq(q.field("status"), "complete"))
      .order("desc")
      .first();
    if (!candidate || candidate._id === excludeSearchId) return null;
    return candidate;
  },
});

export const remove = mutation({
  args: { searchId: v.id("jobSearches") },
  returns: v.null(),
  handler: async (ctx, { searchId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const search = await ctx.db.get(searchId);
    if (!search) throw new Error("Search not found");
    if (search.userId !== user._id) {
      throw new Error("Not authorized to delete this search");
    }

    const reports = await ctx.db
      .query("jobReports")
      .withIndex("by_search", (q) => q.eq("searchId", searchId))
      .collect();
    for (const report of reports) {
      await ctx.db.delete(report._id);
    }

    await ctx.db.delete(searchId);
    return null;
  },
});

export const getPublicReport = query({
  args: { searchId: v.id("jobSearches") },
  handler: async (ctx, { searchId }) => {
    const search = await ctx.db.get(searchId);
    if (!search || search.status !== "complete") return null;
    const report = await ctx.db
      .query("jobReports")
      .withIndex("by_search", (q) => q.eq("searchId", searchId))
      .first();
    if (!report) return null;
    return {
      query: report.query,
      results: report.results ?? [],
      summary: report.summary,
      sources: report.sources,
      createdAt: report.createdAt,
    };
  },
});
