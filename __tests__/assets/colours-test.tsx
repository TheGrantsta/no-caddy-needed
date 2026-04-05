import { darkColours, ThemeColours } from '../../assets/colours';

describe('Colour palettes', () => {
    it('brand colours match expected values', () => {
        expect(darkColours.green).toBe('#00C851');
    });

    it('dark theme keeps original primary accent', () => {
        expect(darkColours.primary).toBe('#2D5A3D');
        expect(darkColours.mutedYellow).toBe('#e6be36');
    });

    it('darkColours has expected background value', () => {
        expect(darkColours.background).toBe('#f5f5f0');
    });

    it('darkColours has expected text value', () => {
        expect(darkColours.text).toBe('#1A1A2EA6');
    });

    it('default export matches darkColours', () => {
        const defaultExport = require('../../assets/colours').default;

        expect(defaultExport).toEqual(darkColours);
    });

    it('ThemeColours type is satisfied by darkColours', () => {
        const dark: ThemeColours = darkColours;

        expect(dark).toBeDefined();
    });
});
