import { useTheme, useThemeColours } from '../../context/ThemeContext';
import { darkColours } from '../../assets/colours';

describe('ThemeContext', () => {
    it('useThemeColours returns darkColours', () => {
        expect(useThemeColours()).toEqual(darkColours);
    });

    it('useTheme returns darkColours', () => {
        expect(useTheme().colours).toEqual(darkColours);
    });
});
