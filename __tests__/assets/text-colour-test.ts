import styles from '../../assets/styles';
import colours from '../../assets/colours';

// Primary text (titles, labels, values, button text) uses the strong black colour.
// The soft text colour is reserved for secondary text such as captions, hints and empty states.
const SECONDARY_TEXT_KEYS = new Set([
    'subtitle',
    'subtitleText',
    'hintText',
    'emptyText',
    'autoCaption',
    'axisLabel',
    'dateLabel',
    'purposeText',
    'whyText',
    'narrative',
    'message',
]);

type Block = Record<string, Record<string, unknown>>;

const entries = () =>
    Object.entries(styles as unknown as Record<string, Block>).flatMap(([block, blockStyles]) =>
        Object.entries(blockStyles).map(([key, style]) => ({ name: `${block}.${key}`, key, style }))
    );

describe('dark text colour', () => {
    it('shouldFindStylesUsingTheTextColour', () => {
        expect(entries().filter(e => (e.style as Record<string, unknown>).color === colours.text).length).toBeGreaterThan(5);
    });

    it.each(entries().filter(e => (e.style as Record<string, unknown>).color === colours.text).map(e => [e.name, e.key]))(
        'shouldUseTheBlackTextColourForPrimaryText%s',
        (_name, key) => {
            expect(SECONDARY_TEXT_KEYS.has(String(key))).toBe(true);
        }
    );
});

describe('section label colour', () => {
    const sectionLabels = () => entries().filter(e => e.key === 'sectionLabel');

    it('shouldFindSectionLabelStyles', () => {
        expect(sectionLabels().length).toBeGreaterThan(5);
    });

    it.each(sectionLabels().map(e => [e.name, e.style]))('shouldUseTheTertiaryColourForSectionLabel%s', (_name, style) => {
        expect((style as Record<string, unknown>).color).toBe(colours.tertiary);
    });
});
