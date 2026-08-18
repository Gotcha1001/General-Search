"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { AppSidebar } from "@/app/components/Appsidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicReport = pathname.startsWith("/report");

  if (isPublicReport) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-auto bg-transparent">
            <main className="min-h-full bg-transparent p-4 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
