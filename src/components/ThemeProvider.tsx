"use client";

import { useEffect } from "react";

export type ThemeMode = "dark" | "light" | "aurora";

const THEME_STORAGE_KEY = "cp-theme";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "aurora" || savedTheme === "dark") {
    return savedTheme;
  }

  return "dark";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(readStoredTheme());
  }, []);

  return <>{children}</>;
}

export function getInitialTheme(): ThemeMode {
  return readStoredTheme();
}
