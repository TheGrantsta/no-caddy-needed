import { darkColours, lightColours, ThemeColours } from '../../assets/colours';

describe('Colour palettes', () => {
    it('darkColours and lightColours have the same keys', () => {
        const darkKeys = Object.keys(darkColours).sort();
        const lightKeys = Object.keys(lightColours).sort();

        expect(darkKeys).toEqual(lightKeys);
    });

    it('brand colours match between palettes', () => {
        expect(darkColours.yellow).toBe(lightColours.yellow);
        expect(darkColours.mutedYellow).toBe(lightColours.mutedYellow);
        expect(darkColours.green).toBe(lightColours.green);
        expect(darkColours.white).toBe(lightColours.white);
        expect(darkColours.black).toBe(lightColours.black);
    });

    it('darkColours has expected background value', () => {
        expect(darkColours.background).toBe('#25292e');
    });

    it('lightColours has expected background value', () => {
        expect(lightColours.background).toBe('#f5f5f0');
    });

    it('darkColours has expected text value', () => {
        expect(darkColours.text).toBe('#fffae7');
    });

    it('lightColours has expected text value', () => {
        expect(lightColours.text).toBe('#1a1a2e');
    });

    it('default export matches darkColours', () => {
        const defaultExport = require('../../assets/colours').default;

        expect(defaultExport).toEqual(darkColours);
    });

    it('ThemeColours type is satisfied by both palettes', () => {
        const dark: ThemeColours = darkColours;
        const light: ThemeColours = lightColours;

        expect(dark).toBeDefined();
        expect(light).toBeDefined();
    });
});
