import styles from '../../assets/styles';

// The app uses the system font everywhere, so no style may override the font family
type Block = Record<string, Record<string, unknown>>;

describe('font family', () => {
    it('shouldNotOverrideTheSystemFontInAnyStyle', () => {
        const withFamily = Object.entries(styles as unknown as Record<string, Block>).flatMap(([block, blockStyles]) =>
            Object.entries(blockStyles)
                .filter(([, style]) => style.fontFamily !== undefined)
                .map(([key]) => `${block}.${key}`)
        );

        expect(withFamily).toEqual([]);
    });
});
