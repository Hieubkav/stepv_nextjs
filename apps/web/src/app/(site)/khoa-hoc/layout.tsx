"use client";

import { StudentAuthProvider } from "@/features/learner/auth";

export default function KhoaHocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentAuthProvider>{children}</StudentAuthProvider>;
}
