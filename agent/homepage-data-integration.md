# Homepage DB Integration Notes

- `apps/web/src/app/(site)/page.tsx` now renders blocks directly from `api.homepage.getHomepage({ slug: 'home' })`.
- Helper mappers (`mapHeroProps`, `mapServicesProps`, ...) clean Convex block data to match section props; only defined values are passed so component defaults still work.
- If dashboard blocks are empty, UI shows a plain warning instead of static fallback. Seed data via `dashboard/home-blocks` before verifying UI.
- Services block expects `items[].description`; mapper copies it to `desc`. Add missing fields in Convex if new sections appear.
- When adding section kinds, extend the `switch` in `page.tsx` with a new mapper.

- 2025-09-18: Layout no longer renders the legacy static `Header`; homepage relies on Convex `siteHeader` block, with fallback `SiteHeaderSection` injected when no block is returned.
- 2025-09-18: SiteHeaderSection now mirrors the legacy sticky header + mobile overlay; defaults cover menu/social/CTA when Convex data missing.
- 2025-09-18: Header shells use glassmorphism (rounded, blurred) for both top & sticky states; reuse gradient background when block supplies an image.
- 2025-09-18: Collapsed twin headers into one dynamic shell (transparent when top, floating rounded when scrolled) to remove gap at viewport.
- 2025-09-18: SiteHeader block form dùng widget mediaImage cho logo/background; hiển thị preview + chọn từ media library.
- 2025-09-18: ContactForm section restyled to match dark+gold palette (gradient background, glass cards, consistent inputs/buttons).
- 2025-09-18: Added careSection block (glass gradient hero) + removed hardcoded footer CTA.
- 2025-09-18: Layout footer component now null-rendered; block-based footer handles all content (layout acts as fallback only if re-enabled).
- 2025-09-18: careSection component+template now rely solely on dashboard data (no hardcoded title/description/button).
