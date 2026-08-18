"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Search, Compass, Clock, Globe2 } from "lucide-react";
import {
  Cinzel_Decorative,
  UnifrakturMaguntia,
  IBM_Plex_Mono,
} from "next/font/google";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display",
});
const blackletter = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-blackletter",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hud",
});

const FEATURES = [
  {
    code: "SEEK",
    title: "Search anything",
    description:
      "A role, a restaurant, a babysitter, a concert — type what you need and get results synthesized from across the web in seconds.",
    icon: Search,
  },
  {
    code: "TAG",
    title: "Freshest result, flagged",
    description:
      "See the most recently posted listing highlighted, with a direct link to it.",
    icon: Compass,
  },
  {
    code: "GLOBE",
    title: "Every source compared",
    description:
      "See what's out there right now, ranked by how relevant and recent it is.",
    icon: Globe2,
  },
  {
    code: "RITE",
    title: "Search history",
    description: "Revisit every search you've ever run, saved to your account.",
    icon: Clock,
  },
];

const OUTER_ORBIT = ["Best Restaurants", "Live Concerts", "Software Jobs"];
const INNER_ORBIT = ["Babysitters", "Local Services"];

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

// Graph-paper tick marks — a matrix of tiny coordinate crosses, now bronze
const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg stroke='%23b45309' stroke-opacity='0.4' stroke-width='1'%3E%3Cpath d='M30 24v12M24 30h12'/%3E%3C/g%3E%3C/svg%3E";

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.12 * i,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const letterVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.55 + i * 0.05,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

// Irregular candle-flicker, not a smooth pulse
const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

