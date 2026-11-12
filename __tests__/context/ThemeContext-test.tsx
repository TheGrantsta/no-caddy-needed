import { useTheme, useThemeColours } from '../../context/ThemeContext';
import { darkGreen } from '../../assets/colours';

// This test checks the real theme provider, so the shared theme mock is turned off
jest.unmock('../../context/ThemeContext');

describe('ThemeContext', () => {
    it('useThemeColours returns darkGreen', () => {
        expect(useThemeColours()).toEqual(darkGreen);
    });

    it('useTheme returns darkGreen', () => {
        expect(useTheme().colours).toEqual(darkGreen);
    });
});
