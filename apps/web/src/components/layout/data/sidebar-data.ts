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
        { title: 'Tong quan', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Media', url: '/dashboard/media', icon: GalleryVerticalEnd },
        { title: 'Thu vien', url: '/dashboard/library', icon: Package },
        { title: 'Phan mem', url: '/dashboard/library/software', icon: Monitor },
        { title: 'Khoi giao dien', url: '/dashboard/home-blocks', icon: LayoutDashboard },
        { title: 'Cai dat', url: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
}
