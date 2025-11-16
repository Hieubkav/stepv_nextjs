'use client';

import SiteHeaderSection from "@/components/sections/SiteHeaderSection";
import { useSiteLayoutData } from "@/context/site-layout-data";

export function CourseHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | null;
}) {
  void title;
  void subtitle;

  const { headerProps } = useSiteLayoutData();

  return <SiteHeaderSection {...headerProps} />;
}
