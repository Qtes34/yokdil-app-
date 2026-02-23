import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Platform } from 'react-native';
import { darkColors, lightColors, ThemeColors } from '../constants/theme';

interface ThemeContextType {
    colors: ThemeColors;
    isDark: boolean;
    toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
    colors: darkColors,
    isDark: true,
    toggleTheme: async () => { },
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: ReactNode;
    initialIsDark: boolean;
}

export function ThemeProvider({ children, initialIsDark }: ThemeProviderProps) {
    const [isDark, setIsDark] = useState(initialIsDark);

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        const newTheme = newIsDark ? 'dark' : 'light';
        try {
            await AsyncStorage.setItem('yokdil_theme', newTheme);
            if (Platform.OS === 'web') {
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
