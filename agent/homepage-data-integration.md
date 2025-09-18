# Homepage DB Integration Notes

- `apps/web/src/app/(site)/page.tsx` now renders blocks directly from `api.homepage.getHomepage({ slug: 'home' })`.
- Helper mappers (`mapHeroProps`, `mapServicesProps`, ...) clean Convex block data to match section props; only defined values are passed so component defaults still work.
- If dashboard blocks are empty, UI shows a plain warning instead of static fallback. Seed data via `dashboard/home-blocks` before verifying UI.
- Services block expects `items[].description`; mapper copies it to `desc`. Add missing fields in Convex if new sections appear.
- When adding section kinds, extend the `switch` in `page.tsx` with a new mapper.
