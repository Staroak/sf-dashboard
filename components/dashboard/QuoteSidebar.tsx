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
    <div className="flex flex-col gap-4 h-full">
      {/* Motivational Quote */}
      <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-4 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />

        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <Quote className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
            Daily Inspiration
          </span>
        </div>

        <div className={cn(
          "transition-opacity duration-500",
          isQuoteFading ? "opacity-0" : "opacity-100"
        )}>
          <blockquote className="text-sm italic text-gray-200 leading-relaxed mb-2">
            &ldquo;{currentQuote.quote}&rdquo;
          </blockquote>
          <cite className="text-xs text-gray-400 not-italic">
            — {currentQuote.author}
          </cite>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
          <button
            onClick={prevQuote}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </button>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  currentQuoteIndex % 3 === i ? "bg-blue-500" : "bg-gray-600"
                )}
              />
            ))}
          </div>
          <button
            onClick={nextQuote}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 p-4 relative overflow-hidden flex-1">
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-amber-500/20 rounded-full blur-2xl" />

        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <TipIcon className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">
            {currentTip.category}
          </span>
        </div>

        <div className={cn(
          "transition-opacity duration-500",
          isTipFading ? "opacity-0" : "opacity-100"
        )}>
          <p className="text-sm text-gray-200 leading-relaxed">
            {currentTip.tip}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
          <button
            onClick={prevTip}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
            aria-label="Previous tip"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </button>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  currentTipIndex % 3 === i ? "bg-amber-500" : "bg-gray-600"
                )}
              />
            ))}
          </div>
          <button
            onClick={nextTip}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
            aria-label="Next tip"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
