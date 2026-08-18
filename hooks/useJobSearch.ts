"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useJobSearch() {
  const start = useMutation(api.jobSearches.start);
  const history = useQuery(api.jobSearches.getMine);
  return { start, history };
}

export function useJobReport(searchId: Id<"jobSearches"> | undefined) {
  return useQuery(api.jobSearches.getReport, searchId ? { searchId } : "skip");
}

export function useJobHistory() {
  return useQuery(api.jobSearches.getAll);
}
