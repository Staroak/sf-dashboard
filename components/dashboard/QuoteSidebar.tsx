"use client";

import { useState, useEffect } from "react";
import { Quote, Lightbulb, Shield, Star, Users, Target, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motivationalQuotes, proTips } from "@/lib/content";

const tipIcons: Record<string, typeof Lightbulb> = {
  lightbulb: Lightbulb,
  shield: Shield,
  star: Star,
  users: Users,
  target: Target,
};

export function QuoteSidebar() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isQuoteFading, setIsQuoteFading] = useState(false);
  const [isTipFading, setIsTipFading] = useState(false);

  // Rotate quotes every 30 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setIsQuoteFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
        setIsQuoteFading(false);
      }, 500);
    }, 30000);

    return () => clearInterval(quoteInterval);
  }, []);

  // Rotate tips every 20 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setIsTipFading(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % proTips.length);
        setIsTipFading(false);
      }, 500);
    }, 20000);

    return () => clearInterval(tipInterval);
  }, []);

  const currentQuote = motivationalQuotes[currentQuoteIndex];
  const currentTip = proTips[currentTipIndex];
  const TipIcon = tipIcons[currentTip.icon] || Lightbulb;

  const nextQuote = () => {
    setIsQuoteFading(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
      setIsQuoteFading(false);
    }, 300);
  };

  const prevQuote = () => {
    setIsQuoteFading(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev - 1 + motivationalQuotes.length) % motivationalQuotes.length);
      setIsQuoteFading(false);
    }, 300);
  };

  const nextTip = () => {
    setIsTipFading(true);
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % proTips.length);
      setIsTipFading(false);
    }, 300);
  };

  const prevTip = () => {
    setIsTipFading(true);
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev - 1 + proTips.length) % proTips.length);
      setIsTipFading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Motivational Quote - flex-1 to share space equally */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 relative overflow-hidden flex-1 flex flex-col">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />

        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Quote className="h-6 w-6 text-blue-400" />
          </div>
          <span className="text-xl font-semibold text-blue-400 uppercase tracking-wide">
            Daily Inspiration
          </span>
        </div>

        <div className={cn(
          "transition-opacity duration-500 flex-1 flex flex-col justify-center",
          isQuoteFading ? "opacity-0" : "opacity-100"
        )}>
          <blockquote className="text-2xl italic text-foreground/90 leading-relaxed mb-3">
            &ldquo;{currentQuote.quote}&rdquo;
          </blockquote>
          <cite className="text-xl text-muted-foreground not-italic">
            — {currentQuote.author}
          </cite>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 flex-shrink-0">
          <button
            onClick={prevQuote}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-6 w-6 text-muted-foreground" />
          </button>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  currentQuoteIndex % 3 === i ? "bg-blue-500" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <button
            onClick={nextQuote}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Pro Tip - flex-1 to share space equally */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 p-6 relative overflow-hidden flex-1 flex flex-col">
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl" />

        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <TipIcon className="h-6 w-6 text-amber-400" />
          </div>
          <span className="text-xl font-semibold text-amber-400 uppercase tracking-wide">
            {currentTip.category}
          </span>
        </div>

        <div className={cn(
          "transition-opacity duration-500 flex-1 flex flex-col justify-center",
          isTipFading ? "opacity-0" : "opacity-100"
        )}>
          <p className="text-2xl text-foreground/90 leading-relaxed">
            {currentTip.tip}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 flex-shrink-0">
          <button
            onClick={prevTip}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Previous tip"
          >
            <ChevronLeft className="h-6 w-6 text-muted-foreground" />
          </button>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  currentTipIndex % 3 === i ? "bg-amber-500" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <button
            onClick={nextTip}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Next tip"
          >
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
