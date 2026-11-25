import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark" | "system";
interface ThemeState {
  choice: ThemeChoice;
  resolved: "light" | "dark";
  setChoice: (c: ThemeChoice) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => (localStorage.getItem("cc-theme") as ThemeChoice) || "system");
  const [prefersDark, setPrefersDark] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setPrefersDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = choice === "system" ? (prefersDark ? "dark" : "light") : choice;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setChoice = useCallback((c: ThemeChoice) => {
    localStorage.setItem("cc-theme", c);
    setChoiceState(c);
  }, []);

  const value = useMemo(
    () => ({ choice, resolved, setChoice, toggle: () => setChoice(resolved === "dark" ? "light" : "dark") }),
    [choice, resolved, setChoice]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
