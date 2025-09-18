# Hero Logos Fix Notes

- Prod hero logos missing because Next Image blocked Convex storage domain; added domain from `NEXT_PUBLIC_CONVEX_URL` into image allowlist.
- Hero logos doubled for small sets due to marquee duplication; component now skips loop when `logos.length <= 3` and reuses a helper renderer.
- Keep in mind to re-run `bun run --cwd apps/web lint` or similar after updates, and remind user to build with `bun run --cwd apps/web build` when ready.
