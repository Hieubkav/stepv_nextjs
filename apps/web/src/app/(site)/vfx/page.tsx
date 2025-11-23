import type { Metadata } from "next";
import VfxListView from "@/features/vfx/vfx-list-view";
import { createMetadata, generateCanonicalUrl } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Hiệu ứng VFX | DOHY Media",
  description: "Kho VFX 1-5s sẵn sàng kéo thả cho quảng cáo, motion và video. Xem preview, tải về hoặc mua bản premium.",
  keywords: ["vfx", "hiệu ứng", "motion", "video", "dohy"],
  url: generateCanonicalUrl("/vfx"),
});

export default function VfxPage() {
  return <VfxListView />;
}
