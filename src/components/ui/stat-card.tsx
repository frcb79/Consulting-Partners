"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "flat";
    value: string;
  };
  accentColor?: "success" | "warning" | "error" | "info" | "accent";
  onClick?: () => void;
  loading?: boolean;
  delay?: number;
}

const accentMap = {
  success: { bar: "from-status-success", text: "text-status-success", ring: "hover:border-status-success/40" },
  warning: { bar: "from-status-warning", text: "text-status-warning", ring: "hover:border-status-warning/40" },
  error:   { bar: "from-status-error",   text: "text-status-error",   ring: "hover:border-status-error/40" },
  info:    { bar: "from-status-info",    text: "text-status-info",    ring: "hover:border-status-info/40" },
  accent:  { bar: "from-accent",         text: "text-accent",         ring: "hover:border-accent/40" },
};

function useCountUp(target: number, duration = 800, active = true) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { setCount(target); return; }
    const from = 0;
    const animate = (ts: number) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (target - from) * ease));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, active]);

  return count;
}

export function StatCard({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = "info",
  onClick,
  loading = false,
  delay = 0,
}: StatCardProps) {
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 900, visible && !loading);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const colors = accentMap[accentColor];
  const trendIcons = { up: "↑", down: "↓", flat: "→" };
  const trendColors = { up: "text-status-success", down: "text-status-error", flat: "text-status-warning" };

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300",
        "animate-fade-in-up",
        onClick && `cursor-pointer hover:shadow-card-hover ${colors.ring}`,
        loading && "pointer-events-none"
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent opacity-60",
          colors.bar
        )}
      />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
            {title}
          </p>

          <div className="mt-3 flex items-baseline gap-2">
            {loading ? (
              <div className="h-10 w-16 animate-pulse rounded-lg bg-surface-strong" />
            ) : (
              <p className={cn("font-sora text-[2.5rem] font-bold leading-none tabular-nums", colors.text)}>
                {count}
              </p>
            )}
            {trend && !loading && (
              <span className={cn("text-sm font-semibold", trendColors[trend.direction])}>
                {trendIcons[trend.direction]} {trend.value}
              </span>
            )}
          </div>

          {subtext && !loading && (
            <p className="mt-2 truncate text-xs text-foreground/40">{subtext}</p>
          )}
          {loading && subtext && (
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-surface-strong" />
          )}
        </div>

        {icon && (
          <div className={cn("transition-colors duration-300", colors.text, "opacity-20 group-hover:opacity-40")}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
