import styles from '../../assets/styles';
import fontSizes from '../../assets/font-sizes';

// Page titles (a whole screen's heading) use the header size.
// Sheet, card and challenge bar titles use the subHeader size.
const PAGE_TITLES = [
    'practiceHeader.title',
    'roundSummary.title',
    'settingsSheet.headerTitle',
    'pageHeader.title',
    'onboardingOverlay.title',
    'distancesScreen.title',
    'wedgeChart.title',
    'deadlySinTrend.pageTitle',
    'errorBoundary.title',
];

const SHEET_TITLES = [
    'bagSheet.title',
    'editRound.title',
    'editHole.title',
    'endRoundSheet.title',
    'windEffect.title',
    'windPopover.title',
    'deadlySinsChart.title',
    'drillStatsChart.title',
    'simulation.title',
];

type Block = Record<string, Record<string, unknown>>;
const sizeOf = (path: string) => {
    const [block, key] = path.split('.');
    return (styles as unknown as Record<string, Block>)[block][key].fontSize;
};

describe('title sizes', () => {
    it.each(PAGE_TITLES)('shouldUseThePageHeaderSizeFor%s', path => {
        expect(sizeOf(path)).toBe(fontSizes.header);
    });

    it.each(SHEET_TITLES)('shouldUseTheSubHeaderSizeFor%s', path => {
        expect(sizeOf(path)).toBe(fontSizes.subHeader);
    });
});
