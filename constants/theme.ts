export const lightColors = {
    primary: '#16a34a',
    primaryDark: '#15803d',
    primaryLight: '#15803d',
    secondary: '#3b82f6',
    accent: '#3b82f6',
    success: '#10b981',
    successBg: '#d1fae5',
    error: '#ef4444',
    errorBg: '#fee2e2',
    warning: '#f59e0b',
    info: '#3b82f6',
    ratingAgain: '#ef4444',
    ratingHard: '#f59e0b',
    ratingGood: '#10b981',
    ratingEasy: '#3b82f6',
    background: '#f4f5f9',
    surface: '#ffffff',
    surfaceLight: '#f8fafc',
    card: '#ffffff',
    cardLight: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
    borderStrong: '#cbd5e1',
    wordColor: '#0f172a',
    wordMeaning: '#334155',
    wordSynonym: '#64748b',
    wordExample: '#475569',
};

export const darkColors: typeof lightColors = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryLight: '#4ade80',
    secondary: '#60a5fa',
    accent: '#60a5fa',
    success: '#10b981',
    successBg: '#064e3b',
    error: '#ef4444',
    errorBg: '#7f1d1d',
    warning: '#f59e0b',
    info: '#60a5fa',
    ratingAgain: '#ef4444',
    ratingHard: '#f59e0b',
    ratingGood: '#10b981',
    ratingEasy: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceLight: '#334155',
    card: '#1e293b',
    cardLight: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    border: '#334155',
    borderSubtle: '#1e293b',
    borderStrong: '#475569',
    wordColor: '#ffffff',
    wordMeaning: '#f1f5f9',
    wordSynonym: '#cbd5e1',
    wordExample: '#94a3b8',
};

export type ThemeColors = typeof lightColors;

// Legacy static fallback — components should prefer useTheme().colors
export const Colors = darkColors;

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};

export const FontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
};

export const Shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
};
