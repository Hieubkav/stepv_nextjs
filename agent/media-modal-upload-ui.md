# Media Modal Upload UI

- Popup upload form had single column that pushed submit button out of view when preview tall; also list lacked own scroll.
- Dialog now wider with split layout: left column handles dropzone/preview/actions, right column shows recent media with dedicated scroll area and item count.
- Modal height locked to 80vh with overflow handling so recent list always shows scrollbar when exceeding space.
- Added helper to validate image selection, reused list sorting type, removed load-more state so submit button stays fixed.
- Text strings normalized to ASCII to avoid mojibake, keep to same style if updating copy.
- When done testing, run `bunx tsc --project apps/web/tsconfig.json --noEmit`; only trigger `bun run --cwd apps/web build` when user asks.
