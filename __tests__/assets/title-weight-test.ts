import styles from '../../assets/styles';

// Titles, headers and page titles all use the bold weight, so they read as one family
const TITLE_KEYS = new Set(['title', 'headerTitle', 'pageTitle']);

type Block = Record<string, Record<string, unknown>>;

describe('title font weight', () => {
    const titles = () =>
        Object.entries(styles as unknown as Record<string, Block>).flatMap(([block, blockStyles]) =>
            Object.entries(blockStyles)
                .filter(([key]) => TITLE_KEYS.has(key))
                .map(([key, style]) => ({ name: `${block}.${key}`, style }))
        );

    it('shouldFindTitleStyles', () => {
        expect(titles().length).toBeGreaterThan(10);
    });

    it('shouldUseTheBoldWeightForEveryTitle', () => {
        const offenders = titles()
            .filter(({ style }) => style.fontWeight !== 'bold')
            .map(({ name, style }) => `${name} (${String(style.fontWeight)})`);

        expect(offenders).toEqual([]);
    });
});