function orbitPosition(index: number, count: number, radius: number) {
  const angle = (360 / count) * index - 90;
  const rad = (angle * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
}

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

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isSignedIn) router.prefetch("/dashboard");
  }, [isSignedIn, router]);

  const spin = (reverse = false) =>
    reduceMotion ? undefined : { rotate: reverse ? -360 : 360 };
  const spinTransition = (duration: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration, repeat: Infinity, ease: "linear" as const };

  return (
    <main
      className={`${cinzel.variable} ${blackletter.variable} ${plexMono.variable} relative flex min-h-screen flex-col items-center overflow-hidden bg-[#0a0603] px-6 text-center`}
    >
      {/* ===== graph-paper coordinate texture ===== */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("${GRID_BG}")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ===== VOID + MATRIX RAIN + DIMENSIONAL CORE ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
                i % 2 === 0
                  ? "rgba(245,158,11,0.45)"
                  : "rgba(253,230,138,0.24)",
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

        {/* ===== tesseract wireframe — dimensions tumbling inside one another ===== */}
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

        {/* ===== ROSE WINDOW — dimension one ===== */}
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

          {/* recursive nested copy — dimension two, half scale, spinning the other way, receding inward */}
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

          {/* flickering singularity core — the candle at the center of the search */}
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

      <div className="pt-24" />

      {/* sigil badge */}
      <motion.div
        className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#f59e0b]/40 bg-[#180f05]/60 shadow-[0_0_30px_-5px_rgba(217,119,6,0.8)] backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
      >
        <motion.div
          animate={reduceMotion ? undefined : flicker}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Compass className="h-6 w-6 text-[#fde68a]" />
        </motion.div>
      </motion.div>

      {/* eyebrow — blackletter accent, the one gothic risk */}
      <motion.div
        className="relative z-10 flex items-center gap-3 font-[family-name:var(--font-blackletter)] text-2xl text-[#fbbf24]/90"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]"
          animate={reduceMotion ? undefined : { opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        Seek, and You Shall Find
      </motion.div>

      {/* headline with periodic glitch aberration */}
      <div className="relative z-10 mt-4">
        <h1 className="relative font-[family-name:var(--font-display)] text-5xl font-black tracking-tight text-[#fdf3e0] md:text-7xl">
          <motion.span
            className="inline-block"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Find{" "}
          </motion.span>
          <span className="relative inline-block">
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 text-[#7c2d12]/70"
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, -3, 2, -1, 0], opacity: [0, 0.6, 0, 0.5, 0] }
              }
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatDelay: 3.2,
                ease: "linear",
              }}
            >
              Scout
            </motion.span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 text-[#fdf3e0]/60"
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, 3, -2, 1, 0], opacity: [0, 0.5, 0, 0.4, 0] }
              }
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatDelay: 3.2,
                delay: 0.06,
                ease: "linear",
              }}
            >
              Scout
            </motion.span>
            <span className="relative bg-gradient-to-r from-[#b45309] via-[#fbbf24] to-[#d97706] bg-clip-text text-transparent">
              {"Scout".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </span>
        </h1>
      </div>

      <motion.p
        className="relative z-10 mt-5 max-w-xl text-lg text-[#fef3c7]/60"
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        Search anything and watch results traced across the web — every source
        surfaced, ranked, and decoded through the glass in seconds.
      </motion.p>

      {/* orbiting categories around the dimensional core */}
      <div className="relative z-10 my-10 h-72 w-72">
        {[
          "-left-2 -top-2 border-l-2 border-t-2",
          "-right-2 -top-2 border-r-2 border-t-2",
          "-left-2 -bottom-2 border-l-2 border-b-2",
          "-right-2 -bottom-2 border-r-2 border-b-2",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute ${cls} h-4 w-4 border-[#f59e0b]/40`}
          />
        ))}

        <motion.div
          className="absolute inset-0"
          animate={spin()}
          transition={spinTransition(34)}
        >
          {OUTER_ORBIT.map((name, i) => {
            const { x, y } = orbitPosition(i, OUTER_ORBIT.length, 130);
            return (
              <div
                key={name}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                }}
              >
                <motion.span
                  className="block whitespace-nowrap rounded-full border border-[#f59e0b]/35 bg-[#180f05]/60 px-3 py-1 font-[family-name:var(--font-hud)] text-xs text-[#fef3c7]/85 shadow-[0_0_16px_-4px_rgba(217,119,6,0.8)] backdrop-blur-sm"
                  animate={spin(true)}
                  transition={spinTransition(34)}
                  whileHover={{ scale: 1.1 }}
                >
                  {name}
                </motion.span>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          className="absolute inset-0"
          animate={spin(true)}
          transition={spinTransition(19)}
        >
          {INNER_ORBIT.map((name, i) => {
            const { x, y } = orbitPosition(i, INNER_ORBIT.length, 62);
            return (
              <div
                key={name}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                }}
              >
                <motion.span
                  className="block whitespace-nowrap rounded-full border border-[#b45309]/35 bg-[#120b04]/70 px-2.5 py-1 font-[family-name:var(--font-hud)] text-[11px] text-[#fde68a]/90 shadow-[0_0_14px_-4px_rgba(180,83,9,0.8)] backdrop-blur-sm"
                  animate={spin()}
                  transition={spinTransition(19)}
                  whileHover={{ scale: 1.1 }}
                >
                  {name}
                </motion.span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* CTAs */}
      <motion.div
        className="relative z-10 flex flex-wrap justify-center gap-4"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {isSignedIn ? (
          <Button
            size="lg"
            className="border border-[#f59e0b]/50 bg-gradient-to-r from-[#b45309] to-[#d97706] px-10 py-6 text-lg text-[#fdf3e0] shadow-[0_0_35px_-8px_rgba(217,119,6,0.9)] transition hover:shadow-[0_0_45px_-6px_rgba(245,158,11,0.9)]"
            onClick={() => router.push("/dashboard")}
          >
            Return to your dashboard →
          </Button>
        ) : (
          <>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                className="border border-[#f59e0b]/50 bg-gradient-to-r from-[#b45309] to-[#d97706] px-10 py-6 text-lg text-[#fdf3e0] shadow-[0_0_35px_-8px_rgba(217,119,6,0.9)] transition hover:shadow-[0_0_45px_-6px_rgba(245,158,11,0.9)]"
              >
                Begin your search
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button
                variant="outline"
                size="lg"
                className="border-[#f59e0b]/40 bg-[#180f05]/40 px-10 py-6 text-lg text-[#fde68a] backdrop-blur-sm hover:bg-[#180f05]/70"
              >
                Create an account
              </Button>
            </Link>
          </>
        )}
      </motion.div>

      {/* feature panels */}
      <motion.div
        className="relative z-10 mt-24 grid w-full max-w-5xl gap-5 pb-28 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            className="group relative overflow-hidden rounded-none border border-[#f59e0b]/25 bg-[#180f05]/40 p-6 text-left backdrop-blur-md transition hover:border-[#fbbf24]/50"
            variants={{
              hidden: { opacity: 0, y: 36 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -4 }}
          >
            <div
              className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 opacity-30"
              style={{
                backgroundImage: `url("${GRID_BG}")`,
                backgroundSize: "40px 40px",
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/70 to-transparent opacity-0 group-hover:opacity-100"
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
            />
            <div className="mb-3 font-[family-name:var(--font-hud)] text-[10px] uppercase tracking-[0.25em] text-[#fde68a]/70">
              {feature.code}
            </div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#f59e0b]/25 bg-gradient-to-br from-[#b45309]/20 to-[#180f05]/40">
              <feature.icon className="h-5 w-5 text-[#fde68a]" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-[#fdf3e0]">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-[#fef3c7]/55">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
