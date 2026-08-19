"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IBM_Plex_Mono } from "next/font/google";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hud",
});

// Fixed positions — avoids SSR/client hydration mismatch from Math.random()
const STARS = [
  { top: "8%", left: "14%", size: 2, delay: 0 },
  { top: "18%", left: "82%", size: 1.5, delay: 0.6 },
  { top: "30%", left: "6%", size: 1.5, delay: 1.2 },
  { top: "12%", left: "48%", size: 2, delay: 1.8 },
  { top: "42%", left: "92%", size: 1.5, delay: 0.3 },
  { top: "62%", left: "10%", size: 2, delay: 0.9 },
  { top: "70%", left: "88%", size: 1.5, delay: 1.5 },
  { top: "80%", left: "20%", size: 2, delay: 0.2 },
  { top: "85%", left: "65%", size: 1.5, delay: 1.1 },
  { top: "5%", left: "70%", size: 1.5, delay: 2.1 },
  { top: "50%", left: "3%", size: 1.5, delay: 0.7 },
  { top: "55%", left: "50%", size: 1, delay: 1.4 },
  { top: "22%", left: "35%", size: 1, delay: 0.5 },
  { top: "90%", left: "45%", size: 1.5, delay: 1.9 },
  { top: "38%", left: "60%", size: 1, delay: 0.4 },
  { top: "15%", left: "95%", size: 1, delay: 1.6 },
];

// Fixed glyph strings per rain column — search notation, no per-render randomness
const GLYPH_SETS = [
  "#0∑X",
  "%√∞@",
  "∂×÷≈",
  "∇⊕#@",
  "∑√X0",
  "≈∂%∇",
  "∞×#√",
  "X∫≈¶",
];
const RAIN_COLUMNS = Array.from({ length: 14 }).map((_, i) => ({
  left: `${(i / 13) * 100}%`,
  glyphs: GLYPH_SETS[i % GLYPH_SETS.length],
  duration: 9 + (i % 5) * 2.2,
  delay: (i % 7) * 0.9,
  size: i % 3 === 0 ? 13 : 11,
}));

// Graph-paper tick marks — a matrix of tiny coordinate crosses, bronze
const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg stroke='%23b45309' stroke-opacity='0.4' stroke-width='1'%3E%3Cpath d='M30 24v12M24 30h12'/%3E%3C/g%3E%3C/svg%3E";

// Irregular candle-flicker, not a smooth pulse
const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

// Tesseract-style wireframe squares: each tumbles on X/Y independently
// while holding its own base Z rotation — dimensions churning inside one another.
const DIMENSION_FRAMES: {
  size: number;
  baseZ: number;
  rx: number[];
  ry: number[];
  duration: number;
}[] = [
  { size: 620, baseZ: 6, rx: [0, 360], ry: [0, -360], duration: 52 },
  { size: 480, baseZ: -12, rx: [0, -360], ry: [0, 360], duration: 36 },
  { size: 340, baseZ: 20, rx: [0, 360], ry: [0, 360], duration: 24 },
];

/**
 * The animated amber/bronze "cyber void" scene from the marketing home page —
 * matrix-style glyph rain, ember dust, spinning axis lines, a tumbling
 * tesseract wireframe, and a layered rose window with a flickering core.
 *
 * Purely decorative: absolutely positioned, pointer-events-none, and sized
 * to fill its nearest positioned ancestor. Drop it in as a background layer
 * behind any content — the parent just needs `position: relative` (or similar)
 * and `overflow: hidden` if you don't want the wide axis lines/rose window to
 * be clipped oddly.
 */
export function CyberVoidBackground({
  className = "",
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const spin = (reverse = false) =>
    reduceMotion ? undefined : { rotate: reverse ? -360 : 360 };
  const spinTransition = (duration: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration, repeat: Infinity, ease: "linear" as const };

  return (
    <div
      className={`${plexMono.variable} pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0603] ${className}`}
    >
      {/* graph-paper coordinate texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("${GRID_BG}")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#180f05_0%,_#0a0603_68%)]" />

      {/* falling search-symbol rain */}
      {RAIN_COLUMNS.map((col, i) => (
        <motion.div
          key={i}
          className="absolute top-0 flex flex-col gap-6 font-[family-name:var(--font-hud)]"
          style={{
            left: col.left,
            fontSize: col.size,
            color:
              i % 2 === 0 ? "rgba(245,158,11,0.45)" : "rgba(253,230,138,0.24)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
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

      {/* ember dust */}
      {STARS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#fde68a]"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={reduceMotion ? undefined : { opacity: [0.1, 0.7, 0.1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* crossing axis lines through the center */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-px w-[900px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#b45309]/30 to-transparent"
        animate={spin()}
        transition={spinTransition(120)}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[900px] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#f59e0b]/30 to-transparent"
        animate={spin(true)}
        transition={spinTransition(120)}
      />

      {/* tesseract wireframe — dimensions tumbling inside one another */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: 1400 }}
      >
        {DIMENSION_FRAMES.map((f, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 border"
            style={{
              width: f.size,
              height: f.size,
              marginLeft: -f.size / 2,
              marginTop: -f.size / 2,
              borderColor:
                i === 1 ? "rgba(253,230,138,0.16)" : "rgba(245,158,11,0.2)",
              borderWidth: i === 1 ? 1 : 1.5,
              transformStyle: "preserve-3d",
            }}
            initial={{ rotateZ: f.baseZ }}
            animate={
              reduceMotion
                ? undefined
                : { rotateX: f.rx, rotateY: f.ry, rotateZ: f.baseZ }
            }
            transition={{
              duration: f.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* rose window — dimension one */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-[780px] w-[780px] rounded-full opacity-25 blur-2xl"
          style={{
            background:
              "conic-gradient(from 0deg, #b45309, #f59e0b, #180f05, #b45309, #f59e0b, #180f05, #b45309)",
          }}
          animate={spin()}
          transition={spinTransition(70)}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-xl"
          style={{
            background:
              "conic-gradient(from 45deg, #f59e0b, #b45309, #180f05, #f59e0b, #b45309, #180f05, #f59e0b)",
          }}
          animate={spin(true)}
          transition={spinTransition(42)}
        />

        {/* recursive nested copy — dimension two, half scale, spinning the other way */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 0.9, 1], opacity: [0.55, 0.4, 0.55] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 260, height: 260 }}
        >
          <motion.div
            className="h-[260px] w-[260px] rounded-full opacity-70 blur-md"
            style={{
              background:
                "conic-gradient(from 90deg, #d97706, #180f05, #f59e0b, #d97706, #180f05, #f59e0b, #d97706)",
            }}
            animate={spin(true)}
            transition={spinTransition(26)}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-sm"
            style={{
              background:
                "conic-gradient(from 180deg, #b45309, #f59e0b, #180f05, #b45309)",
            }}
            animate={spin()}
            transition={spinTransition(13)}
          />
        </motion.div>

        {/* fine traceried mullion rings */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#f59e0b]/25"
          animate={spin()}
          transition={spinTransition(90)}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b45309]/25"
          animate={spin(true)}
          transition={spinTransition(55)}
        />

        {/* flickering singularity core */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fde68a] blur-2xl"
          animate={reduceMotion ? undefined : flicker}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* glitch scanline sweep */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/60 to-transparent"
        animate={reduceMotion ? undefined : { top: ["0%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fde68a 1px, transparent 1px), linear-gradient(to bottom, #fde68a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_32%,_#0a0603_88%)]" />
    </div>
  );
}
