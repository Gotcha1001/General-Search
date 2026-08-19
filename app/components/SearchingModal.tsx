// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { Search, Sparkles, Briefcase, ListChecks } from "lucide-react";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// const STEPS = [
//   { icon: Search, label: "Scanning job boards…" },
//   { icon: Briefcase, label: "Collecting job listings…" },
//   { icon: ListChecks, label: "Comparing openings…" },
//   { icon: Sparkles, label: "Writing your report…" },
// ];

// export function SearchingModal({
//   open,
//   query,
// }: {
//   open: boolean;
//   query?: string;
// }) {
//   return (
//     <Dialog open={open}>
//       <DialogContent
//         showCloseButton={false}
//         className="sm:max-w-md border-0 bg-transparent p-0 shadow-none"
//         onPointerDownOutside={(e) => e.preventDefault()}
//         onEscapeKeyDown={(e) => e.preventDefault()}
//       >
//         <DialogTitle className="sr-only">
//           Searching for {query ?? "this role"}
//         </DialogTitle>

//         <motion.div
//           initial={{ opacity: 0, scale: 0.92, y: 12 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.95, y: 8 }}
//           transition={{ type: "spring", stiffness: 320, damping: 28 }}
//           className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-8 text-center shadow-2xl shadow-indigo-500/20"
//         >
//           {/* Soft animated orbs */}
//           <motion.div
//             className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl"
//             animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
//             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.div
//             className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-purple-500/30 blur-3xl"
//             animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.3, 0.5] }}
//             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//           />

//           {/* Pulsing search icon */}
//           <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
//             <motion.div
//               className="absolute inset-0 rounded-full border-2 border-indigo-400/40"
//               animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
//               transition={{ duration: 1.8, repeat: Infinity }}
//             />
//             <motion.div
//               className="absolute inset-2 rounded-full border-2 border-purple-400/30"
//               animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
//               transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
//             />
//             <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40">
//               <Search className="h-5 w-5 text-white" />
//             </div>
//           </div>

//           <h2 className="relative text-xl font-semibold tracking-tight text-white">
//             Searching
//             {query ? (
//               <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
//                 {" "}
//                 “{query}”
//               </span>
//             ) : (
//               " for this role"
//             )}
//           </h2>
//           <p className="relative mt-2 text-sm text-indigo-200/70">
//             Please wait — we’re scanning job boards for openings
//           </p>

//           {/* Cycling steps */}
//           <div className="relative mt-8 space-y-3">
//             {STEPS.map((step, i) => (
//               <StepRow key={step.label} step={step} index={i} />
//             ))}
//           </div>

//           {/* Progress bar */}
//           <div className="relative mt-8 h-1 overflow-hidden rounded-full bg-white/10">
//             <motion.div
//               className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"
//               initial={{ x: "-100%" }}
//               animate={{ x: "100%" }}
//               transition={{
//                 duration: 1.6,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               style={{ width: "40%" }}
//             />
//           </div>
//         </motion.div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function StepRow({
//   step,
//   index,
// }: {
//   step: (typeof STEPS)[number];
//   index: number;
// }) {
//   const Icon = step.icon;
//   return (
//     <motion.div
//       className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-left"
//       initial={{ opacity: 0, x: -8 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ delay: 0.15 * index + 0.2 }}
//     >
//       <motion.div
//         animate={{ rotate: [0, 360] }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           ease: "linear",
//           delay: index * 0.4,
//         }}
//         className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/20"
//       >
//         <Icon className="h-3.5 w-3.5 text-indigo-300" />
//       </motion.div>
//       <span className="text-sm text-indigo-100/80">{step.label}</span>
//       <motion.span
//         className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{
//           duration: 1.2,
//           repeat: Infinity,
//           delay: index * 0.25,
//         }}
//       />
//     </motion.div>
//   );
// }

"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Sparkles, Briefcase, ListChecks, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Cinzel_Decorative, IBM_Plex_Mono } from "next/font/google";

// NOTE: if your homepage already exports these font objects from a shared
// module (e.g. `lib/fonts.ts`), import them from there instead of
// redeclaring — next/font just needs the variable names to match what your
// Tailwind config / globals.css expect (--font-display / --font-hud).
const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hud",
});

const STEPS = [
  { icon: Search, label: "Scanning job boards" },
  { icon: Briefcase, label: "Collecting listings" },
  { icon: ListChecks, label: "Comparing openings" },
  { icon: Sparkles, label: "Writing your report" },
];

// Fixed ember positions — no Math.random() so SSR/client markup matches
const EMBERS = [
  { top: "10%", left: "8%", size: 2, delay: 0 },
  { top: "20%", left: "88%", size: 1.5, delay: 0.7 },
  { top: "72%", left: "6%", size: 1.5, delay: 1.3 },
  { top: "82%", left: "90%", size: 2, delay: 0.4 },
  { top: "45%", left: "94%", size: 1.5, delay: 1.8 },
  { top: "55%", left: "4%", size: 1.5, delay: 1.0 },
  { top: "14%", left: "45%", size: 1.5, delay: 0.2 },
  { top: "88%", left: "50%", size: 1.5, delay: 1.5 },
];

// Fixed glyph rain columns — same trick as the homepage
const GLYPH_SETS = ["#0∑X", "%√∞@", "∂×÷≈", "∇⊕#@", "∑√X0", "≈∂%∇"];
const RAIN_COLUMNS = Array.from({ length: 7 }).map((_, i) => ({
  left: `${(i / 6) * 100}%`,
  glyphs: GLYPH_SETS[i % GLYPH_SETS.length],
  duration: 7 + (i % 4) * 1.8,
  delay: (i % 5) * 0.6,
}));

