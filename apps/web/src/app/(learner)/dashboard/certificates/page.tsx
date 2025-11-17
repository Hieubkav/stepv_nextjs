'use client';

import { api } from '@dohy/backend/convex/_generated/api';
import { useConvex, useQuery } from 'convex/react';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CertificatesPage() {
  const router = useRouter();
  const { student } = useStudentAuth();
  const convex = useConvex();

  const certificates = useQuery(
    api.certificates.getStudentCertificates,
    student ? { studentId: student._id } : 'skip'
  );

  const handleDownload = async (certificateId: string) => {
    try {
      // Gọi API để lấy certificate metadata
      const certData = await convex.query(api.certificates.downloadCertificate, {
        certificateId: certificateId as any,
      });

      // Tạo PDF và download (cần library html2pdf hoặc tương tự)
      // TODO: Implement PDF generation
      window.alert('Tính năng download PDF sẽ được cập nhật sớm');
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Vui lòng đăng nhập để xem chứng chỉ</p>
            <Button onClick={() => router.push('/khoa-hoc/dang-nhap')} className="mt-4">
              Đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (certificates === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-600">Đang tải chứng chỉ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Chứng chỉ của tôi</h1>
          </div>
          <p className="text-gray-600">
            Bạn có <span className="font-bold">{certificates.length}</span> chứng chỉ hoàn thành khóa học
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có chứng chỉ nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hoàn thành một khóa học để nhận chứng chỉ
            </p>
            <Button onClick={() => router.push('/khoa-hoc')} variant="outline">
              Khám phá khóa học
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert: any) => (
              <Card
                key={cert.certificateId}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white relative">
                  <div className="absolute top-2 right-2">
                    <Award className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold opacity-90 mb-2">Chứng chỉ hoàn thành</div>
                    <h3 className="text-lg font-bold truncate">{cert.courseName}</h3>
                    <div className="text-xs opacity-75 mt-4">
                      Mã: {cert.certificateCode}
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Khóa học</span>
                      <p className="text-sm font-semibold text-gray-900">{cert.courseName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Ngày phát</span>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {cert.expiresAt && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Hết hạn</span>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(cert.expiresAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(cert.certificateId)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const text = `Tôi vừa hoàn thành khóa "${cert.courseName}" tại DOHY! 🎉\nMã chứng chỉ: ${cert.certificateCode}`;
                        navigator.clipboard.writeText(text);
                        window.alert('Đã sao chép!');
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.print()}
                    >
                      In
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
