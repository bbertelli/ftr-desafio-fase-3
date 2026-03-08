import type { LucideIcon } from "lucide-react";
import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Gift,
  HeartPulse,
  House,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Tag,
  Ticket,
  ToolCase,
  Utensils,
} from "lucide-react";

export type CategoryColor =
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "red";

export const CATEGORY_COLORS: CategoryColor[] = [
  "blue",
  "purple",
  "pink",
  "orange",
  "yellow",
  "green",
  "red",
];

export const CATEGORY_ICON_OPTIONS = [
  "utensils",
  "car-front",
  "house",
  "heart-pulse",
  "shopping-cart",
  "briefcase-business",
  "ticket",
  "gift",
  "tool-case",
  "baggage-claim",
  "book-open",
  "receipt-text",
  "paw-print",
  "piggy-bank",
  "mailbox",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number];

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  "car-front": CarFront,
  house: House,
  "heart-pulse": HeartPulse,
  "shopping-cart": ShoppingCart,
  "briefcase-business": BriefcaseBusiness,
  ticket: Ticket,
  gift: Gift,
  "tool-case": ToolCase,
  "baggage-claim": BaggageClaim,
  "book-open": BookOpen,
  "receipt-text": ReceiptText,
  "paw-print": PawPrint,
  "piggy-bank": PiggyBank,
  mailbox: Mailbox,
};

export function CategoryIcon({ icon, size = 18 }: { icon?: string | null; size?: number }) {
  const SelectedIcon = (icon ? ICONS[icon] : undefined) ?? Tag;
  return <SelectedIcon size={size} />;
}
