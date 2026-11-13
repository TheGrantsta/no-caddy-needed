import { createStyles } from '../../assets/styles';
import colours from '../../assets/colours';

// The Edit pill (white, rounded, green text) is one style shared by every screen that has an Edit button
const styles = createStyles(colours as any) as unknown as Record<string, Record<string, Record<string, unknown>>>;

describe('Edit pill', () => {
    it('shouldUseTheSameButtonStyleOnTheDistancesScreen', () => {
        expect(styles.distancesScreen.editButton).toEqual(styles.pageHeader.editPill);
    });

    it('shouldUseTheSameButtonStyleOnTheWedgeChartScreen', () => {
        expect(styles.wedgeChart.editButton).toEqual(styles.pageHeader.editPill);
    });

    it('shouldUseTheSameTextStyleOnEveryScreen', () => {
        expect(styles.distancesScreen.editText).toEqual(styles.pageHeader.editPillText);
        expect(styles.wedgeChart.editText).toEqual(styles.pageHeader.editPillText);
    });

    it('shouldBeAWhitePillWithAMinimumWidthAndGreenText', () => {
        expect(styles.pageHeader.editPill).toMatchObject({ minWidth: 72, height: 44, borderRadius: 22, backgroundColor: colours.backgroundLight });
        expect(styles.pageHeader.editPillText).toMatchObject({ color: colours.primary, fontWeight: '600' });
    });
});
