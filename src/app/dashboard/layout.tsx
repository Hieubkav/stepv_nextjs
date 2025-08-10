import Link from 'next/link';

export const metadata = {
  title: "Dashboard - Step V Studio",
  description: "Quản lý dữ liệu Supabase - Step V Studio Dashboard",
  robots: "noindex, nofollow", // Không cho search engine index dashboard
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  <i className="fas fa-tachometer-alt text-blue-600 mr-1 sm:mr-2"></i>
                  <span className="hidden xs:inline">Dashboard</span>
                  <span className="xs:hidden">DB</span>
                </h1>
              </div>
              <div className="hidden lg:block ml-4 xl:ml-6">
                <div className="text-sm text-gray-500">
                  Step V Studio - Quản lý dữ liệu Supabase
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-xs sm:text-sm text-gray-500">
                <i className="fas fa-database mr-1"></i>
                <span className="hidden md:inline">Supabase </span>Connected
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-home mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Về trang chủ</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Dashboard Footer - Mobile Optimized */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-3 sm:py-4 px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2025 Step V Studio Dashboard
            </div>
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
              Powered by Supabase & Next.js
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
