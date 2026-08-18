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
      className="relative flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-gray-200 dark:border-green-900/30 shadow-sm"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile: trigger + compact logo, left-aligned */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-black text-black dark:text-white tracking-tight"
        >
          <AnimatedTag className="text-xl" />
          <span className="text-indigo-500">FindScout</span>
        </Link>
      </div>

      {/* Desktop: logo centered in the navbar itself, independent of sidebar width */}
      <Link
        href="/"
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 text-xl font-black text-black dark:text-white tracking-tight"
      >
        <AnimatedTag className="text-2xl" />
        <span className="text-indigo-500">FindScout</span>
        <span className="text-purple-500 text-sm font-medium tracking-normal">
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
              className="text-gray-700 dark:text-gray-200 hover:text-red-600"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-500">
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
      <Tag className="h-[1em] w-[1em] text-indigo-500" strokeWidth={2.5} />
    </motion.span>
  );
}
