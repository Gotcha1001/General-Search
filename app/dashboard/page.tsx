"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Search, ArrowRight, Compass } from "lucide-react";
import { useJobSearch } from "@/hooks/useJobSearch";
import { useUserContext } from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusIcon } from "@/app/components/ResultCard";

export default function DashboardHomePage() {
  const { user } = useUser();
  const currentUser = useUserContext();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { start, history } = useJobSearch();

  const total = history?.length ?? 0;
  const completed = history?.filter((h) => h.status === "complete").length ?? 0;
  const recent = history?.slice(0, 5) ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const id = await start({
        query: trimmed,
        location: currentUser?.location,
      });
      router.push(`/dashboard/search?id=${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const firstName = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm">
          Pick up a past search or start looking for something new.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything, e.g. Software Engineer, best pizza nearby..."
            className="pl-9"
            disabled={submitting}
          />
        </div>
        <Button type="submit" disabled={submitting || !query.trim()}>
          {submitting ? "Starting..." : "Search"}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{total}</p>
              <p className="text-muted-foreground text-sm">Total searches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{completed}</p>
              <p className="text-muted-foreground text-sm">Reports ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-medium">
            Recent searches
          </h2>
          {total > 5 && (
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/history" className="flex items-center gap-1">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>

        {recent.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground pt-6 text-center text-sm">
              No searches yet --- try searching for anything above to get your
              first result.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((h) => (
              <a
                key={h._id}
                href={`/dashboard/search?id=${h._id}`}
                className="hover:bg-muted flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <StatusIcon status={h.status} />
                  {h.query}
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(h.createdAt).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
