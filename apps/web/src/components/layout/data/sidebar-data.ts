import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  GraduationCap,
  ReceiptText
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    { name: 'Shadcn Admin', logo: Command, plan: 'Next + ShadcnUI' },
    { name: 'Acme Inc', logo: GalleryVerticalEnd, plan: 'Enterprise' },
    { name: 'Acme Corp.', logo: AudioWaveform, plan: 'Startup' },
  ],
  navGroups: [
    {
      title: 'Chung',
      items: [
        { title: 'Tổng quan', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Media', url: '/dashboard/media', icon: GalleryVerticalEnd },
        { title: 'Thư viện', url: '/dashboard/library', icon: Package },
        { title: 'Phần mềm', url: '/dashboard/library/software', icon: Monitor },
        { title: 'Khóa học', url: '/dashboard/courses', icon: GraduationCap },
        { title: 'Học viên', url: '/dashboard/students', icon: Users },
        { title: 'Đơn hàng', url: '/dashboard/order', icon: ReceiptText },
        { title: 'Khối giao diện', url: '/dashboard/home-blocks', icon: LayoutDashboard },
        { title: 'Cài đặt', url: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
}
