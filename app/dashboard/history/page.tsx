"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useJobHistory } from "@/hooks/useJobSearch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "@/app/components/ResultCard";
import type { Id } from "@/convex/_generated/dataModel";

type StatusFilter = "all" | "pending" | "complete" | "failed";

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "complete", label: "Complete" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export default function HistoryPage() {
  const router = useRouter();
  const history = useJobHistory();
  const remove = useMutation(api.jobSearches.remove);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<Id<"jobSearches"> | null>(null);

  const filtered = useMemo(() => {
    if (!history) return [];
    return history.filter((h) => {
      const matchesQuery = h.query
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || h.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [history, query, statusFilter]);

  const isLoading = history === undefined;

  async function handleDelete(
    id: Id<"jobSearches">,
    e: React.MouseEvent | React.KeyboardEvent,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    try {
      await remove({ searchId: id });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          My searches
        </h1>
        <p className="text-white text-sm">
          Everything you&apos;ve looked up, in one place.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-white absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by search term..."
            className="pl-9 text-white placeholder:text-white/70 border-white/40 bg-white/5 hover:bg-white/15 hover:border-white/60 focus:bg-white/15 focus:border-white transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
              className={
                statusFilter === tab.value
                  ? "bg-white text-black hover:bg-black hover:text-white transition-colors"
                  : "border border-white/40 bg-transparent text-white hover:bg-white hover:text-black transition-colors"
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-white text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-white/20 bg-white/5">
          <CardContent className="text-white pt-6 text-center text-sm">
            {history && history.length === 0
              ? "No searches yet — try something from the dashboard to get your first search."
              : "No searches match that filter."}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((h) => (
            <div
              key={h._id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/dashboard/search?id=${h._id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/dashboard/search?id=${h._id}`);
                }
              }}
              className="group hover:bg-white hover:text-black flex cursor-pointer items-center justify-between rounded-lg border border-white/20 px-4 py-3 text-sm text-white transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <StatusIcon status={h.status} />
                {h.query}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white text-xs group-hover:text-black transition-colors">
                  {new Date(h.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-destructive group-hover:text-black h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:!text-destructive"
                  disabled={deletingId === h._id}
                  onClick={(e) => handleDelete(h._id, e)}
                  aria-label={`Delete search for ${h.query}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
