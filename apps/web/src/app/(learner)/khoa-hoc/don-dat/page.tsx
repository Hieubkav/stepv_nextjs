import OrdersPageClient from './orders-page-client';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function StudentOrdersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = searchParams ? await searchParams : {};
  const orderIdParam = resolved?.orderId;
  const highlightOrderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  return <OrdersPageClient highlightOrderId={typeof highlightOrderId === 'string' ? highlightOrderId : undefined} />;
}
