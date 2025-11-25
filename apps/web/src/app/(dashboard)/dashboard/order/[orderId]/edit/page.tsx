import { redirect } from "next/navigation";

type OrderEditRedirectProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderEditRedirect({ params }: OrderEditRedirectProps) {
  const { orderId } = await params;
  redirect(`/dashboard/orders/${orderId}`);
}
