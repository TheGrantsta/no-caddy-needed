import { darkGreen, ThemeColours } from '../../assets/colours';

describe('Colour palettes', () => {
    it('brand colours match expected values', () => {
        expect(darkGreen.green).toBe('#13b955');
    });

    it('dark theme keeps original primary accent', () => {
        expect(darkGreen.primary).toBe('#2D5A3D');
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

    describe('contrast', () => {
        const luminance = (hex: string) => {
            const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
            const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
        };
        const contrastRatio = (a: string, b: string) => {
            const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
            return (hi + 0.05) / (lo + 0.05);
        };

        it('shouldKeepTertiaryTextReadableOnBackground', () => {
            expect(contrastRatio(darkGreen.tertiary, darkGreen.background)).toBeGreaterThanOrEqual(4.5);
        });
    });
});
