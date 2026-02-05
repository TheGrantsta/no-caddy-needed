export type ThemeColours = {
    text: string;
    white: string;
    black: string;
    yellow: string;
    mutedYellow: string;
    errorText: string;
    background: string;
    backgroundLight: string;
    backgroundDelete: string;
    backgroundAlternate: string;
    border: string;
    borderEdit: string;
    borderError: string;
    green: string;
};

export const darkColours: ThemeColours = {
    text: '#fffae7',
    white: '#fff',
    black: '#000',
    yellow: '#ffd33d',
    mutedYellow: '#e6be36',
    errorText: '#fd0303',
    background: '#25292e',
    backgroundLight: '#fff',
    backgroundDelete: '#fd0303',
    backgroundAlternate: '#8d98a5',
    border: '#fff',
    borderEdit: '#ccc',
    borderError: '#fd0303',
    green: '#00C851',
};

export const lightColours: ThemeColours = {
    text: '#1a1a2e',
    white: '#1a1a2e',
    black: '#000',
    yellow: '#2E7D32',
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
