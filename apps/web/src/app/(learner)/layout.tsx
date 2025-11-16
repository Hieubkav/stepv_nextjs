import type { ReactNode } from "react";
import LearnerLayoutClient from "./learner-layout-client";

export const dynamic = "force-dynamic";

export default function LearnerRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <LearnerLayoutClient>{children}</LearnerLayoutClient>;
}
