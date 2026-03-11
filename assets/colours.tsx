export type ThemeColours = {
    primary: string;
    background: string;

    text: string;
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
    background: '#f5f5f0',
    text: '#1A1A2EA6',

    white: '#fff',
    black: '#000',
    mutedYellow: '#e6be36',
    errorText: '#fd0303',
    backgroundLight: '#fff',
    backgroundDelete: '#fd0303',
    backgroundAlternate: '#8d98a5',
    border: '#fff',
    borderEdit: '#ccc',
    borderError: '#fd0303',
    green: '#00C851',
};

export const lightColours: ThemeColours = {
    primary: '#2E7D32',
    text: '#1a1a2e',
    white: '#1a1a2e',
    black: '#000',
    mutedYellow: '#1B5E20',
    errorText: '#d32f2f',
    background: '#f5f5f0',
    backgroundLight: '#dfe3e8',
    backgroundDelete: '#d32f2f',
    backgroundAlternate: '#dfe3e8',
    border: '#3a3a3a',
    borderEdit: '#999',
    borderError: '#d32f2f',
    green: '#00C851',
};

export default darkColours;
