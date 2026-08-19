"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IBM_Plex_Mono } from "next/font/google";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hud",
});

// Fixed ember/particle positions — avoids SSR/client hydration mismatch
const PARTICLES = [
  { top: "10%", left: "18%", size: 2, delay: 0 },
  { top: "22%", left: "80%", size: 1.5, delay: 0.5 },
  { top: "34%", left: "8%", size: 1.5, delay: 1.1 },
  { top: "14%", left: "52%", size: 2, delay: 1.7 },
  { top: "46%", left: "90%", size: 1.5, delay: 0.2 },
  { top: "64%", left: "12%", size: 2, delay: 0.8 },
  { top: "72%", left: "86%", size: 1.5, delay: 1.4 },
  { top: "82%", left: "24%", size: 2, delay: 0.1 },
  { top: "88%", left: "62%", size: 1.5, delay: 1.0 },
  { top: "6%", left: "68%", size: 1.5, delay: 2.0 },
  { top: "52%", left: "4%", size: 1.5, delay: 0.6 },
  { top: "58%", left: "48%", size: 1, delay: 1.3 },
  { top: "26%", left: "38%", size: 1, delay: 0.4 },
  { top: "92%", left: "42%", size: 1.5, delay: 1.8 },
  { top: "40%", left: "58%", size: 1, delay: 0.3 },
  { top: "18%", left: "96%", size: 1, delay: 1.5 },
];

// Each column gets its own fixed glyph string — binary, hex, and a few
// code-punctuation characters mixed in, no per-render randomness.
const GLYPH_SETS = [
  "01101001",
  "0xFF3A9B",
  "{01}[10]",
  "10110101",
  "0x1C7E20",
  "<0110/>",
  "11001010",
  "0xB4D901",
];
const RAIN_COLUMNS = Array.from({ length: 16 }).map((_, i) => ({
  left: `${(i / 15) * 100}%`,
  glyphs: GLYPH_SETS[i % GLYPH_SETS.length],
  duration: 7 + (i % 6) * 1.8,
  delay: (i % 8) * 0.7,
  size: i % 3 === 0 ? 13 : 11,
}));

// Faint violet coordinate-grid texture
const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg stroke='%237c3aed' stroke-opacity='0.35' stroke-width='1'%3E%3Cpath d='M30 24v12M24 30h12'/%3E%3C/g%3E%3C/svg%3E";

// Irregular pulse for the core, not a smooth breathing loop
const pulse = {
  opacity: [0.5, 0.95, 0.45, 1, 0.55, 0.85, 0.5],
  scale: [0.93, 1.06, 0.9, 1.12, 0.95, 1.03, 0.93],
};

// Wireframe rings tumbling independently in and out of the core
const RING_FRAMES: {
  size: number;
  baseZ: number;
  rx: number[];
  ry: number[];
  duration: number;
}[] = [
  { size: 600, baseZ: -8, rx: [0, -360], ry: [0, 360], duration: 48 },
  { size: 460, baseZ: 14, rx: [0, 360], ry: [0, -360], duration: 33 },
  { size: 320, baseZ: -22, rx: [0, -360], ry: [0, -360], duration: 22 },
];

/**
 * A colder, terminal-flavored counterpart to CyberVoidBackground — near-black
 * with deep violet, true binary/hex digital rain, a pulsing magenta-violet
 * core, and tumbling wireframe rings instead of a warm rose window.
 *
 * Purely decorative: absolutely positioned, pointer-events-none, sized to
 * fill its nearest positioned ancestor.
 */
export function MatrixCoreBackground({
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
      className={`${plexMono.variable} pointer-events-none absolute inset-0 overflow-hidden bg-[#050108] ${className}`}
    >
      {/* violet coordinate-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `url("${GRID_BG}")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#170a2e_0%,_#050108_70%)]" />

      {/* falling binary/hex rain */}
      {RAIN_COLUMNS.map((col, i) => (
        <motion.div
          key={i}
          className="absolute top-0 flex flex-col gap-6 font-[family-name:var(--font-hud)]"
          style={{
            left: col.left,
            fontSize: col.size,
            color:
              i % 3 === 0
                ? "rgba(217,70,239,0.5)"
                : i % 3 === 1
                  ? "rgba(139,92,246,0.4)"
                  : "rgba(196,181,253,0.22)",
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

      {/* drifting particles */}
      {PARTICLES.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#e9d5ff]"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={reduceMotion ? undefined : { opacity: [0.08, 0.6, 0.08] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* crossing axis lines through the center */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-px w-[900px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#7c3aed]/35 to-transparent"
        animate={spin()}
        transition={spinTransition(110)}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[900px] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#d946ef]/30 to-transparent"
        animate={spin(true)}
        transition={spinTransition(110)}
      />

      {/* tumbling wireframe rings */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: 1400 }}
      >
        {RING_FRAMES.map((f, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 border"
            style={{
              width: f.size,
              height: f.size,
              marginLeft: -f.size / 2,
              marginTop: -f.size / 2,
              borderColor:
                i === 1 ? "rgba(217,70,239,0.18)" : "rgba(139,92,246,0.22)",
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

      {/* pulsing violet-magenta core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-[720px] w-[720px] rounded-full opacity-25 blur-2xl"
          style={{
            background:
              "conic-gradient(from 0deg, #4c1d95, #d946ef, #050108, #4c1d95, #7c3aed, #050108, #4c1d95)",
          }}
          animate={spin()}
          transition={spinTransition(65)}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-xl"
          style={{
            background:
              "conic-gradient(from 45deg, #7c3aed, #4c1d95, #050108, #d946ef, #4c1d95, #050108, #7c3aed)",
          }}
          animate={spin(true)}
          transition={spinTransition(38)}
        />

        {/* nested inner core, breathing independently */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 0.88, 1], opacity: [0.55, 0.35, 0.55] }
          }
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 240, height: 240 }}
        >
          <motion.div
            className="h-[240px] w-[240px] rounded-full opacity-70 blur-md"
            style={{
              background:
                "conic-gradient(from 90deg, #a855f7, #050108, #d946ef, #a855f7, #050108, #d946ef, #a855f7)",
            }}
            animate={spin(true)}
            transition={spinTransition(24)}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-85 blur-sm"
            style={{
              background:
                "conic-gradient(from 180deg, #7c3aed, #d946ef, #050108, #7c3aed)",
            }}
            animate={spin()}
            transition={spinTransition(12)}
          />
        </motion.div>

        {/* fine mullion rings */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#a855f7]/25"
          animate={spin()}
          transition={spinTransition(85)}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7c3aed]/25"
          animate={spin(true)}
          transition={spinTransition(52)}
        />

        {/* flickering singularity core */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e9d5ff] blur-2xl"
          animate={reduceMotion ? undefined : pulse}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* glitch scanline sweep */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d946ef]/60 to-transparent"
        animate={reduceMotion ? undefined : { top: ["0%", "100%"] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e9d5ff 1px, transparent 1px), linear-gradient(to bottom, #e9d5ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#050108_90%)]" />
    </div>
  );
}
