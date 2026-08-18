"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Briefcase, ListChecks } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const STEPS = [
  { icon: Search, label: "Scanning job boards…" },
  { icon: Briefcase, label: "Collecting job listings…" },
  { icon: ListChecks, label: "Comparing openings…" },
  { icon: Sparkles, label: "Writing your report…" },
];

export function SearchingModal({
  open,
  query,
}: {
  open: boolean;
  query?: string;
}) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-0 bg-transparent p-0 shadow-none"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          Searching for {query ?? "this role"}
        </DialogTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-8 text-center shadow-2xl shadow-indigo-500/20"
        >
          {/* Soft animated orbs */}
          <motion.div
            className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-purple-500/30 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Pulsing search icon */}
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-indigo-400/40"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-purple-400/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40">
              <Search className="h-5 w-5 text-white" />
            </div>
          </div>

          <h2 className="relative text-xl font-semibold tracking-tight text-white">
            Searching
            {query ? (
              <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                {" "}
                “{query}”
              </span>
            ) : (
              " for this role"
            )}
          </h2>
          <p className="relative mt-2 text-sm text-indigo-200/70">
            Please wait — we’re scanning job boards for openings
          </p>

          {/* Cycling steps */}
          <div className="relative mt-8 space-y-3">
            {STEPS.map((step, i) => (
              <StepRow key={step.label} step={step} index={i} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative mt-8 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: "40%" }}
            />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function StepRow({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-left"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 * index + 0.2 }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: index * 0.4,
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/20"
      >
        <Icon className="h-3.5 w-3.5 text-indigo-300" />
      </motion.div>
      <span className="text-sm text-indigo-100/80">{step.label}</span>
      <motion.span
        className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: index * 0.25,
        }}
      />
    </motion.div>
  );
}
