import fs from 'fs';
import path from 'path';

// expo-router vendors its own React Navigation. Importing @react-navigation/* directly
// creates a second navigation context, so hooks like useNavigation throw on screens.
// Unit tests mock these imports, so only a source scan can catch a regression.
const ROOT = path.join(__dirname, '../..');
const SOURCE_DIRS = ['app', 'components', 'hooks', 'context', 'service', 'utils'];
const FORBIDDEN = /from\s+['"]@react-navigation\//;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

describe('navigation imports', () => {
  it('shouldImportNavigationHooksOnlyFromExpoRouter', () => {
    const offenders = SOURCE_DIRS.flatMap(dir =>
      walk(path.join(ROOT, dir)).filter(file => FORBIDDEN.test(fs.readFileSync(file, 'utf8')))
    ).map(file => path.relative(ROOT, file));

    expect(offenders).toEqual([]);
  });
});
