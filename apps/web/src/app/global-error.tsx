"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Đã xảy ra lỗi</h1>
          <p className="mt-4 text-lg">Có lỗi xảy ra khi tải trang</p>
          <button
            onClick={reset}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
