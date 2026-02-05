import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { darkColours, lightColours, ThemeColours } from '../assets/colours';
import { getSettingsService, saveSettingsService } from '../service/DbService';

type ThemeContextType = {
    theme: 'dark' | 'light';
    colours: ThemeColours;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    colours: darkColours,
    setTheme: () => {},
    toggleTheme: () => {},
});

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const settings = getSettingsService();
    const [theme, setThemeState] = useState<'dark' | 'light'>(settings.theme);

    const colours = useMemo(() => (theme === 'dark' ? darkColours : lightColours), [theme]);

    const setTheme = useCallback((newTheme: 'dark' | 'light') => {
        setThemeState(newTheme);
        const currentSettings = getSettingsService();
        saveSettingsService({ ...currentSettings, theme: newTheme });
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            const currentSettings = getSettingsService();
            saveSettingsService({ ...currentSettings, theme: newTheme });
            return newTheme;
        });
    }, []);

    const value = useMemo(() => ({ theme, colours, setTheme, toggleTheme }), [theme, colours, setTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export const useThemeColours = (): ThemeColours => {
    const { colours } = useContext(ThemeContext);
    return colours;
};
