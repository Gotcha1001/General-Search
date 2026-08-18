"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeQuery, isAnywhereLocation } from "./lib";

// ---- Tavily -----------------------------------------------------------

interface TavilySearchResult {
  title: string;
  url: string;
  content: string; // cleaned snippet
  score?: number;
  published_date?: string;
}

interface TavilySearchResponse {
  results?: TavilySearchResult[];
  answer?: string;
  error?: string;
}

// ---- OpenRouter structuring step ---------------------------------------

interface OpenRouterChatResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string; code?: number };
}

// Generic result item -- must stay in sync with the `results` shape in
// schema.ts (jobReports.results).
interface ResultItem {
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  link?: string;
  metadata?: { label: string; value: string }[];
}

interface StructuredResults {
  results: ResultItem[];
  summary: string;
}

const STRUCTURING_SYSTEM_PROMPT = `You turn raw web-search snippets into a structured list of results for a general-purpose search app. The user's query could be about jobs, restaurants, services (babysitters, plumbers, tutors), products, entertainment, or anything else searchable on the web.

Respond with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape:

{
  "results": [
    {
      "title": "string -- the name of the thing (business name, person's name, job title, product name, etc.)",
      "subtitle": "string or omit -- a short second line, e.g. company name, cuisine + price range, years of experience",
      "description": "string or omit -- one or two sentences of useful detail",
      "location": "string or omit -- city/address/area if relevant to this specific result",
      "link": "string or omit -- the single most relevant URL for this result",
      "metadata": [{"label": "string", "value": "string"}] // or omit -- 0-4 short label/value pairs relevant to THIS query type (e.g. Rating/4.8, Salary/$90k, Price/$$, Hours/9am-5pm). Pick whatever labels make sense for what's being searched -- don't force job-shaped fields onto non-job results.
    }
  ],
  "summary": "string -- one or two sentences summarizing what was found, in plain language"
}

Rules:
- Only include results that are genuinely relevant to the query and location (if given).
- Return at most 10 results, ordered with the best/most relevant first.
- If nothing relevant was found in the source material, return {"results": [], "summary": "..."} explaining that briefly.
- Never invent facts not present in the source snippets -- omit a field rather than guessing.`;

// Strip common markdown-fence wrapping that models sometimes add despite
// being told not to (```json ... ``` or ``` ... ```), so JSON.parse doesn't
// choke on it.
function stripJsonFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

// Very light shape check -- we don't want a malformed/partial model response
// silently getting saved as a "complete" report with garbage in it.
function isValidStructuredResults(x: unknown): x is StructuredResults {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  if (!Array.isArray(obj.results)) return false;
  if (typeof obj.summary !== "string") return false;
  return obj.results.every(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as Record<string, unknown>).title === "string",
  );
}

