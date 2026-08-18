// app/dashboard/layout.tsx
"use client";

import { AppBackground } from "@/app/components/AppBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppBackground>{children}</AppBackground>;
}
