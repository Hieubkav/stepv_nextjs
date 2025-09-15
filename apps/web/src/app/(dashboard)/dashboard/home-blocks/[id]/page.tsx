import { use } from "react";
import { HomeBlockEditor } from "./home-block-editor.client";

export default function HomeBlockEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <HomeBlockEditor id={id} />;
}
