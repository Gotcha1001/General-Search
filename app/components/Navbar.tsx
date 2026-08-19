"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar() {
  return (
    <motion.nav
      className="relative flex items-center justify-between px-6 py-4 border-b bg-[#0a0603] border-[#f59e0b]/25 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.6)]"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile: trigger + compact logo, left-aligned */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger className="text-[#fde68a]" />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-black text-[#fdf3e0] tracking-tight"
        >
          <AnimatedTag className="text-xl" />
          <span className="bg-gradient-to-r from-[#b45309] via-[#fbbf24] to-[#d97706] bg-clip-text text-transparent">
            FindScout
          </span>
        </Link>
      </div>

      {/* Desktop: logo centered in the navbar itself, independent of sidebar width */}
      <Link
        href="/"
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 text-xl font-black text-[#fdf3e0] tracking-tight"
      >
        <AnimatedTag className="text-2xl" />
        <span className="bg-gradient-to-r from-[#b45309] via-[#fbbf24] to-[#d97706] bg-clip-text text-transparent">
          FindScout
        </span>
        <span className="text-[#fef3c7]/60 text-sm font-medium tracking-normal">
          Search anything, get answers fast
        </span>
      </Link>

      {/* Spacer so justify-between still pushes auth buttons right on desktop
          even though there's no left element there */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <SignedOut>
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="text-[#fef3c7]/80 hover:bg-[#180f05]/70 hover:text-[#fbbf24]"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="border border-[#f59e0b]/50 bg-gradient-to-r from-[#b45309] to-[#d97706] text-[#fdf3e0] shadow-[0_0_20px_-6px_rgba(217,119,6,0.9)] transition hover:shadow-[0_0_28px_-4px_rgba(245,158,11,0.9)]">
              Sign Up
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </motion.nav>
  );
}

function AnimatedTag({ className = "" }: { className?: string }) {
  return (
    <motion.span
      className={`inline-flex origin-bottom items-center ${className}`}
      initial={{ scale: 0, rotate: -15 }}
      animate={{
        scale: 1,
        rotate: [0, -6, 6, -4, 4, 0],
      }}
      transition={{
        scale: { type: "spring", stiffness: 300, damping: 15 },
        rotate: {
          delay: 0.4,
          duration: 4,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut",
        },
      }}
      whileHover={{ scale: 1.15, rotate: 8 }}
    >
      <Tag className="h-[1em] w-[1em] text-[#fde68a]" strokeWidth={2.5} />
    </motion.span>
  );
}
