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
      {/* Dashboard Header - Hoàn toàn riêng biệt */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  <i className="fas fa-tachometer-alt text-blue-600 mr-2"></i>
                  Dashboard
                </h1>
              </div>
              <div className="hidden md:block ml-6">
                <div className="text-sm text-gray-500">
                  Step V Studio - Quản lý dữ liệu Supabase
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <i className="fas fa-database mr-1"></i>
                Supabase Connected
              </div>
              <a
                href="/"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-home mr-2"></i>
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Dashboard Footer - Riêng biệt */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 Step V Studio Dashboard
            </div>
            <div className="text-sm text-gray-500">
              Powered by Supabase & Next.js
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
