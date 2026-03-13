import { createContext, useContext, useEffect, useState } from "react";

export type ColorThemeName = "sunburst" | "emerald" | "coral" | "violet" | "arctic" | "amber";

export interface ThemeColors {
  accent: string;
  accentRgb: string;
  secondary: string;
  secondaryRgb: string;
  bg: string;
  bgRgb: string;
  bgLight: string;
  bgLightRgb: string;
}

export const THEMES: Record<ColorThemeName, ThemeColors> = {
  sunburst: {
    accent: "#FFDD00", accentRgb: "255, 221, 0",
    secondary: "#5BBCFF", secondaryRgb: "91, 188, 255",
    bg: "#021526", bgRgb: "2, 21, 38",
    bgLight: "#0a1628", bgLightRgb: "10, 22, 40",
  },
  emerald: {
    accent: "#00E676", accentRgb: "0, 230, 118",
    secondary: "#80CBC4", secondaryRgb: "128, 203, 196",
    bg: "#0D1117", bgRgb: "13, 17, 23",
    bgLight: "#161B22", bgLightRgb: "22, 27, 34",
  },
  coral: {
    accent: "#FF6B6B", accentRgb: "255, 107, 107",
    secondary: "#FFB347", secondaryRgb: "255, 179, 71",
    bg: "#1A0A1E", bgRgb: "26, 10, 30",
    bgLight: "#241230", bgLightRgb: "36, 18, 48",
  },
  violet: {
    accent: "#BB86FC", accentRgb: "187, 134, 252",
    secondary: "#03DAC6", secondaryRgb: "3, 218, 198",
    bg: "#121212", bgRgb: "18, 18, 18",
    bgLight: "#1E1E2E", bgLightRgb: "30, 30, 46",
  },
  arctic: {
    accent: "#64FFDA", accentRgb: "100, 255, 218",
    secondary: "#82B1FF", secondaryRgb: "130, 177, 255",
    bg: "#0A192F", bgRgb: "10, 25, 47",
    bgLight: "#112240", bgLightRgb: "17, 34, 64",
  },
  amber: {
    accent: "#FFB300", accentRgb: "255, 179, 0",
    secondary: "#FF7043", secondaryRgb: "255, 112, 67",
    bg: "#1B1510", bgRgb: "27, 21, 16",
    bgLight: "#2A2015", bgLightRgb: "42, 32, 21",
  },
};

const THEME_NAMES: ColorThemeName[] = ["sunburst", "emerald", "coral", "violet", "arctic", "amber"];

interface ColorThemeContextValue {
  colorTheme: ColorThemeName;
  setColorTheme: (theme: ColorThemeName) => void;
  colors: ThemeColors;
  themeNames: ColorThemeName[];
}

const ColorThemeContext = createContext<ColorThemeContextValue | undefined>(undefined);

function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement.style;
  root.setProperty("--folio-accent", colors.accent);
  root.setProperty("--folio-accent-rgb", colors.accentRgb);
  root.setProperty("--folio-secondary", colors.secondary);
  root.setProperty("--folio-secondary-rgb", colors.secondaryRgb);
  root.setProperty("--folio-bg", colors.bg);
  root.setProperty("--folio-bg-rgb", colors.bgRgb);
  root.setProperty("--folio-bg-light", colors.bgLight);
  root.setProperty("--folio-bg-light-rgb", colors.bgLightRgb);
  root.backgroundColor = colors.bg;
}

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorThemeName>(() => {
    const saved = localStorage.getItem("folio-color-theme");
    if (saved && THEME_NAMES.includes(saved as ColorThemeName)) {
      return saved as ColorThemeName;
    }
    return "sunburst";
  });

  const colors = THEMES[colorTheme];

  const setColorTheme = (theme: ColorThemeName) => {
    setColorThemeState(theme);
    localStorage.setItem("folio-color-theme", theme);
  };

  useEffect(() => {
    applyThemeColors(colors);
  }, [colorTheme, colors]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme, colors, themeNames: THEME_NAMES }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
