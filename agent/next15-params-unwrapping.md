# Next.js 15 params Promise

- Khi gap canh bao `params` la Promise o Next.js 15 (dac biet client component), import `use` tu `react` roi `const { id } = use(params);`.
- Nho cap nhat kieu props: `params: Promise<{ id: string }>` de TypeScript khong bao loi.
- Giu thu tu hook on dinh (vd. `useRouter()` truoc `use(params)` van OK mien khong dieu kien).
