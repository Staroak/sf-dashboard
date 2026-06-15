"use client";

import { useEffect, useState } from "react";
import { Gift, Flame, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekendWrappedIntroProps {
  show: boolean;
  applications: number;
  appraisals: number;
  submissions: number;
  /** Number of brokers who logged any weekend production. */
  contributors: number;
  onClose: () => void;
}

// Title splash for the Monday 10am catch-up — plays once, then the per-broker
// "Weekend Wrapped" reels fire.
export function WeekendWrappedIntro({
  show,
  applications,
  appraisals,
  submissions,
  contributors,
  onClose,
}: WeekendWrappedIntroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => handleClose(), 8000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  if (!show && !isVisible) return null;

  const stats = [
    { label: "Applications", value: applications, color: "from-green-400 to-emerald-500" },
    { label: "Appraisals", value: appraisals, color: "from-purple-400 to-indigo-500" },
    { label: "Submissions", value: submissions, color: "from-orange-400 to-amber-500" },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      {/* Glow */}
      <div className="absolute w-[900px] h-[900px] rounded-full blur-3xl opacity-30 animate-pulse-glow bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500" />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center text-center px-12 animate-celebration-bounce",
          isVisible ? "scale-100" : "scale-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute -top-8 -right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-8 h-8 text-white" />
        </button>

        <div className="flex items-center gap-4 mb-6 animate-badge-pop">
          <Gift className="w-16 h-16 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.7)]" />
          <Flame className="w-14 h-14 text-orange-500 animate-pulse" />
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-3 animate-rainbow-text tracking-tight">
          WEEKEND WRAPPED
        </h1>
        <p className="text-2xl md:text-3xl text-white/80 mb-10 font-medium animate-fade-in-up">
          {contributors > 0
            ? `${contributors} ${contributors === 1 ? "broker" : "brokers"} put in work this weekend - here's the recap 🔥`
            : "Here's what the team pulled off this weekend 🔥"}
        </p>

        {/* Big weekend totals */}
        <div className="flex items-stretch gap-6 animate-score-pop">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-3xl border border-white/15 bg-white/5 px-10 py-6 min-w-[180px]"
            >
              <span
                className={cn(
                  "text-7xl md:text-8xl font-black tabular-nums bg-clip-text text-transparent",
                  `bg-gradient-to-r ${s.color}`
                )}
              >
                {s.value}
              </span>
              <span className="text-xl md:text-2xl font-semibold text-white/70 mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        <p className="text-base text-white/40 mt-12 animate-pulse">Click anywhere to start the reel</p>
      </div>
    </div>
  );
}
