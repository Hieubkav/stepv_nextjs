'use client';

import { api } from '@/.source';
import { useQuery } from 'convex/react';
import { useAuth } from '@/features/learner/auth/student-auth-context';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

export default function StatsPage() {
  const router = useRouter();
  const { student } = useAuth();

  const stats = useQuery(
    api.progress.getLearnerStats,
    student ? { studentId: student._id } : 'skip',
    { enabled: !!student }
  );

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Vui lòng đăng nhập để xem thống kê</p>
            <button
              onClick={() => router.push('/khoa-hoc/dang-nhap')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stats === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-600">Đang tải thống kê...</div>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      label: 'Khóa học đã đăng ký',
      value: stats.totalCoursesEnrolled,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      label: 'Khóa học hoàn thành',
      value: stats.completedCourses,
      subtext: `${stats.totalCoursesEnrolled > 0 ? Math.round((stats.completedCourses / stats.totalCoursesEnrolled) * 100) : 0}% của tổng số`,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      label: 'Khóa học đang học',
      value: stats.inProgressCourses,
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      label: 'Tổng thời gian xem',
      value: `${stats.totalWatchTimeHours}h`,
      subtext: `${Math.round(stats.totalWatchTimeSeconds / 60)} phút`,
      color: 'from-violet-500 to-violet-600',
    },
    {
      icon: <Award className="w-8 h-8" />,
      label: 'Chứng chỉ đạt được',
      value: stats.certificatesEarned,
      color: 'from-rose-500 to-rose-600',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      label: 'Tỷ lệ hoàn thành trung bình',
      value: `${stats.averageCompletionPercent}%`,
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

        .stat-card-gradient {
          position: relative;
          overflow: hidden;
        }

        .stat-card-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }

        .stat-card-gradient::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        .stat-card:nth-child(5) { animation-delay: 0.5s; }
        .stat-card:nth-child(6) { animation-delay: 0.6s; }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .achievement-glow {
          position: relative;
        }

        .achievement-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .progress-ring {
          width: 100%;
          height: 100%;
          transform: scaleX(-1);
        }

        .progress-ring-circle {
          transition: stroke-dashoffset 0.35s;
          transform-origin: 50% 50%;
        }

        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -2px;
        }

        .motivational-text {
          background: linear-gradient(135deg, #4b5563 0%, #2d3748 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-fadeInDown">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
            <h1 className="header-title">Thống kê học tập</h1>
          </div>
          <p className="motivational-text text-lg font-medium">
            Hành trình học tập của bạn - từng bước tiến gần hơn đến thành công 🚀
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div
                className={`stat-card-gradient bg-gradient-to-br ${stat.color} rounded-2xl p-8 text-white shadow-lg hover-lift transition-all duration-300 cursor-default`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <div className="text-white opacity-90">
                      {stat.icon}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="stat-value text-white">
                    {stat.value}
                  </div>
                  <div className="stat-label text-white opacity-95">
                    {stat.label}
                  </div>
                  {stat.subtext && (
                    <div className="text-sm opacity-80 font-medium">
                      {stat.subtext}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Section */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="header-title mb-8">Điểm nổi bật</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Achievement 1 */}
            {stats.completedCourses > 0 && (
              <div className="achievement-glow bg-white rounded-2xl p-8 shadow-md hover-lift transition-all duration-300">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Người học tích cực
                </h3>
                <p className="text-gray-600">
                  Bạn đã hoàn thành {stats.completedCourses} khóa học. Hãy tiếp tục nỗ lực!
                </p>
              </div>
            )}

            {/* Achievement 2 */}
            {stats.totalWatchTimeHours >= 10 && (
              <div className="achievement-glow bg-white rounded-2xl p-8 shadow-md hover-lift transition-all duration-300">
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Người học kiên trì
                </h3>
                <p className="text-gray-600">
                  Bạn đã học {stats.totalWatchTimeHours} giờ. Thành tích đáng tuyên dương!
                </p>
              </div>
            )}

            {/* Achievement 3 */}
            {stats.certificatesEarned >= 3 && (
              <div className="achievement-glow bg-white rounded-2xl p-8 shadow-md hover-lift transition-all duration-300">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Chứng chỉ nhân
                </h3>
                <p className="text-gray-600">
                  Bạn đã đạt {stats.certificatesEarned} chứng chỉ. Bạn là siêu sao! ⭐
                </p>
              </div>
            )}

            {/* Achievement Placeholder */}
            {stats.completedCourses === 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-dashed border-blue-300">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-bold text-lg text-blue-900 mb-2">
                  Hãy bắt đầu
                </h3>
                <p className="text-blue-700">
                  Hoàn thành một khóa học để mở khóa thành tích đầu tiên!
                </p>
              </div>
            )}

            {stats.totalWatchTimeHours < 10 && stats.totalWatchTimeHours > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 border-2 border-dashed border-amber-300">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-bold text-lg text-amber-900 mb-2">
                  Gần đến nữa rồi
                </h3>
                <p className="text-amber-700">
                  Học thêm {10 - stats.totalWatchTimeHours} giờ nữa để đạt thành tích tiếp theo!
                </p>
              </div>
            )}

            {stats.certificatesEarned < 3 && stats.certificatesEarned > 0 && (
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-8 border-2 border-dashed border-rose-300">
                <div className="text-4xl mb-4">🎖️</div>
                <h3 className="font-bold text-lg text-rose-900 mb-2">
                  Tiếp tục nỗ lực
                </h3>
                <p className="text-rose-700">
                  Đạt thêm {3 - stats.certificatesEarned} chứng chỉ để trở thành siêu sao!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Motivation Section */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 font-serif">
              💡 Lời khuyến khích
            </h3>
            <p className="text-lg leading-relaxed opacity-95">
              Mỗi khóa học bạn hoàn thành là một bước tiến trong hành trình phát triển bản thân.
              Hãy tiếp tục học hỏi, khám phá những điều mới và tin rằng bạn sẽ đạt được những
              điều tuyệt vời. Thành công không phải là điểm kết thúc, mà là một quá trình liên tục
              của sự cải thiện và tăng trưởng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
