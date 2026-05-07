import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

const LS_KEY = 'careerCopilot_pref_darkMode';

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(LS_KEY) === 'true';
  });

  // Apply / remove "dark" class on <html> and persist immediately
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LS_KEY, isDark ? 'true' : 'false');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