const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg stroke='%23b45309' stroke-opacity='0.35' stroke-width='1'%3E%3Cpath d='M24 18v12M18 24h12'/%3E%3C/g%3E%3C/svg%3E";

// Irregular candle-flicker rather than a smooth pulse
const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

export function SearchingModal({
  open,
  query,
}: {
  open: boolean;
  query?: string;
}) {
  const reduceMotion = useReducedMotion();
  const spin = (reverse = false) =>
    reduceMotion ? undefined : { rotate: reverse ? -360 : 360 };
  const spinTransition = (duration: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration, repeat: Infinity, ease: "linear" as const };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className={`${cinzel.variable} ${plexMono.variable} sm:max-w-md border-0 bg-transparent p-0 shadow-none`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          Searching for {query ?? "this role"}
        </DialogTitle>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative overflow-hidden rounded-xl border border-[#f59e0b]/25 bg-[#0a0603] p-8 text-center shadow-[0_0_60px_-12px_rgba(217,119,6,0.55)]"
          >
            {/* graph-paper texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url("${GRID_BG}")`,
                backgroundSize: "48px 48px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#180f05_0%,_#0a0603_75%)]" />

            {/* falling glyph rain, clipped to card */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
              {RAIN_COLUMNS.map((col, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 flex flex-col gap-5 font-[family-name:var(--font-hud)] text-[11px]"
                  style={{
                    left: col.left,
                    color:
                      i % 2 === 0
                        ? "rgba(245,158,11,0.35)"
                        : "rgba(253,230,138,0.18)",
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 25%, black 65%, transparent)",
                  }}
                  animate={reduceMotion ? undefined : { y: ["-30%", "130%"] }}
                  transition={{
                    duration: col.duration,
                    repeat: Infinity,
                    delay: col.delay,
                    ease: "linear",
                  }}
                >
                  {col.glyphs.split("").map((g, j) => (
                    <span key={j}>{g}</span>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* ember dust */}
            {EMBERS.map((s, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute rounded-full bg-[#fde68a]"
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size,
                  height: s.size,
                }}
                animate={
                  reduceMotion ? undefined : { opacity: [0.1, 0.7, 0.1] }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: s.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* corner brackets — cyberpunk framing */}
            {[
              "-left-px -top-px border-l-2 border-t-2",
              "-right-px -top-px border-r-2 border-t-2",
              "-left-px -bottom-px border-l-2 border-b-2",
              "-right-px -bottom-px border-r-2 border-b-2",
            ].map((cls, i) => (
              <div
                key={i}
                className={`pointer-events-none absolute ${cls} h-5 w-5 border-[#f59e0b]/60`}
              />
            ))}

            {/* scanline sweep */}
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent"
              animate={reduceMotion ? undefined : { top: ["0%", "100%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            />

            {/* ===== flickering core ===== */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-[#f59e0b]/35"
                animate={spin()}
                transition={spinTransition(14)}
              />
              <motion.div
                className="absolute inset-1.5 rounded-full border border-[#b45309]/40"
                animate={spin(true)}
                transition={spinTransition(9)}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#fbbf24]/30"
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }
                }
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute h-10 w-10 rounded-full bg-[#fde68a] blur-xl"
                animate={reduceMotion ? undefined : flicker}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#f59e0b]/50 bg-gradient-to-br from-[#b45309] to-[#d97706] shadow-[0_0_25px_-4px_rgba(245,158,11,0.9)]">
                <Search className="h-5 w-5 text-[#fdf3e0]" />
              </div>
            </div>

            <h2 className="relative font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[#fdf3e0]">
              Searching
              {query ? (
                <span className="bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] bg-clip-text text-transparent">
                  {" "}
                  “{query}”
                </span>
              ) : (
                " for this role"
              )}
            </h2>
            <p className="relative mt-2 font-[family-name:var(--font-hud)] text-xs uppercase tracking-[0.2em] text-[#fde68a]/50">
              Scanning the web for openings
            </p>

            {/* cycling steps */}
            <div className="relative mt-8 space-y-2.5">
              {STEPS.map((step, i) => (
                <StepRow key={step.label} step={step} index={i} />
              ))}
            </div>

            {/* progress bar */}
            <div className="relative mt-8 h-1 overflow-hidden rounded-full bg-[#f59e0b]/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#b45309] via-[#fbbf24] to-[#b45309]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: "35%" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
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
      className="group flex items-center gap-3 rounded-md border border-[#f59e0b]/10 bg-[#f59e0b]/[0.04] px-3 py-2 text-left"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 * index + 0.2, duration: 0.4 }}
    >
      <motion.div
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#f59e0b]/30 bg-[#180f05]"
        animate={{
          borderColor: [
            "rgba(245,158,11,0.3)",
            "rgba(251,191,36,0.7)",
            "rgba(245,158,11,0.3)",
          ],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          delay: index * 0.5,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-3 w-3 text-[#fde68a]/80" />
      </motion.div>
      <span className="font-[family-name:var(--font-hud)] text-[13px] text-[#fef3c7]/75">
        {step.label}
        <motion.span
          className="inline-block"
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          …
        </motion.span>
      </span>
      <motion.span
        className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f59e0b]"
        animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: index * 0.25,
        }}
      />
    </motion.div>
  );
}
