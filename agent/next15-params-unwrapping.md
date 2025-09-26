# Next.js 15 params Promise

- Khi gap canh bao `params` la Promise o Next.js 15 (dac biet client component), import `use` tu `react` roi `const { id } = use(params)`.
- Nho cap nhat kieu props: `params: Promise<{ id: string }>` de TypeScript khong bao loi.
- Giu thu tu hook on dinh (vd. `useRouter()` truoc `use(params)` van OK mien khong dieu kien).
- Neu dang o server component (page.tsx), khai bao props la Promise va de function async: `type Props = { params: Promise<{ id: string }> };` sau do `const { ... } = await params`.
