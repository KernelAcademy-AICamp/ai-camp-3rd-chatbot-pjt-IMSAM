"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: string;
    annual: string;
  };
  features: string[];
  isPopular: boolean;
  buttonText: string;
  billingCycle: "monthly" | "annual";
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({
  id,
  name,
  description,
  price,
  features,
  isPopular,
  buttonText,
  billingCycle,
  isCurrentPlan = false,
  onSubscribe,
  isLoading = false,
}: PricingCardProps) {
  const currentPrice = billingCycle === "monthly" ? price.monthly : price.annual;

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full p-8 transition-all hover:-translate-y-1 hover:shadow-lg",
        isPopular ? "border-primary bg-primary/5 shadow-md" : "border-border",
        isCurrentPlan ? "ring-2 ring-primary ring-offset-2 bg-secondary/10" : ""
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          Best Choice
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-4 right-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
          이용 중
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold">{currentPrice}</span>
          {currentPrice !== "무료" && currentPrice !== "문의" && (
            <span className="ml-2 text-muted-foreground">
              /{billingCycle === "monthly" ? "월" : "년"}
            </span>
          )}
        </div>
      </div>

      {/* ⭐ Feature List (자동으로 남는 공간을 채워 균등 높이를 만듦) */}
      <ul className="flex-1 mb-8 space-y-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm">
            <Check className="mr-3 h-5 w-5 shrink-0 text-primary" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* ⭐ Footer Button (카드 맨 아래 고정) */}
      <Button
        className={cn(
          "w-full h-11 font-semibold text-base transition-all mt-auto",
          isPopular && !isCurrentPlan
            ? "bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 hover:from-primary/90 hover:to-violet-600/90 shadow-md"
            : "",
          isCurrentPlan ? "opacity-90 bg-muted text-muted-foreground hover:bg-muted" : ""
        )}
        variant={isPopular && !isCurrentPlan ? "default" : isCurrentPlan ? "secondary" : "outline"}
        size="lg"
        disabled={isCurrentPlan || isLoading}
        onClick={() => onSubscribe?.(id)}
      >
        {isCurrentPlan ? "현재 이용 중인 플랜" : buttonText}
      </Button>
    </Card>
  );
}
