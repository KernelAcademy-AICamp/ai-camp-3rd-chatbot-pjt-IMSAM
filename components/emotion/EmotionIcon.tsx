"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type EmotionType = "ready" | "focus" | "thinking" | "success" | "error";
type SizeType = "sm" | "md" | "lg" | "xl";

interface EmotionIconProps {
  type: EmotionType;
  size?: SizeType;
  className?: string;
}

const emotionConfig = {
  ready: {
    color: "hsl(var(--emotion-ready))",
    borderColor: "hsl(var(--emotion-ready) / 0.5)",
    bgColor: "hsl(var(--emotion-ready) / 0.1)",
    glowColor: "hsl(var(--emotion-ready) / 0.2)",
    pattern: "pulse",
  },
  focus: {
    color: "hsl(var(--emotion-focus))",
    borderColor: "hsl(var(--emotion-focus) / 0.5)",
    bgColor: "hsl(var(--emotion-focus) / 0.1)",
    glowColor: "hsl(var(--emotion-focus) / 0.2)",
    pattern: "breathe",
  },
  thinking: {
    color: "hsl(var(--emotion-warn))",
    borderColor: "hsl(var(--emotion-warn) / 0.5)",
    bgColor: "hsl(var(--emotion-warn) / 0.1)",
    glowColor: "hsl(var(--emotion-warn) / 0.2)",
    pattern: "spin",
  },
  success: {
    color: "hsl(var(--emotion-success))",
    borderColor: "hsl(var(--emotion-success) / 0.5)",
    bgColor: "hsl(var(--emotion-success) / 0.1)",
    glowColor: "hsl(var(--emotion-success) / 0.2)",
    pattern: "scale",
  },
  error: {
    color: "hsl(var(--emotion-error))",
    borderColor: "hsl(var(--emotion-error) / 0.5)",
    bgColor: "hsl(var(--emotion-error) / 0.1)",
    glowColor: "hsl(var(--emotion-error) / 0.2)",
    pattern: "shake",
  },
};

const sizeMap = {
  sm: { container: "w-8 h-8", dot: "w-2 h-2", blur: "blur-md" },
  md: { container: "w-12 h-12", dot: "w-3 h-3", blur: "blur-lg" },
  lg: { container: "w-20 h-20", dot: "w-4 h-4", blur: "blur-xl" },
  xl: { container: "w-24 h-24", dot: "w-5 h-5", blur: "blur-2xl" },
};

const animations = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  breathe: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  spin: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
  scale: {
    scale: [0, 1],
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
  shake: {
    x: [-2, 2, 0, -2, 2, 0],
    transition: {
      duration: 0.4,
      repeat: 2,
    },
  },
};

/**
 * Minimal Emotion Icon
 * - Replaces traditional emoji with branded color dots
 * - Smooth pulse/breathe/spin animations
 * - Subtle glow effect for premium feel
 */
export function EmotionIcon({
  type,
  size = "md",
  className = "",
}: EmotionIconProps) {
  const config = emotionConfig[type];
  const sizes = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizes.container,
        className
      )}
    >
      {/* Glow Background */}
      <div
        className={cn("absolute inset-0 opacity-50", sizes.blur)}
        style={{ backgroundColor: config.glowColor }}
      />

      {/* Animated Ring */}
      <motion.div
        className="relative w-full h-full rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: config.borderColor,
          backgroundColor: config.bgColor,
        }}
        animate={animations[config.pattern as keyof typeof animations]}
      >
        {/* Center Dot */}
        <div
          className={cn("rounded-full", sizes.dot)}
          style={{ backgroundColor: config.color }}
        />
      </motion.div>
    </div>
  );
}
