import DashboardClient from './DashboardClient';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Force dynamic rendering for dashboard page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardClient />
    </ErrorBoundary>
  );
}
