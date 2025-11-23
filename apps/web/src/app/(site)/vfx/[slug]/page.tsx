import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@dohy/backend/convex/_generated/api";
import VfxDetailView from "@/features/vfx/vfx-detail-view";
import type { VfxProductDoc } from "@/features/vfx/types";
import { createMetadata, generateCanonicalUrl, truncateDescription } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ slug: string }>;

async function loadInitialVfx(slug: string): Promise<VfxProductDoc | null | undefined> {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Thiếu CONVEX_URL nên không thể preload VFX");
    return undefined;
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const product = (await client.query(api.vfx.getVfxProductBySlug, { slug })) as VfxProductDoc | null;
    return product;
  } catch (error) {
    console.error("Không thể preload VFX detail", error);
    return undefined;
  }
}

export async function generateMetadata(
  { params }: { params: PageParams },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadInitialVfx(slug);

  const title = product?.title ? `${product.title} | DOHY Media` : "VFX | DOHY Media";
  const description = truncateDescription(
    product?.description || product?.subtitle || "Hiệu ứng VFX ngắn 1-5s từ DOHY Media",
  );

  return createMetadata({
    title,
    description,
    keywords: ["vfx", product?.title || "hiệu ứng"],
    url: generateCanonicalUrl(`/vfx/${slug}`),
  });
}

export default async function VfxDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = await loadInitialVfx(slug);

  if (product === null) {
    notFound();
  }

  return <VfxDetailView slug={slug} initialProduct={product ?? undefined} />;
}
