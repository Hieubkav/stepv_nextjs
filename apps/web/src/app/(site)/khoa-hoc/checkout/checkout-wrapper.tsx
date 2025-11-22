'use client';

import { CheckoutPageContent } from './checkout-page-content';
import type { CheckoutPageContentProps } from './checkout-page-content';

export function CheckoutWrapper(props: CheckoutPageContentProps) {
  return <CheckoutPageContent {...props} />;
}
