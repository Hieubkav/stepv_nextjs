'use client';

import { createContext, useContext } from 'react';
import type { HomeBlock, SiteFooterProps, SiteHeaderProps } from '@/lib/site-layout';

export type SiteLayoutDataContextValue = {
  isLoading: boolean;
  blocks: HomeBlock[];
  contentBlocks: HomeBlock[];
  headerBlock?: HomeBlock;
  footerBlock?: HomeBlock;
  headerProps: Partial<SiteHeaderProps>;
  footerProps: Partial<SiteFooterProps>;
  settings?: unknown;
  page?: unknown;
  raw?: unknown;
};

export const SiteLayoutDataContext = createContext<SiteLayoutDataContextValue | undefined>(
  undefined,
);

export const useSiteLayoutData = () => {
  const context = useContext(SiteLayoutDataContext);
  if (!context) {
    throw new Error('useSiteLayoutData phai duoc goi ben trong SiteLayoutDataContext.Provider');
  }
  return context;
};
