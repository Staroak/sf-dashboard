"use client";

import { useState, useEffect } from "react";
import { Quote, Lightbulb, Shield, Star, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motivationalQuotes, proTips } from "@/lib/content";

const tipIcons: Record<string, typeof Lightbulb> = {
  lightbulb: Lightbulb,
  shield: Shield,
  star: Star,
  users: Users,
  target: Target,
};

export function QuotesPage() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isQuoteFading, setIsQuoteFading] = useState(false);
  const [isTipFading, setIsTipFading] = useState(false);

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setIsQuoteFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
        setIsQuoteFading(false);
      }, 500);
    }, 8000);

    return () => clearInterval(quoteInterval);
  }, []);

  // Rotate tips every 8 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setIsTipFading(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % proTips.length);
        setIsTipFading(false);
      }, 500);
    }, 8000);

    return () => clearInterval(tipInterval);
  }, []);

  const currentQuote = motivationalQuotes[currentQuoteIndex];
  const currentTip = proTips[currentTipIndex];
  const TipIcon = tipIcons[currentTip.icon] || Lightbulb;

  return (
    <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
      {/* Quote section - ~60% */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 shadow-sm p-8 relative overflow-hidden flex-[3] flex flex-col">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <div className="p-3 rounded-lg bg-blue-500/20">
            <Quote className="h-8 w-8 text-blue-400" />
          </div>
          <span className="text-2xl font-semibold text-blue-400 uppercase tracking-wide">
            Daily Inspiration
          </span>
        </div>

        {/* Content */}
        <div className={cn(
          "transition-opacity duration-500 flex-1 flex flex-col justify-center",
          isQuoteFading ? "opacity-0" : "opacity-100"
        )}>
          <blockquote className="text-6xl italic text-foreground/90 leading-relaxed mb-6">
            &ldquo;{currentQuote.quote}&rdquo;
          </blockquote>
          <cite className="text-2xl text-muted-foreground not-italic">
            — {currentQuote.author}
          </cite>
        </div>
      </div>

      {/* Tip section - ~40% */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 shadow-sm p-8 relative overflow-hidden flex-[2] flex flex-col">
        {/* Decorative blur */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="p-3 rounded-lg bg-amber-500/20">
            <TipIcon className="h-8 w-8 text-amber-400" />
          </div>
          <span className="text-2xl font-semibold text-amber-400 uppercase tracking-wide">
            {currentTip.category}
          </span>
        </div>

        {/* Content */}
        <div className={cn(
          "transition-opacity duration-500 flex-1 flex flex-col justify-center",
          isTipFading ? "opacity-0" : "opacity-100"
        )}>
          <p className="text-4xl text-foreground/90 leading-relaxed">
            {currentTip.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
