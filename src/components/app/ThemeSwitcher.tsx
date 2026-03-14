"use client";

import { useState } from "react";
import { applyTheme, getInitialTheme, type ThemeMode } from "@/components/ThemeProvider";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Tema visual</span>
      <select
        value={theme}
        onChange={(event) => {
          const value = event.target.value as ThemeMode;
          setTheme(value);
          applyTheme(value);
        }}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring"
      >
        <option value="dark">Oscuro</option>
        <option value="light">Claro</option>
        <option value="aurora">Aurora</option>
      </select>
    </label>
  );
}
