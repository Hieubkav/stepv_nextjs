import { redirect } from "next/navigation";

type OrderDetailRedirectProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailRedirect({ params }: OrderDetailRedirectProps) {
  const { orderId } = await params;
  redirect(`/dashboard/orders/${orderId}`);
}
