"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  isActive?: boolean;
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
  currentPath: string;
}

export function NavSection({ title, items, currentPath }: NavSectionProps) {
  return (
    <div>
      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">
        {title}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {items.map((item) => {
          const active = item.isActive ?? currentPath === item.href;
          return (
            <a
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150",
                active
                  ? "bg-accent/10 text-accent font-medium border border-accent/20"
                  : "text-foreground/60 hover:bg-surface-strong hover:text-foreground border border-transparent"
              )}
            >
              <span className="flex items-center gap-2.5">
                {item.icon && (
                  <span className={cn(
                    "transition-colors",
                    active ? "text-accent" : "text-foreground/40 group-hover:text-foreground/60"
                  )}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-status-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-status-warning">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
