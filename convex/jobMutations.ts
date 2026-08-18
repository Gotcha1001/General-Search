import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const saveReport = internalMutation({
  args: {
    searchId: v.id("jobSearches"),
    query: v.string(),
    results: v.array(
      v.object({
        title: v.string(),
        subtitle: v.optional(v.string()),
        description: v.optional(v.string()),
        location: v.optional(v.string()),
        link: v.optional(v.string()),
        metadata: v.optional(
          v.array(v.object({ label: v.string(), value: v.string() })),
        ),
      }),
    ),
    summary: v.string(),
    sources: v.array(v.object({ title: v.string(), url: v.string() })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("jobReports", { ...args, createdAt: Date.now() });
    await ctx.db.patch(args.searchId, { status: "complete" });
  },
});

export const markFailed = internalMutation({
  args: { searchId: v.id("jobSearches"), reason: v.optional(v.string()) },
  handler: async (ctx, { searchId, reason }) => {
    await ctx.db.patch(searchId, {
      status: "failed",
      failureReason: reason,
    });
  },
});

// Used by jobActions.research's race-guard: copies an already-completed
// report onto a different searchId instead of re-running Tavily + OpenRouter.
export const copyReport = internalMutation({
  args: {
    fromSearchId: v.id("jobSearches"),
    toSearchId: v.id("jobSearches"),
    query: v.string(),
  },
  handler: async (ctx, { fromSearchId, toSearchId, query }) => {
    const sourceReport = await ctx.db
      .query("jobReports")
      .withIndex("by_search", (q) => q.eq("searchId", fromSearchId))
      .first();

    if (!sourceReport) {
      await ctx.db.patch(toSearchId, { status: "failed" });
      return;
    }

    await ctx.db.insert("jobReports", {
      searchId: toSearchId,
      query,
      results: sourceReport.results,
      summary: sourceReport.summary,
      sources: sourceReport.sources,
      createdAt: Date.now(),
    });
    await ctx.db.patch(toSearchId, { status: "complete" });
  },
});
