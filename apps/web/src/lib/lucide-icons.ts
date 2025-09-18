import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bot,
  Camera,
  CheckCircle2,
  Clock3,
  Code,
  Cog,
  Box,
  DollarSign,
  Facebook,
  Film,
  Gem,
  Globe,
  Instagram,
  Lightbulb,
  Linkedin,
  Megaphone,
  Music4,
  Palette,
  PenTool,
  PlayCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Twitter,
  Users,
  Video,
  Youtube,
} from "lucide-react";

type IconEntry = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

const ICON_ENTRIES = [
  { value: "DollarSign", label: "Chi phi", Icon: DollarSign },
  { value: "Video", label: "Video", Icon: Video },
  { value: "Film", label: "Film", Icon: Film },
  { value: "Clock3", label: "Thoi gian", Icon: Clock3 },
  { value: "Gem", label: "Cao cap", Icon: Gem },
  { value: "Lightbulb", label: "Y tuong", Icon: Lightbulb },
  { value: "Sparkles", label: "Sang tao", Icon: Sparkles },
  { value: "Megaphone", label: "Thong diep", Icon: Megaphone },
  { value: "Code", label: "Cong nghe", Icon: Code },
  { value: "Cog", label: "Dieu chinh", Icon: Cog },
  { value: "Bot", label: "AI", Icon: Bot },
  { value: "Box", label: "Mo phong", Icon: Box },
  { value: "PenTool", label: "Thiet ke", Icon: PenTool },
  { value: "PlayCircle", label: "Play", Icon: PlayCircle },
  { value: "Search", label: "Tim kiem", Icon: Search },
  { value: "CheckCircle2", label: "Hoan thanh", Icon: CheckCircle2 },
  { value: "ShieldCheck", label: "Tin cay", Icon: ShieldCheck },
  { value: "Users", label: "Nguoi dung", Icon: Users },
  { value: "Award", label: "Danh gia", Icon: Award },
  { value: "Target", label: "Muc tieu", Icon: Target },
  { value: "Rocket", label: "Tang truong", Icon: Rocket },
  { value: "Music4", label: "Am nhac", Icon: Music4 },
  { value: "Palette", label: "Mau sac", Icon: Palette },
  { value: "Camera", label: "Camera", Icon: Camera },
  { value: "Globe", label: "Toan cau", Icon: Globe },
  { value: "Youtube", label: "YouTube", Icon: Youtube },
  { value: "Facebook", label: "Facebook", Icon: Facebook },
  { value: "Instagram", label: "Instagram", Icon: Instagram },
  { value: "Twitter", label: "Twitter", Icon: Twitter },
  { value: "Linkedin", label: "LinkedIn", Icon: Linkedin },
] satisfies readonly IconEntry[];

export type IconKey = (typeof ICON_ENTRIES)[number]["value"];

export interface IconOption {
  value: IconKey;
  label: string;
  Icon: LucideIcon;
}

export const ICON_OPTIONS: IconOption[] = ICON_ENTRIES.map((entry) => ({
  value: entry.value as IconKey,
  label: entry.label,
  Icon: entry.Icon,
}));

export const ICON_ONE_OF = ICON_ENTRIES.map((entry) => ({
  const: entry.value as IconKey,
  title: entry.label,
}));

export const ICON_MAP: Record<IconKey, LucideIcon> = ICON_ENTRIES.reduce(
  (acc, entry) => {
    acc[entry.value as IconKey] = entry.Icon;
    return acc;
  },
  {} as Record<IconKey, LucideIcon>,
);

const DEFAULT_ICON = Sparkles;

export function getLucideIcon(key?: string): LucideIcon {
  if (!key) {
    return DEFAULT_ICON;
  }

  return ICON_MAP[key as IconKey] ?? DEFAULT_ICON;
}
