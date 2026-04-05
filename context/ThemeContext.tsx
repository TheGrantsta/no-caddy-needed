import { darkGreen, ThemeColours } from '../assets/colours';

export function useThemeColours(): ThemeColours {
    return darkGreen;
}

export function useTheme() {
    return { colours: darkGreen };
}
