import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "accent" | "muted";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "border-border bg-surface text-foreground",
  success: "border-status-success/30 bg-status-success/10 text-status-success",
  warning: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  error:   "border-status-error/30 bg-status-error/10 text-status-error",
  info:    "border-status-info/30 bg-status-info/10 text-status-info",
  accent:  "border-accent/30 bg-accent/10 text-accent",
  muted:   "border-border bg-surface text-foreground/50",
};

const BASE = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn(BASE, VARIANT_CLASSES[variant], className)} {...props} />
  );
}
