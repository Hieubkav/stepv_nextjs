import type { Metadata } from "next";
import ProjectListView from "@/features/projects/project-list-view";
import { createMetadata, generateCanonicalUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Dự án | DOHY Media",
  description: "Danh sách các dự án tiêu biểu của DOHY Media.",
  url: generateCanonicalUrl("/project"),
});

export default function ProjectPage() {
  return <ProjectListView />;
}

