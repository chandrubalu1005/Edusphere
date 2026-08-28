import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = ['crimson', 'emerald', 'cobalt', 'plum'];

// Migrate legacy theme names
function migrateTheme(stored) {
  const map = { university: 'crimson', corporate: 'crimson' };
  return map[stored] || stored || 'crimson';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => migrateTheme(localStorage.getItem('es_theme')));
  const [dark, setDark] = useState(() => localStorage.getItem('es_dark') === 'true');

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach(t => root.classList.remove(`theme-${t}`));
    // 'crimson' is the default — no extra class needed
    if (theme !== 'crimson') root.classList.add(`theme-${theme}`);
    root.classList.toggle('dark', dark);
    localStorage.setItem('es_theme', theme);
    localStorage.setItem('es_dark', String(dark));
  }, [theme, dark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark, setDark, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

