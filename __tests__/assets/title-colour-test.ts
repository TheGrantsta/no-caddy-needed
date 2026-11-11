import styles from '../../assets/styles';
import colours from '../../assets/colours';

// Titles, headers and page titles use the black primary-text colour.
// The simulation title is the exception: it sits on the dark green bar, so it stays white.
const TITLE_KEYS = new Set(['title', 'headerTitle', 'pageTitle']);
const ON_DARK_BAR = new Set(['simulation.title']);

type Block = Record<string, Record<string, unknown>>;

describe('title colour', () => {
    const titles = () =>
        Object.entries(styles as unknown as Record<string, Block>).flatMap(([block, blockStyles]) =>
            Object.entries(blockStyles)
                .filter(([key]) => TITLE_KEYS.has(key))
                .map(([key, style]) => ({ name: `${block}.${key}`, style }))
        );

    it('shouldUseTheBlackPrimaryTextColourForEveryTitleOffTheDarkBar', () => {
        const offenders = titles()
            .filter(({ name }) => !ON_DARK_BAR.has(name))
            .filter(({ style }) => style.color !== colours.black)
            .map(({ name, style }) => `${name} (${String(style.color)})`);

        expect(offenders).toEqual([]);
    });

    it('shouldKeepTheSimulationTitleWhiteOnTheDarkBar', () => {
        const simulation = titles().find(({ name }) => name === 'simulation.title');
        expect(simulation?.style.color).toBe(colours.white);
    });
});
