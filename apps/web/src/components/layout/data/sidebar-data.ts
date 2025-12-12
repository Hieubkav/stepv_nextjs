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
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  GraduationCap,
  ReceiptText,
  BookOpen,
  Cog,
  ShoppingCart
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
      title: 'CHÍNH',
      items: [
        { title: 'Tổng quan', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'QUẢN LÝ',
      items: [
        { title: 'Media', url: '/dashboard/media', icon: GalleryVerticalEnd },
        { title: 'Khóa học', url: '/dashboard/courses', icon: GraduationCap },
        { title: 'Khách hàng', url: '/dashboard/customers', icon: UserCog },
        { title: 'Đơn hàng', url: '/dashboard/orders', icon: ShoppingCart },
        {
          title: 'Dự án',
          icon: Construction,
          items: [
            { title: 'Danh sách', url: '/dashboard/project', icon: Construction },
            { title: 'Danh mục', url: '/dashboard/project-category', icon: ListTodo },
          ],
        },
        {
          title: 'Thư viện',
          icon: Package,
          items: [
            { title: 'Tài nguyên', url: '/dashboard/library', icon: Package },
            { title: 'Phần mềm', url: '/dashboard/library/software', icon: Monitor },
          ],
        },
        { title: 'VFX Store', url: '/dashboard/vfx', icon: Palette },
      ],
    },
    {
      title: 'CẤU HÌNH',
      items: [
        {
          title: 'Khối giao diện',
          icon: LayoutDashboard,
          items: [
            { title: 'Trang chủ', url: '/dashboard/home-blocks', icon: LayoutDashboard },
            { title: 'Trang About', url: '/dashboard/about-blocks', icon: LayoutDashboard },
          ],
        },
        { title: 'Cài đặt', url: '/dashboard/settings', icon: Cog },
      ],
    },
  ],
}
