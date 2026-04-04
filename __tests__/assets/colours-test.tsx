import { darkColours, lightColours, ThemeColours } from '../../assets/colours';

describe('Colour palettes', () => {
    it('darkColours and lightColours have the same keys', () => {
        const darkKeys = Object.keys(darkColours).sort();
        const lightKeys = Object.keys(lightColours).sort();

        expect(darkKeys).toEqual(lightKeys);
    });

    it('brand colours match between palettes', () => {
        expect(darkColours.green).toBe('#00C851');
    });

    it('light theme uses amber accent as primary', () => {
        expect(lightColours.primary).toBe('#d97706');
        expect(lightColours.mutedYellow).toBe('#E6BE36');
    });

    it('dark theme keeps original primary accent', () => {
        expect(darkColours.primary).toBe('#2D5A3D');
        expect(darkColours.mutedYellow).toBe('#e6be36');
    });

    it('light theme white is dark for contrast on light background', () => {
        expect(lightColours.white).toBe('#fff');
    });

    it('light theme backgroundLight contrasts with light background', () => {
        expect(lightColours.backgroundLight).toBe('#FFFFFF');
    });

    it('darkColours has expected background value', () => {
        expect(darkColours.background).toBe('#f5f5f0');
    });

    it('lightColours has expected background value', () => {
        expect(lightColours.background).toBe('#fafaf9');
    });

    it('darkColours has expected text value', () => {
        expect(darkColours.text).toBe('#1A1A2EA6');
    });

    it('lightColours has expected text value', () => {
        expect(lightColours.text).toBe('#292524');
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
