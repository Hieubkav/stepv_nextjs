import type { Route } from "next";
import { redirect } from 'next/navigation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function StudentOrdersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = searchParams ? await searchParams : {};
  const orderIdParam = resolved?.orderId;
  const highlightOrderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  const target = (highlightOrderId
    ? `/don-dat?orderId=${encodeURIComponent(highlightOrderId)}`
    : '/don-dat') as Route;

  redirect(target);
}
