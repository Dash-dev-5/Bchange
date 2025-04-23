"use client"

import { DefaultTheme, DarkTheme } from "react-native-paper"
import { createContext, useContext } from "react"

// Définition des couleurs de base
const colors = {
  light: {
    primary: "#1E88E5",
    primaryContainer: "#E3F2FD",
    secondary: "#26A69A",
    secondaryContainer: "#E0F2F1",
    tertiary: "#8E24AA",
    tertiaryContainer: "#F3E5F5",
    error: "#D32F2F",
    errorContainer: "#FFEBEE",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    surfaceVariant: "#F5F5F5",
    outline: "#BDBDBD",
    text: "#212121",
    textSecondary: "#757575",
    success: "#4CAF50",
    warning: "#FFC107",
    info: "#2196F3",
  },
  dark: {
    primary: "#90CAF9",
    primaryContainer: "#1565C0",
    secondary: "#80CBC4",
    secondaryContainer: "#00796B",
    tertiary: "#CE93D8",
    tertiaryContainer: "#6A1B9A",
    error: "#EF9A9A",
    errorContainer: "#B71C1C",
    background: "#121212",
    surface: "#1E1E1E",
    surfaceVariant: "#2C2C2C",
    outline: "#757575",
    text: "#FFFFFF",
    textSecondary: "#BDBDBD",
    success: "#81C784",
    warning: "#FFD54F",
    info: "#64B5F6",
  },
}

// Création des thèmes
export const createTheme = (mode = "light") => {
  const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme
  const themeColors = colors[mode]

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...themeColors,
    },
    roundness: 8,
    animation: {
      scale: 1.0,
    },
  }
}

// Contexte pour le thème
const ThemeContext = createContext()

export const ThemeProvider = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
)

export const useTheme = () => useContext(ThemeContext)
