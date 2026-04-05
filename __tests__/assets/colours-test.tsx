import { darkGreen, ThemeColours } from '../../assets/colours';

describe('Colour palettes', () => {
    it('brand colours match expected values', () => {
        expect(darkGreen.green).toBe('#00C851');
    });

    it('dark theme keeps original primary accent', () => {
        expect(darkGreen.primary).toBe('#2D5A3D');
        expect(darkGreen.mutedYellow).toBe('#e6be36');
    });

    it('darkGreen has expected background value', () => {
        expect(darkGreen.background).toBe('#f5f5f0');
    });

    it('darkGreen has expected text value', () => {
        expect(darkGreen.text).toBe('#1A1A2EA6');
    });

    it('default export matches darkGreen', () => {
        const defaultExport = require('../../assets/colours').default;

        expect(defaultExport).toEqual(darkGreen);
    });

    it('ThemeColours type is satisfied by darkGreen', () => {
        const dark: ThemeColours = darkGreen;

        expect(dark).toBeDefined();
    });
});
