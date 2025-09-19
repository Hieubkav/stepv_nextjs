'use client';

import { useMemo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { SiteLayoutDataContext } from '@/context/site-layout-data';
import {
  mapSiteFooterProps,
  mapSiteHeaderProps,
  partitionSiteLayoutBlocks,
  type HomeBlock,
} from '@/lib/site-layout';

const SiteHeaderSection = dynamic(() => import('@/components/sections/SiteHeaderSection'), {
  ssr: false,
  loading: () => (
    <div className="h-24 bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

const SiteFooterSection = dynamic(() => import('@/components/sections/SiteFooterSection'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-black flex items-center justify-center">
      <div className="text-white">Dang tai...</div>
    </div>
  ),
});

type SiteLayoutClientProps = {
  children: ReactNode;
};

const SiteLayoutClient = ({ children }: SiteLayoutClientProps) => {
  const homepage = useQuery(api.homepage.getHomepage, { slug: 'home' });
  const blocks = useMemo(() => (homepage?.blocks ?? []) as HomeBlock[], [homepage?.blocks]);

  const { headerBlock, footerBlock, contentBlocks } = useMemo(
    () => partitionSiteLayoutBlocks(blocks),
    [blocks],
  );

  const headerProps = useMemo(() => mapSiteHeaderProps(headerBlock?.data), [headerBlock?.data]);
  const footerProps = useMemo(() => mapSiteFooterProps(footerBlock?.data), [footerBlock?.data]);

  const isLoading = homepage === undefined;

  const contextValue = useMemo(
    () => ({
      isLoading,
      blocks,
      contentBlocks,
      headerBlock,
      footerBlock,
      headerProps,
      footerProps,
      settings: homepage?.settings,
      page: homepage?.page,
      raw: homepage,
    }),
    [
      isLoading,
      blocks,
      contentBlocks,
      headerBlock,
      footerBlock,
      headerProps,
      footerProps,
      homepage?.settings,
      homepage?.page,
      homepage,
    ],
  );

  return (
    <SiteLayoutDataContext.Provider value={contextValue}>
      <div className="flex flex-col min-h-screen font-sans antialiased">
        <SiteHeaderSection {...headerProps} />
        <main className="flex-1">{children}</main>
        <SiteFooterSection {...footerProps} />
      </div>
    </SiteLayoutDataContext.Provider>
  );
};

export default SiteLayoutClient;
