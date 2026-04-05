import { darkColours, ThemeColours } from '../assets/colours';

export function useThemeColours(): ThemeColours {
    return darkColours;
}

export function useTheme() {
    return { colours: darkColours };
}
