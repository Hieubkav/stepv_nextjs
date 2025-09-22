import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@dohy/backend/convex/_generated/api";
import LibraryDetailView from "@/features/library/library-detail-view";
import type { LibraryResourceDetail } from "@/features/library/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadInitialDetail(
  slug: string,
): Promise<LibraryResourceDetail | null | undefined> {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Không tìm thấy CONVEX_URL để preload detail");
    return undefined;
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const detail = await client.query(api.library.getResourceDetail, {
      slug,
      includeInactive: false,
    });
    return detail as LibraryResourceDetail | null;
  } catch (error) {
    console.error("Không thể preload library detail", error);
    return undefined;
  }
}

export default async function LibraryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await loadInitialDetail(slug);

  if (detail === null) {
    notFound();
  }

  return <LibraryDetailView slug={slug} initialDetail={detail} />;
}

