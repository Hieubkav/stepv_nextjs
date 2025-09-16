"use client";

import { Suspense } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ConvexProvider client={convex}>
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        {children}
      </ConvexProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}