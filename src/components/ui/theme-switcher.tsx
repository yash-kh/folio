import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useColorTheme } from "./color-theme-provider";
import { THEMES, type ColorThemeName } from "./color-theme-provider";

export default function ThemeSwitcher() {
  const { colorTheme, setColorTheme, colors, themeNames } = useColorTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 12px)",
              right: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: 9999,
              padding: "8px 12px",
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
            }}
          >
            {themeNames.map((name: ColorThemeName) => (
              <button
                key={name}
                onClick={() => {
                  setColorTheme(name);
                  setOpen(false);
                }}
                title={name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: THEMES[name].accent,
                  border: colorTheme === name ? "2px solid white" : "2px solid transparent",
                  outline: colorTheme === name ? "2px solid white" : "none",
                  outlineOffset: 2,
                  cursor: "pointer",
                  padding: 0,
                  transition: "outline 0.15s, border 0.15s",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          padding: 0,
        }}
        title="Change color theme"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill={colors.accent} opacity="0.9" />
          <path d="M12 2 A10 10 0 0 1 12 22 Z" fill={colors.secondary} opacity="0.7" />
        </svg>
      </button>
    </div>
  );
}
