import fs from 'fs';
import path from 'path';

// Every colour in the app comes from the token file (assets/colours.tsx).
// Hex literals elsewhere in the source are a sign a colour has bypassed the tokens.
const ROOT = path.join(__dirname, '..', '..');
const SOURCE_DIRS = ['app', 'components', 'assets', 'hooks', 'context', 'utils', 'service'];
const TOKEN_FILE = path.join(ROOT, 'assets', 'colours.tsx');
const HEX_LITERAL = /['"]#[0-9A-Fa-f]{3,8}['"]/;

const sourceFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(full);
        return /\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.endsWith('-test.tsx') ? [full] : [];
    });

describe('colour tokens', () => {
    it('shouldKeepEveryHexLiteralInTheColourTokenFile', () => {
        const offenders = SOURCE_DIRS.flatMap(dir => sourceFiles(path.join(ROOT, dir)))
            .filter(file => file !== TOKEN_FILE)
            .flatMap(file =>
                fs.readFileSync(file, 'utf8')
                    .split('\n')
                    .map((line, index) => ({ line, index: index + 1 }))
                    .filter(({ line }) => HEX_LITERAL.test(line))
                    .map(({ line, index }) => `${path.relative(ROOT, file)}:${index}: ${line.trim()}`)
            );

        expect(offenders).toEqual([]);
    });
});
