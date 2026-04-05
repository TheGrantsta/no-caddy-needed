import { useTheme, useThemeColours } from '../../context/ThemeContext';
import { darkGreen } from '../../assets/colours';

describe('ThemeContext', () => {
    it('useThemeColours returns darkGreen', () => {
        expect(useThemeColours()).toEqual(darkGreen);
    });

    it('useTheme returns darkGreen', () => {
        expect(useTheme().colours).toEqual(darkGreen);
    });
});
