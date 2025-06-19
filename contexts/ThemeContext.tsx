import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserTheme, setUserTheme } from '../api/api';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode; jwt?: string }> = ({ children, jwt }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  // Fetch theme from backend or local storage on mount or when jwt changes
  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      try {
        let backendTheme;
        if (jwt) {
          const res = await getUserTheme(jwt);
          backendTheme = res.data.theme;
        }
        const localTheme = await AsyncStorage.getItem('theme');
        if (backendTheme === 'light' || backendTheme === 'dark') {
          setThemeState(backendTheme);
          await AsyncStorage.setItem('theme', backendTheme);
        } else if (localTheme === 'light' || localTheme === 'dark') {
          setThemeState(localTheme);
        } else {
          setThemeState('light');
        }
      } catch {
        const localTheme = await AsyncStorage.getItem('theme');
        if (localTheme === 'light' || localTheme === 'dark') {
          setThemeState(localTheme);
        } else {
          setThemeState('light');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, [jwt]);

  // Change theme everywhere
  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
    if (jwt) {
      try {
        await setUserTheme(newTheme, jwt);
      } catch {}
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}; 