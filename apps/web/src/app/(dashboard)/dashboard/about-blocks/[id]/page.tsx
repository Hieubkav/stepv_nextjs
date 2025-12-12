import { AboutBlockEditor } from "./about-block-editor.client";

export default async function AboutBlockEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AboutBlockEditor id={id} />;
}
