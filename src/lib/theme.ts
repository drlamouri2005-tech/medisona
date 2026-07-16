import { useStudent } from "../components/StudentContext";

export interface ThemeVariables {
  "--color-bg": string;
  "--color-surface": string;
  "--color-surface-hover": string;
  "--color-border": string;
  "--color-text": string;
  "--color-text-muted": string;
  "--color-accent": string;
  "--color-accent-hover": string;
}

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  variables: ThemeVariables;
}

export const PRESET_THEMES: { [key: string]: Theme } = {
  light: {
    id: "light",
    name: "Medisona Light",
    isDark: false,
    variables: {
      "--color-bg": "#F0F7F4",
      "--color-surface": "#FFFFFF",
      "--color-surface-hover": "#F7FBF9",
      "--color-border": "rgba(112, 171, 175, 0.2)",
      "--color-text": "#32292F",
      "--color-text-muted": "#7A756D",
      "--color-accent": "#70ABAF",
      "--color-accent-hover": "#5C9498",
    },
  },
  dark: {
    id: "dark",
    name: "Sombre (Deep Night)",
    isDark: true,
    variables: {
      "--color-bg": "#070709",
      "--color-surface": "#121215",
      "--color-surface-hover": "#1A1A22",
      "--color-border": "rgba(255, 255, 255, 0.08)",
      "--color-text": "#FAF9F6",
      "--color-text-muted": "#8C929D",
      "--color-accent": "#10B981",
      "--color-accent-hover": "#34D399",
    },
  },
  signature: {
    id: "signature",
    name: "Signature Emerald",
    isDark: true,
    variables: {
      "--color-bg": "#0A0D0A",
      "--color-surface": "#121612",
      "--color-surface-hover": "#1A201A",
      "--color-border": "rgba(16, 185, 129, 0.15)",
      "--color-text": "#FAF9F6",
      "--color-text-muted": "#8C929D",
      "--color-accent": "#10B981",
      "--color-accent-hover": "#34D399",
    },
  },
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Set each CSS variable
  Object.entries(theme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Adjust standard dark class on document element for nested components
  if (theme.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Save selected theme preferences to localStorage
  localStorage.setItem("med_active_theme_id", theme.id);
  localStorage.setItem("med_active_theme_config", JSON.stringify(theme));
};

export const getSavedTheme = (): Theme => {
  const savedId = localStorage.getItem("med_active_theme_id") || "light";
  
  if (savedId === "ai-custom") {
    try {
      const customConfig = localStorage.getItem("med_active_theme_config");
      if (customConfig) {
        return JSON.parse(customConfig);
      }
    } catch (e) {
      console.error("Failed to parse custom theme configuration", e);
    }
  }

  return PRESET_THEMES[savedId] || PRESET_THEMES.light;
};
