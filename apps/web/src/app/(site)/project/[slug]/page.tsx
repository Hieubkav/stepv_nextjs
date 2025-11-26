import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@dohy/backend/convex/_generated/api";
import ProjectDetailView from "@/features/projects/project-detail-view";
import type { ProjectDetail } from "@/features/projects/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadInitialDetail(slug: string): Promise<ProjectDetail | null | undefined> {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Không tìm thấy CONVEX_URL để preload project detail");
    return undefined;
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const detail = await client.query(api.projects.getProjectDetail, {
      slug,
      includeInactive: false,
    });
    return detail as ProjectDetail | null;
  } catch (error) {
    console.error("Không thể preload project detail", error);
    return undefined;
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await loadInitialDetail(slug);

  if (detail === null) {
    notFound();
  }

  return <ProjectDetailView slug={slug} initialDetail={detail} />;
}

