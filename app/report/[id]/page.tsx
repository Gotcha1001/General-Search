"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
  ExternalLink,
  ScrollText,
  Share2,
  Check,
  ArrowLeft,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PublicReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const report = useQuery(api.jobSearches.getPublicReport, {
    searchId: id as Id<"jobSearches">,
  });
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (report === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  if (report === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 px-6 text-center">
        <p className="text-lg text-indigo-100">
          Report not found or still processing.
        </p>
        <Link href="/">
          <Button
            variant="outline"
            className="border-indigo-400/40 text-indigo-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
        </Link>
      </div>
    );
  }

  const results = report.results ?? [];
  const topResult = results[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-6 py-12 md:py-20">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-indigo-300/70 transition hover:text-indigo-200"
          >
            <ArrowLeft className="h-4 w-4" /> FindScout
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={copyLink}
            className="border-indigo-400/30 bg-white/5 text-indigo-100 hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
              </>
            )}
          </Button>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-indigo-500/20 bg-white/5 p-6 shadow-2xl shadow-indigo-900/40 backdrop-blur-md md:p-10"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-300/60">
            Search report
          </p>
          <h1 className="mt-2 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            {report.query}
          </h1>

          <p className="mt-6 text-base leading-relaxed text-indigo-100/90">
            {report.summary}
          </p>

          {topResult && (
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              <Compass className="h-4 w-4 shrink-0 text-emerald-300" />
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-emerald-300/70">
                  Top match
                </p>
                <p className="text-sm font-semibold text-emerald-100">
                  {topResult.title}
                  {topResult.subtitle ? ` — ${topResult.subtitle}` : ""}
                </p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-indigo-300/60">
                All results
              </p>
              <ul className="flex flex-col divide-y divide-indigo-500/10">
                {results.map((r, i) => (
                  <li
                    key={`${r.title}-${r.link ?? i}`}
                    className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {i === 0 && (
                          <Badge className="border-emerald-400/20 bg-emerald-500/15 text-emerald-100">
                            Top pick
                          </Badge>
                        )}
                        <span className="truncate text-sm font-medium text-indigo-50">
                          {r.title}
                        </span>
                      </div>
                      <span className="text-xs text-indigo-200/60">
                        {[r.subtitle, r.location].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {r.metadata?.[0] && (
                        <span className="text-sm font-semibold text-indigo-100">
                          {r.metadata[0].value}
                        </span>
                      )}
                      {r.link && (
                        <a
                          href={r.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-300/70 underline-offset-4 transition hover:text-indigo-200 hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.sources.length > 0 && (
            <div className="mt-8 border-t border-indigo-500/15 pt-6">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-indigo-300/60">
                <ScrollText className="h-3.5 w-3.5" /> Sources
              </p>
              <ul className="space-y-2">
                {report.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-indigo-300/70 underline-offset-4 transition hover:text-indigo-200 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.article>

        <p className="mt-8 text-center text-xs text-indigo-400/50">
          Generated by FindScout ·{" "}
          {new Date(report.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
