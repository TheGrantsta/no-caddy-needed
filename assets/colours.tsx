export type ThemeColours = {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    backgroundAlternate: string;
    text: string;
    red: string;
    white: string;
    black: string;
    mutedYellow: string;
    errorText: string;
    backgroundLight: string;
    border: string;
    borderError: string;
    green: string;
};

export const darkColours: ThemeColours = {
    primary: '#2D5A3D',
    secondary: '#FFFFFF26',
    tertiary: '#8FA79A',
    background: '#f5f5f0',
    backgroundAlternate: '#FFFFFF26',
    text: '#1A1A2EA6',
    white: '#fff',
    red: '#fd0303',
    black: '#000',
    mutedYellow: '#e6be36',
    errorText: '#fd0303',
    backgroundLight: '#fff',
    border: '#fff',
    borderError: '#fd0303',
    green: '#00C851',
};

export const lightColours: ThemeColours = {
    primary: '#d97706',
    secondary: '#b45309',
    tertiary: '#f97316',
    background: '#fafaf9',
    backgroundAlternate: '#EAF5EF',
    text: '#292524',
    white: '#fff',
    red: '#fd0303',
    black: '#000',
    mutedYellow: '#E6BE36',
    errorText: '#fd0303',
    backgroundLight: '#FFFFFF',
    border: '#D6E6DD',
    borderError: '#fd0303',
    green: '#2FBF71',
};

export default darkColours;
