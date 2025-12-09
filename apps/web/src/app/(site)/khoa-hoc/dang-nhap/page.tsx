import type { Route } from "next";
import { redirect } from 'next/navigation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function KhoaHocLoginRedirect({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = searchParams ? await searchParams : {};
  const nextParam = resolved?.next;
  const next =
    typeof nextParam === 'string'
      ? nextParam
      : Array.isArray(nextParam) && nextParam.length > 0
      ? nextParam[0]
      : '/khoa-hoc';

  const target = `/login?next=${encodeURIComponent(next)}` as Route;
  redirect(target);
}
