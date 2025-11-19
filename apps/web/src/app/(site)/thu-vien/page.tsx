import type { Metadata } from "next";
import LibraryListView from "@/features/library/library-list-view";
import { createMetadata } from "@/lib/seo/metadata";
import { generateCanonicalUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Thư viện tài nguyên | DOHY Media",
  description: "Khám phá thư viện tài nguyên, hướng dẫn và công cụ dành cho thiết kế 3D và sản phẩm quang cáo từ DOHY Media.",
  keywords: ["thư viện", "tài nguyên", "design tools", "hướng dẫn"],
  url: generateCanonicalUrl("/thu-vien"),
});

export default function LibraryListPage() {
  return <LibraryListView />;
}
