"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type QuoteCategory = "applications" | "appraisals" | "submissions" | "general";

interface QuoteDisplayProps {
  category: QuoteCategory;
  className?: string;
}

const QUOTES: Record<QuoteCategory, string[]> = {
  applications: [
    "Every application is a step closer to changing someone's life.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The harder you work, the luckier you get.",
    "Don't count the days, make the days count.",
    "Your next application could be your biggest deal yet.",
    "Champions keep playing until they get it right.",
    "The only way to do great work is to love what you do.",
    "Hustle in silence, let success make the noise.",
    "Every 'no' gets you closer to a 'yes'.",
    "The best time to take an application was yesterday. The next best time is now.",
  ],
  appraisals: [
    "Progress is progress, no matter how small.",
    "Momentum is everything. Keep it going.",
    "Every appraisal ordered is a deal in motion.",
    "The pipeline is flowing. Keep feeding it.",
    "Small steps in the right direction beat standing still.",
    "Movement creates momentum. Momentum creates results.",
    "You're building something great, one appraisal at a time.",
    "Keep the wheels turning. Success follows action.",
    "The journey of a thousand miles begins with a single step.",
    "Your consistency today builds your success tomorrow.",
  ],
  submissions: [
    "Closers close. That's what you do.",
    "The finish line is in sight. Push through.",
    "Every submission is a victory. Celebrate it.",
    "You don't get what you wish for. You get what you work for.",
    "Winners find a way. You're a winner.",
    "The end of one deal is the beginning of the next.",
    "Crossing the finish line never gets old.",
    "Success is the best revenge against doubt.",
    "You're not just closing deals. You're opening doors.",
    "The trophy belongs to those who finish what they start.",
  ],
  general: [
    "Excellence is not a destination but a continuous journey.",
    "The team that works together, wins together.",
    "Your attitude determines your altitude.",
    "Be the energy you want to attract.",
    "Success is earned, not given.",
    "Together we achieve more.",
    "Dream big. Work hard. Stay focused.",
    "The only limit is the one you set yourself.",
    "Make today count.",
    "Great things never come from comfort zones.",
  ],
};

export function QuoteDisplay({ category, className }: QuoteDisplayProps) {
  const [currentQuote, setCurrentQuote] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const quotes = QUOTES[category];

  useEffect(() => {
    // Pick a random quote on mount
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Rotate quotes every 30 seconds with animation
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        setIsTransitioning(false);
      }, 300);
    }, 30000);

    return () => clearInterval(interval);
  }, [quotes]);

  return (
    <div className={cn(
      "rounded-xl border border-gray-800 bg-gray-900/80 p-4 flex items-center justify-center",
      className
    )}>
      <p className={cn(
        "text-2xl italic text-center text-muted-foreground leading-relaxed transition-all duration-300",
        isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
      )}>
        "{currentQuote}"
      </p>
    </div>
  );
}
