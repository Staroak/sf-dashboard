"use client";

import { useEffect, useState } from "react";
import { Trophy, Sparkles, Star, PartyPopper, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalCelebrationProps {
  show: boolean;
  goalType: "applications" | "appraisals" | "submissions";
  value: number;
  onClose: () => void;
}

interface BrokerCelebrationProps {
  show: boolean;
  brokerName: string;
  metricType: "applications" | "appraisals" | "submissions";
  value: number;
  goal: number;
  onClose: () => void;
}

const goalConfig = {
  applications: {
    title: "APPLICATIONS",
    goal: 33,
    color: "from-green-400 via-emerald-500 to-teal-500",
    glowColor: "shadow-green-500/50",
    icon: "📝",
  },
  appraisals: {
    title: "APPRAISALS",
    goal: 8,
    color: "from-purple-400 via-violet-500 to-indigo-500",
    glowColor: "shadow-purple-500/50",
    icon: "📋",
  },
  submissions: {
    title: "SUBMISSIONS",
    goal: 8,
    color: "from-orange-400 via-amber-500 to-yellow-500",
    glowColor: "shadow-orange-500/50",
    icon: "🚀",
  },
};

// Animated Pearl Component that fills up during celebration
function CelebrationPearl({ fillDelay = 500 }: { fillDelay?: number }) {
  const [fillPercentage, setFillPercentage] = useState(0);

  useEffect(() => {
    // Start fill animation after delay
    const startTimer = setTimeout(() => {
      // Animate fill from 0 to 100 over 1.5 seconds
      const startTime = Date.now();
      const duration = 1500;

      const animateFrame = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function for smooth fill
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setFillPercentage(easedProgress * 100);

        if (progress < 1) {
          requestAnimationFrame(animateFrame);
        }
      };

      requestAnimationFrame(animateFrame);
    }, fillDelay);

    return () => clearTimeout(startTimer);
  }, [fillDelay]);

  const isComplete = fillPercentage >= 100;

  return (
    <div className="relative animate-pearl-entrance">
      {/* Outer glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-all duration-300",
          isComplete ? "opacity-80" : "opacity-40"
        )}
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, ${fillPercentage / 100}) 0%, transparent 70%)`,
          transform: `scale(${1 + fillPercentage / 200})`,
        }}
      />

      {/* Pearl container */}
      <div className="relative rounded-full border-4 border-blue-300 dark:border-blue-700 p-1 w-40 h-40 shadow-2xl">
        {/* Pearl body */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-slate-900 overflow-hidden shadow-inner">
          {/* Water fill effect */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-none"
            style={{ height: `${fillPercentage}%` }}
          >
            {/* Animated wave effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={cn(
                  "absolute inset-0",
                  isComplete
                    ? "bg-gradient-to-t from-blue-400 via-blue-300 to-cyan-300"
                    : "bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400"
                )}
              />
              {/* Wave SVG */}
              <svg
                className="absolute -top-2 left-0 w-full animate-[wave_1s_ease-in-out_infinite]"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 25 0, 50 5 T 100 5 L 100 10 L 0 10 Z"
                  fill={isComplete ? "#60a5fa" : "#3b82f6"}
                  opacity="0.7"
                />
              </svg>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1s_infinite]" />
          </div>

          {/* Pearl shine */}
          <div className="absolute rounded-full bg-white/50 blur-sm w-8 h-8 top-3 left-5" />
          <div className="absolute rounded-full bg-white/70 w-4 h-4 top-5 left-7" />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span
              className={cn(
                "text-4xl font-black transition-colors tabular-nums",
                fillPercentage >= 50 ? "text-white drop-shadow-lg" : "text-blue-600 dark:text-blue-400"
              )}
            >
              {Math.round(fillPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Celebration particles when complete */}
      {isComplete && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-4 -right-2 w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: "0.1s" }} />
          <div className="absolute bottom-4 -left-2 w-2 h-2 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
          <div className="absolute -bottom-2 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute top-8 -left-3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: "0.15s" }} />
          <div className="absolute bottom-8 -right-3 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.25s" }} />
        </div>
      )}
    </div>
  );
}

