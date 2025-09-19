
# 2025-09-20 Site layout header/footer sharing

- Tao `apps/web/src/lib/site-layout.ts` de map block Convex -> props chung cho header/footer (tai su dung duoc ca FE + layout).
- Tao context `useSiteLayoutData` + client layout `site-layout-client.tsx` de query Convex 1 lan va chia se block cho cac page trong (site).
- Layout server `layout.tsx` goi client layout wrapping children, nen moi page duoc header/footer dong.
- `Home` page nay dung context (khong goi `useQuery`), bo case header/footer ra khoi render list.
- Cap nhat `SiteHeaderSection` + `SiteFooterSection` su dung type share de tranh sai khac props.

Ghi nho: neu tao page moi trong (site), co the dung `useSiteLayoutData()` de lay `contentBlocks` hoac `headerProps`. Neu can slug khac -> mo rong site-layout-client (todo doc: watch).
