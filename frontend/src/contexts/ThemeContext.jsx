import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = ['university', 'corporate', 'ocean', 'emerald', 'midnight'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('es_theme') || 'university');
  const [dark, setDark] = useState(() => localStorage.getItem('es_dark') === 'true');

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach(t => root.classList.remove(`theme-${t}`));
    if (theme !== 'university') root.classList.add(`theme-${theme}`);
    root.classList.toggle('dark', dark);
    localStorage.setItem('es_theme', theme);
    localStorage.setItem('es_dark', dark);
  }, [theme, dark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark, setDark, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