// Generate confetti pieces
const confettiColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export function GoalCelebration({ show, goalType, value, onClose }: GoalCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string; size: number; rotation: number }>>([]);

  const config = goalConfig[goalType];

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Generate confetti
      const pieces = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
      }));
      setConfetti(pieces);

      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  if (!show && !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={handleClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={cn(
              "absolute animate-confetti-fall",
              piece.color
            )}
            style={{
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              animationDelay: `${piece.delay}s`,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
            }}
          />
        ))}
      </div>

      {/* Sparkle bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "absolute animate-sparkle-burst text-yellow-400",
              i % 2 === 0 ? "text-yellow-300" : "text-white"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 30 + 20}px`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      {/* Main celebration card */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center animate-celebration-bounce",
          isVisible ? "scale-100" : "scale-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Glowing background circle */}
        <div className={cn(
          "absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30 animate-pulse-glow",
          `bg-gradient-to-r ${config.color}`
        )} />

        {/* Trophy with glow */}
        <div className="relative mb-6">
          <div className={cn(
            "absolute inset-0 blur-2xl animate-pulse",
            `bg-gradient-to-r ${config.color} opacity-60`
          )} />
          <Trophy
            className={cn(
              "relative w-32 h-32 animate-trophy-bounce",
              "text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]"
            )}
            fill="currentColor"
            strokeWidth={1}
          />
          {/* Floating sparkles around trophy */}
          <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-300 animate-float-sparkle" />
          <Sparkles className="absolute -top-2 -right-6 w-6 h-6 text-yellow-200 animate-float-sparkle-delayed" />
          <Sparkles className="absolute -bottom-2 -left-6 w-7 h-7 text-yellow-400 animate-float-sparkle-slow" />
          <PartyPopper className="absolute -top-6 right-0 w-10 h-10 text-pink-400 animate-party-pop" />
          <PartyPopper className="absolute -top-6 left-0 w-10 h-10 text-blue-400 animate-party-pop-delayed scale-x-[-1]" />
        </div>

        {/* GOAL ACHIEVED text */}
        <h1 className="text-6xl md:text-8xl font-black mb-4 animate-rainbow-text tracking-tight">
          DAILY TEAM GOAL ACHIEVED!
        </h1>

        {/* Goal type badge */}
        <div className={cn(
          "px-8 py-3 rounded-full mb-6 animate-badge-pop",
          `bg-gradient-to-r ${config.color} shadow-2xl ${config.glowColor}`
        )}>
          <span className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">{config.icon}</span>
            {config.title}
            <span className="text-4xl">{config.icon}</span>
          </span>
        </div>

        {/* Big Pearl that fills up */}
        <div className="animate-score-pop mb-6">
          <CelebrationPearl fillDelay={800} />
        </div>

        {/* Score display */}
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="text-center">
            <div className={cn(
              "text-6xl md:text-7xl font-black tabular-nums",
              "bg-clip-text text-transparent",
              `bg-gradient-to-r ${config.color}`,
              "drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            )}>
              {value} / {config.goal}
            </div>
            <div className="text-xl text-white/80 font-semibold mt-2">
              Daily Goal Reached!
            </div>
          </div>
        </div>

        {/* Celebration message */}
        <p className="text-xl md:text-2xl text-white/90 mt-8 font-medium animate-fade-in-up">
          Amazing work, team! Keep crushing it! 🎉
        </p>

        {/* Click to close hint */}
        <p className="text-sm text-white/50 mt-6 animate-pulse">
          Click anywhere to close
        </p>
      </div>

      {/* Corner fireworks */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 animate-firework">
          <div className="w-4 h-4 bg-red-500 rounded-full" />
        </div>
        <div className="absolute top-32 right-32 animate-firework-delayed">
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
        </div>
        <div className="absolute bottom-40 left-40 animate-firework-slow">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
        </div>
        <div className="absolute bottom-20 right-20 animate-firework">
          <div className="w-4 h-4 bg-yellow-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Broker individual celebration component
const brokerMetricConfig = {
  applications: {
    title: "APPLICATION",
    titlePlural: "APPLICATIONS",
    color: "from-green-400 via-emerald-500 to-teal-500",
    glowColor: "shadow-green-500/50",
    bgColor: "bg-green-500",
    icon: "📝",
    verb: "submitted",
  },
  appraisals: {
    title: "APPRAISAL",
    titlePlural: "APPRAISALS",
    color: "from-purple-400 via-violet-500 to-indigo-500",
    glowColor: "shadow-purple-500/50",
    bgColor: "bg-purple-500",
    icon: "📋",
    verb: "ordered",
  },
  submissions: {
    title: "SUBMISSION",
    titlePlural: "SUBMISSIONS",
    color: "from-orange-400 via-amber-500 to-yellow-500",
    glowColor: "shadow-orange-500/50",
    bgColor: "bg-orange-500",
    icon: "🚀",
    verb: "completed",
  },
};

export function BrokerCelebration({ show, brokerName, metricType, value, goal, onClose }: BrokerCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string; size: number; rotation: number }>>([]);

  const config = brokerMetricConfig[metricType];

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Generate confetti (fewer pieces for broker celebration)
      const pieces = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      }));
      setConfetti(pieces);

      // Auto-close after 25 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 25000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  if (!show && !isVisible) return null;

  // Get first name for more personal feel
  const firstName = brokerName.split(' ')[0];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-400",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={handleClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={cn(
              "absolute animate-confetti-fall",
              piece.color
            )}
            style={{
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              animationDelay: `${piece.delay}s`,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
            }}
          />
        ))}
      </div>

      {/* Sparkle bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "absolute animate-sparkle-burst text-yellow-400",
              i % 2 === 0 ? "text-yellow-300" : "text-white"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              width: `${Math.random() * 25 + 15}px`,
              height: `${Math.random() * 25 + 15}px`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      {/* Main celebration card */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center animate-celebration-bounce max-w-6xl px-16",
          isVisible ? "scale-100" : "scale-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-8 -right-8 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-12 h-12 text-white" />
        </button>

        {/* Glowing background circle */}
        <div className={cn(
          "absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-40 animate-pulse-glow",
          `bg-gradient-to-r ${config.color}`
        )} />

        {/* Trophy with glow */}
        <div className="relative mb-8">
          <div className={cn(
            "absolute inset-0 blur-3xl animate-pulse",
            `bg-gradient-to-r ${config.color} opacity-50`
          )} />
          <Trophy
            className={cn(
              "relative w-48 h-48 animate-trophy-bounce",
              "text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.8)]"
            )}
            fill="currentColor"
            strokeWidth={1}
          />
          {/* Floating sparkles around trophy */}
          <Sparkles className="absolute -top-6 -left-6 w-12 h-12 text-yellow-300 animate-float-sparkle" />
          <Sparkles className="absolute -top-2 -right-8 w-10 h-10 text-yellow-200 animate-float-sparkle-delayed" />
          <PartyPopper className="absolute -top-8 right-0 w-16 h-16 text-pink-400 animate-party-pop" />
          <PartyPopper className="absolute -top-8 left-0 w-16 h-16 text-blue-400 animate-party-pop-delayed scale-x-[-1]" />
        </div>

        {/* Broker name - BIG and prominent */}
        <h1 className="text-7xl md:text-9xl font-black mb-4 animate-rainbow-text tracking-tight text-center">
          {firstName.toUpperCase()}
        </h1>

        {/* Achievement text */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 animate-badge-pop text-center">
          {value > goal ? "CRUSHED THEIR DAILY GOAL!" : "HIT THEIR DAILY GOAL!"}
        </h2>

        {/* Metric badge */}
        <div className={cn(
          "px-12 py-4 rounded-full mb-8 animate-score-pop",
          `bg-gradient-to-r ${config.color} shadow-2xl ${config.glowColor}`
        )}>
          <span className="text-3xl md:text-4xl font-bold text-white flex items-center gap-4">
            <span className="text-6xl">{config.icon}</span>
            {value} {value === 1 ? config.title : config.titlePlural}
            <span className="text-6xl">{config.icon}</span>
          </span>
        </div>

        {/* Goal progress indicator */}
        <div className="flex items-center gap-6 animate-fade-in-up">
          <div className={cn(
            "text-6xl md:text-8xl font-black tabular-nums",
            "bg-clip-text text-transparent",
            `bg-gradient-to-r ${config.color}`
          )}>
            {value} / {goal}
          </div>
          <span className="text-2xl text-white/70">daily goal</span>
        </div>

        {/* Celebration message */}
        <p className="text-2xl md:text-3xl text-white/80 mt-12 font-medium animate-fade-in-up text-center">
          {value > goal
            ? `${firstName} is on fire! ${value} and counting! 🔥`
            : `Way to go, ${firstName}! Keep up the amazing work! 🔥`}
        </p>

        {/* Click to close hint */}
        <p className="text-base text-white/40 mt-8 animate-pulse">
          Click anywhere to close
        </p>
      </div>

      {/* Corner fireworks */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-16 animate-firework">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
        </div>
        <div className="absolute top-24 right-24 animate-firework-delayed">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
        </div>
        <div className="absolute bottom-32 left-32 animate-firework-slow">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="absolute bottom-16 right-16 animate-firework">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
