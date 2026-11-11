import fs from 'fs';
import path from 'path';
import styles from '../../assets/styles';
import fontSizes, { displaySizes } from '../../assets/font-sizes';

// Text sizes come from the font scale. Large display readouts (the big scores and numbers) are
// listed separately, since they are deliberate one-off sizes rather than text.
const SCALE_VALUES = new Set<number>(Object.values(fontSizes));
const DISPLAY_SIZES = new Set<number>(Object.values(displaySizes));

const ROOT = path.join(__dirname, '..', '..');
const SOURCE_DIRS = ['app', 'components'];

type Block = Record<string, Record<string, unknown>>;

const sourceFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(full);
        return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('-test.tsx') ? [full] : [];
    });

describe('font size scale', () => {
    it('shouldUseOnlyScaleSizesOrDisplaySizesInTheStylesheet', () => {
        const offenders = Object.entries(styles as unknown as Record<string, Block>).flatMap(([block, blockStyles]) =>
            Object.entries(blockStyles)
                .filter(([, style]) => {
                    const size = style.fontSize;
                    return typeof size === 'number' && !SCALE_VALUES.has(size) && !DISPLAY_SIZES.has(size);
                })
                .map(([key, style]) => `${block}.${key} (${String(style.fontSize)})`)
        );

        expect(offenders).toEqual([]);
    });

    it('shouldNotHardCodeTextSizesInScreensOrComponents', () => {
        const offenders = SOURCE_DIRS.flatMap(dir => sourceFiles(path.join(ROOT, dir))).flatMap(file =>
            fs.readFileSync(file, 'utf8')
                .split('\n')
                .map((line, index) => ({ line, index: index + 1 }))
                .filter(({ line }) => /fontSize: \d+/.test(line))
                .map(({ line, index }) => `${path.relative(ROOT, file)}:${index}: ${line.trim()}`)
        );

        expect(offenders).toEqual([]);
    });
});

describe('display sizes', () => {
    it('shouldNotHardCodeFontSizeNumbersInTheStylesheet', () => {
        const offenders = fs
            .readFileSync(path.join(ROOT, 'assets', 'styles.tsx'), 'utf8')
            .split('\n')
            .map((line, index) => ({ line, index: index + 1 }))
            .filter(({ line }) => /fontSize: \d+/.test(line))
            .map(({ line, index }) => `styles.tsx:${index}: ${line.trim()}`);

        expect(offenders).toEqual([]);
    });

    it('shouldNameEachBigReadoutSizeInTheDisplayScale', () => {
        expect(displaySizes).toEqual({ hole: 40, windSpeed: 56, roundScore: 64, distance: 72, tempo: 96, random: 120 });
    });
});
