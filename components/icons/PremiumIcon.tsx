import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumIconProps {
  icon: LucideIcon;
  className?: string;
  accent?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

/**
 * Premium Icon Component
 * - Outline style with 2px stroke
 * - Rounded line caps for smooth appearance
 * - Optional mint accent
 * - Apple SF Symbol + Material You inspired
 */
export function PremiumIcon({
  icon: Icon,
  className = "",
  accent = false,
  size = "md",
}: PremiumIconProps) {
  return (
    <Icon
      className={cn(
        "stroke-2",
        sizeMap[size],
        accent && "text-mint",
        className
      )}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
