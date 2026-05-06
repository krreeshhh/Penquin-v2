import React from "react";
import {
  AppWindow,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Bug,
  CircleDot,
  Clapperboard,
  ClipboardList,
  Code2,
  Cpu,
  FileBadge,
  FileCode2,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Gamepad2,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  KeyRound,
  Laptop,
  Link2,
  LucideIcon,
  Microscope,
  Monitor,
  Newspaper,
  PlayCircle,
  Presentation,
  Search,
  Settings,
  Shield,
  TerminalSquare,
  Trophy,
  Tv,
  UserRound,
  Users,
  Video,
  Wallet,
  Wrench,
  FileVideo,
  GitBranch,
  Zap,
} from "lucide-react";

type DocIconInput = {
  emoji?: string;
  icon?: string;
};

const namedIconMap: Record<string, LucideIcon> = {
  android: AppWindow,
  computer: Monitor,
  "user-robot": Cpu,
  github: GitBranch, // Fallback if needed
  zap: Zap,
};

const domainIconMap: Record<string, LucideIcon> = {
  "github.com": GitBranch,
  "youtube.com": Video,
  "youtu.be": Video,
  "twitter.com": Shield, // Twitter/X often uses shield or custom
  "x.com": Shield,
  "medium.com": Newspaper,
  "hackerone.com": Shield,
  "bugcrowd.com": Bug,
  "intigriti.com": Shield,
  "discord.com": Users,
  "discord.gg": Users,
  "google.com": Search,
};

const emojiIconMap: Record<string, LucideIcon> = {
  "👋": UserRound,
  "🧾": FileSpreadsheet,
  "📗": BookOpen,
  "📀": FileVideo,
  "📺": Tv,
  "👀": Search,
  "🏅": Award,
  "🎖️": Award,
  "🥈": Trophy,
  "🥉": Trophy,
  "👩‍💻": Code2,
  "🔮": Shield,
  "🎴": ClipboardList,
  "😼": TerminalSquare,
  "🟧": AppWindow,
  "🎥": Video,
  "❤️": Heart,
  "📰": Newspaper,
  "📚": BookOpen,
  "🏹": GitBranch,
  "👨‍👨‍👧": Users,
  "🖨️": FileSearch,
  "⚙️": Settings,
  "🎱": Bug,
  "🪀": Wrench,
  "🏈": Shield,
  "🪁": Hammer,
  "🎹": TerminalSquare,
  "🟥": Clapperboard,
  "📑": FileText,
  "✅": BadgeCheck,
  "🐞": Bug,
  "🥼": Microscope,
  "🛠️": Wrench,
  "🏠": Home,
  "💵": Wallet,
  "🕹️": Gamepad2,
  "🍎": PlayCircle,
  "0️⃣": CircleDot,
  "1️⃣": CircleDot,
  "2️⃣": CircleDot,
  "3️⃣": CircleDot,
  "4️⃣": CircleDot,
  "5️⃣": CircleDot,
  "6️⃣": CircleDot,
  "7️⃣": CircleDot,
  "8️⃣": CircleDot,
  "9️⃣": CircleDot,
  "🔟": CircleDot,
  "🚡": ArrowRight,
  "🚠": ArrowRight,
  "🚟": ArrowRight,
  "🟢": BadgeCheck,
  "🔴": CircleDot,
  "🟡": CircleDot,
  "🟠": CircleDot,
  "⚫": CircleDot,
  "🟣": CircleDot,
  "🧻": FileText,
  "0️": CircleDot,
  "🌩️": Shield,
  "1️": CircleDot,
  "2️": CircleDot,
  "3️": CircleDot,
  "🍪": FileBadge,
  "🥂": Users,
  "💿": FileCode2,
};

export function resolveDocIcon(input: DocIconInput & { domain?: string }, fallback: LucideIcon = FileText) {
  if (input.domain) {
    const domain = input.domain.toLowerCase().replace(/^www\./, "");
    if (domainIconMap[domain]) return domainIconMap[domain];
  }
  if (input.icon && namedIconMap[input.icon]) return namedIconMap[input.icon];
  if (input.emoji && emojiIconMap[input.emoji]) return emojiIconMap[input.emoji];
  return fallback;
}

export function DocIcon({
  emoji,
  icon,
  domain,
  fallback = FileText,
  className,
  strokeWidth = 2.1,
}: DocIconInput & { domain?: string; fallback?: LucideIcon; className?: string; strokeWidth?: number }) {
  return React.createElement(resolveDocIcon({ emoji, icon, domain }, fallback), {
    className,
    strokeWidth,
    "aria-hidden": true,
  });
}

export const defaultDocIcons = {
  group: FolderTree,
  page: FileText,
  link: Link2,
  file: FileText,
  section: GraduationCap,
  presentation: Presentation,
  key: KeyRound,
  laptop: Laptop,
};
