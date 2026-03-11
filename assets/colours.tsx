export type ThemeColours = {
    primary: string;
    secondary: string;
    background: string;

    text: string;
    red: string;
    white: string;
    black: string;

    mutedYellow: string;
    errorText: string;
    backgroundLight: string;
    backgroundDelete: string;
    backgroundAlternate: string;
    border: string;
    borderEdit: string;
    borderError: string;
    green: string;
};

export const darkColours: ThemeColours = {
    primary: '#2D5A3D',
    secondary: '#FFFFFF26',
    background: '#f5f5f0',
    backgroundAlternate: '#FFFFFF26',

    text: '#1A1A2EA6',
    white: '#fff',
    red: '#fd0303',
    black: '#000',

    mutedYellow: '#e6be36',
    errorText: '#fd0303',
    backgroundLight: '#fff',
    backgroundDelete: '#fd0303',
    border: '#fff',
    borderEdit: '#ccc',
    borderError: '#fd0303',
    green: '#00C851',
};

export const lightColours: ThemeColours = {
    primary: '#2E7D32',
    secondary: '#1B5E20',
    background: '#f5f5f0',
    backgroundAlternate: '#dfe3e8',

    text: '#1a1a2e',
    white: '#1a1a2e',
    red: '#d32f2f',
    black: '#000',

    mutedYellow: '#1B5E20',
    errorText: '#d32f2f',
    backgroundLight: '#dfe3e8',
    backgroundDelete: '#d32f2f',

    border: '#3a3a3a',
    borderEdit: '#999',
    borderError: '#d32f2f',
    green: '#00C851',
};

export default darkColours;
