"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle, ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type AlertLevel = "critical" | "warning" | "info" | "success";

export interface AlertWidgetProps {
  level: AlertLevel;
  title: string;
  description: string;
  clientName?: string;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const configs: Record<AlertLevel, {
  icon: React.ElementType;
  container: string;
  iconColor: string;
  badge: string;
  dot: string;
}> = {
  critical: {
    icon: AlertCircle,
    container: "border-status-error/25 bg-status-error/5 hover:border-status-error/40",
    iconColor: "text-status-error",
    badge: "bg-status-error/15 text-status-error",
    dot: "bg-status-error animate-pulse-slow",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-status-warning/25 bg-status-warning/5 hover:border-status-warning/40",
    iconColor: "text-status-warning",
    badge: "bg-status-warning/15 text-status-warning",
    dot: "bg-status-warning",
  },
  info: {
    icon: Info,
    container: "border-status-info/25 bg-status-info/5 hover:border-status-info/40",
    iconColor: "text-status-info",
    badge: "bg-status-info/15 text-status-info",
    dot: "bg-status-info",
  },
  success: {
    icon: CheckCircle,
    container: "border-status-success/25 bg-status-success/5 hover:border-status-success/40",
    iconColor: "text-status-success",
    badge: "bg-status-success/15 text-status-success",
    dot: "bg-status-success",
  },
};

export function AlertWidget({
  level,
  title,
  description,
  clientName,
  timestamp,
  action,
  className,
}: AlertWidgetProps) {
  const config = configs[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group animate-slide-in rounded-xl border p-4 transition-all duration-200",
        config.container,
        className
      )}
    >
      <div className="flex gap-3">
        {/* Status dot + icon */}
        <div className="relative mt-0.5 flex-shrink-0">
          <Icon className={cn("h-5 w-5", config.iconColor)} />
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full",
              level === "critical" ? config.dot : "hidden"
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground leading-snug">{title}</h3>
            {clientName && (
              <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", config.badge)}>
                {clientName}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-relaxed text-foreground/60">{description}</p>

          {/* Footer */}
          {(timestamp || action) && (
            <div className="mt-3 flex items-center justify-between">
              {timestamp && (
                <span className="text-xs text-foreground/40">{timestamp}</span>
              )}
              {action && (
                <button
                  onClick={action.onClick}
                  className={cn(
                    "group/btn ml-auto flex items-center gap-1 text-xs font-semibold transition-all",
                    config.iconColor,
                    "hover:gap-2"
                  )}
                >
                  {action.label}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
