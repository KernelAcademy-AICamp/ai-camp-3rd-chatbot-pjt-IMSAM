import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: ReactNode;
  variant?: "default" | "accent" | "elevated";
  hover?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Premium Card Component
 * - Angular design (2-4px rounded corners)
 * - Subtle shadow system
 * - Mint accent variant
 * - Smooth hover transitions
 */
export function PremiumCard({
  children,
  variant = "default",
  hover = false,
  selected = false,
  className = "",
  onClick,
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        // Base styles
        "p-6 rounded-sm border transition-all duration-300",

        // Variant styles
        variant === "default" && [
          "bg-slate-800/30",
          "border-slate-700/50",
          "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]",
        ],
        variant === "accent" && [
          "bg-[hsl(var(--mint-subtle))]",
          "border-[hsl(var(--mint)/0.2)]",
          "shadow-[0_0_20px_hsl(var(--mint)/0.05)]",
        ],
        variant === "elevated" && [
          "bg-slate-800/40",
          "border-slate-600/50",
          "shadow-[0_8px_24px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)]",
        ],

        // Selected state
        selected && [
          "!border-[hsl(var(--mint)/0.5)]",
          "!bg-[hsl(var(--mint-subtle))]",
          "shadow-[0_0_20px_hsl(var(--mint)/0.1)]",
        ],

        // Hover effect
        hover && [
          "cursor-pointer",
          "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]",
          "hover:border-slate-600/50",
          "hover:-translate-y-0.5",
        ],

        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
