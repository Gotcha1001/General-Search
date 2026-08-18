"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin } from "lucide-react";

import { useJobSearch, useJobReport } from "@/hooks/useJobSearch";
import { useUserContext } from "@/app/context/UserContext";
import type { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResultCard,
  FailedCard,
  StatusIcon,
} from "@/app/components/ResultCard";
import { SearchingModal } from "@/app/components/SearchingModal";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const currentUser = useUserContext();

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [locationTouched, setLocationTouched] = useState(false);
  const [activeId, setActiveId] = useState<Id<"jobSearches"> | undefined>(
    (idParam as Id<"jobSearches"> | null) ?? undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  const { start, history } = useJobSearch();
  const report = useJobReport(activeId);

  // Pre-fill from the saved settings location as soon as it loads. Only
  // do this until the user starts editing the field themselves --
  // otherwise a slow-loading currentUser could clobber what they've typed.
  useEffect(() => {
    if (!locationTouched && currentUser?.location) {
      setLocation(currentUser.location);
    }
  }, [currentUser?.location, locationTouched]);

  const activeSearch = useMemo(
    () => history?.find((h) => h._id === activeId),
    [history, activeId],
  );

  const isPending = activeSearch?.status === "pending";
  const isFailed = activeSearch?.status === "failed";

  function selectSearch(id: Id<"jobSearches">) {
    setActiveId(id);
    router.replace(`/dashboard/search?id=${id}`, { scroll: false });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const id = await start({
        query: trimmed,
        location: location.trim() || currentUser?.location,
      });
      selectSearch(id);
      setQuery("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Find what you&apos;re looking for
        </h1>
        <p className="text-muted-foreground text-sm">
          Search for anything — a role, a restaurant, a service, whatever you
          need
          {currentUser?.location && <> in {currentUser.location}</>}.
        </p>
        <p className="text-muted-foreground text-xs">
          Location should be a single city, region, country, or
          &quot;Anywhere&quot; — not a combination (e.g. &quot;Durban&quot; or
          &quot;Anywhere&quot;, not &quot;Durban or Anywhere&quot;).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1.5 sm:flex-row sm:items-start"
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Software Engineer, best pizza in town, a babysitter..."
            className="pl-9"
            disabled={submitting}
          />
        </div>
        <div className="flex flex-col gap-1 sm:w-56">
          <div className="relative">
            <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={location}
              onChange={(e) => {
                setLocationTouched(true);
                setLocation(e.target.value);
              }}
              placeholder="Location or Anywhere"
              className="pl-9"
              disabled={submitting}
            />
          </div>
          <p className="text-muted-foreground text-xs px-1">
            {currentUser?.location
              ? "Clear this to search everywhere, or edit to search elsewhere."
              : 'One city, region, or "Anywhere" -- set a default in Settings.'}
          </p>
        </div>
        <Button type="submit" disabled={submitting || !query.trim()}>
          {submitting ? "Starting..." : "Search"}
        </Button>
      </form>

      {/* Fancy searching modal while pending */}
      <SearchingModal open={!!isPending} query={activeSearch?.query} />

      <AnimatePresence mode="wait">
        {activeId && !isPending && (
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {isFailed && <FailedCard query={activeSearch?.query} />}
            {report && (
              <ResultCard
                query={activeSearch?.query ?? report.query}
                results={report.results ?? []}
                summary={report.summary}
                sources={report.sources}
                searchId={activeId}
                locationLabel={activeSearch?.location}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {history && history.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">
            Recent searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h._id}
                onClick={() => selectSearch(h._id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  h._id === activeId
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted"
                }`}
              >
                <StatusIcon status={h.status} />
                {h.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