export const research = internalAction({
  args: {
    searchId: v.id("jobSearches"),
    query: v.string(),
    location: v.string(),
  },
  handler: async (ctx, { searchId, query: userQuery, location }) => {
    try {
      // --- Race guard ----------------------------------------------------
      // The cache check in jobSearches.start happens at insert time. If two
      // requests for the same query+location land close enough together,
      // both can miss the cache and both schedule this action. Re-check
      // right before spending money: if another in-flight/just-finished
      // search for the same normalized query already completed, copy its
      // report instead of searching again.
      const normalizedQuery = normalizeQuery(userQuery, location);
      const existingCompleted = await ctx.runQuery(
        internal.jobSearches.findCompletedForNormalizedQuery,
        { normalizedQuery, excludeSearchId: searchId },
      );

      if (existingCompleted) {
        console.log("[jobActions] race guard hit -- copying existing report", {
          normalizedQuery,
          fromSearchId: existingCompleted._id,
        });
        await ctx.runMutation(internal.jobMutations.copyReport, {
          fromSearchId: existingCompleted._id,
          toSearchId: searchId,
          query: userQuery,
        });
        return;
      }

      const tavilyKey = process.env.TAVILY_API_KEY;
      const openRouterKey = process.env.OPENROUTER_API_KEY;

      if (!tavilyKey) {
        console.error("[jobActions] TAVILY_API_KEY missing");
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: "missing_api_key",
        });
        return;
      }
      if (!openRouterKey) {
        console.error("[jobActions] OPENROUTER_API_KEY missing");
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: "missing_api_key",
        });
        return;
      }

      // --- Step 1: Tavily general web search ------------------------------
      // No location param quirk here (unlike SerpApi's google_jobs) -- if
      // the search has no real location, we just don't add one to the query
      // text. Otherwise fold it in naturally.
      const anywhere = isAnywhereLocation(location);
      const searchQuery = anywhere ? userQuery : `${userQuery} in ${location}`;

      console.log("[jobActions] requesting Tavily", { searchQuery, anywhere });

      const tavilyRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: searchQuery,
          search_depth: "advanced",
          include_answer: false,
          max_results: 10,
        }),
      });

      if (!tavilyRes.ok) {
        const body = await tavilyRes.text().catch(() => "");
        console.error(
          "[jobActions] Tavily HTTP error",
          tavilyRes.status,
          body.slice(0, 500),
        );
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: `http_${tavilyRes.status}`,
        });
        return;
      }

      const tavilyData = (await tavilyRes.json()) as TavilySearchResponse;

      if (tavilyData.error) {
        console.error("[jobActions] Tavily error", tavilyData.error);
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: `tavily_error: ${tavilyData.error}`,
        });
        return;
      }

      const rawResults = tavilyData.results ?? [];
      console.log("[jobActions] Tavily response", {
        rawResultCount: rawResults.length,
      });

      if (rawResults.length === 0) {
        console.warn("[jobActions] zero Tavily results", { searchQuery });
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: "no_results",
        });
        return;
      }

      // --- Step 2: OpenRouter structures the snippets ---------------------
      const snippetsForModel = rawResults
        .slice(0, 10)
        .map(
          (r, i) =>
            `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 800)}`,
        )
        .join("\n\n");

      const userPrompt = `Query: "${userQuery}"${
        anywhere ? "" : `\nLocation: ${location}`
      }

Source snippets from a web search:

${snippetsForModel}`;

      const orRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
            messages: [
              { role: "system", content: STRUCTURING_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
          }),
        },
      );

      if (!orRes.ok) {
        const body = await orRes.text().catch(() => "");
        console.error(
          "[jobActions] OpenRouter HTTP error",
          orRes.status,
          body.slice(0, 500),
        );
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: `http_${orRes.status}`,
        });
        return;
      }

      const orData = (await orRes.json()) as OpenRouterChatResponse;

      if (orData.error) {
        console.error("[jobActions] OpenRouter error payload", orData.error);
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: `openrouter_error: ${orData.error.message ?? "unknown"}`,
        });
        return;
      }

      const rawContent = orData.choices?.[0]?.message?.content?.trim() ?? "";

      if (!rawContent) {
        console.error("[jobActions] OpenRouter returned empty content");
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: "structuring_failed",
        });
        return;
      }

      // --- Step 3: parse + validate the structured JSON --------------------
      const jsonText = stripJsonFences(rawContent);

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        console.error(
          "[jobActions] failed to parse structured JSON",
          e,
          jsonText.slice(0, 500),
        );
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: "structuring_failed",
        });
        return;
      }

      if (!isValidStructuredResults(parsed)) {
        console.error(
          "[jobActions] structured JSON failed shape check",
          jsonText.slice(0, 500),
        );
        await ctx.runMutation(internal.jobMutations.markFailed, {
          searchId,
          reason: "structuring_failed",
        });
        return;
      }

      const structured: StructuredResults = parsed;

      // --- Step 4: save ------------------------------------------------------
      // Sources come from the raw Tavily hits (not the model output) so the
      // "Sources" list in the UI always links to real pages, even for a
      // result the model chose not to surface individually.
      const sources = rawResults.slice(0, 10).map((r) => ({
        title: r.title,
        url: r.url,
      }));

      await ctx.runMutation(internal.jobMutations.saveReport, {
        searchId,
        query: userQuery,
        results: structured.results.slice(0, 10),
        summary: structured.summary,
        sources,
      });
    } catch (e) {
      console.error("[jobActions] unhandled exception in research()", e);
      await ctx.runMutation(internal.jobMutations.markFailed, {
        searchId,
        reason: "exception",
      });
    }
  },
});
