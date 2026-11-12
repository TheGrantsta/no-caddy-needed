import styles from '../../assets/styles';
import colours from '../../assets/colours';

// The Cancel pill, its label and the circular back button look the same wherever they appear.
// These tests lock those values so a shared definition can't drift from its copies.
const CANCEL_PILL = { height: 44, borderRadius: 22, backgroundColor: colours.neutralFill, justifyContent: 'center', paddingHorizontal: 18 };
const CANCEL_TEXT = { color: colours.black, fontSize: 20 };
const CIRCLE_BUTTON = { width: 44, height: 44, borderRadius: 22, backgroundColor: colours.backgroundLight, justifyContent: 'center', alignItems: 'center' };

type Block = Record<string, Record<string, unknown>>;
const all = styles as unknown as Record<string, Block>;

describe('shared control styles', () => {
    it.each([
        ['editRound', 'cancelPill'],
        ['bagSheet', 'cancelPill'],
        ['endRoundSheet', 'cancelPill'],
        ['distancesScreen', 'cancelPill'],
        ['wedgeChart', 'cancelPill'],
    ])('shouldUseTheCancelPillFor%s.%s', (block, key) => {
        expect(all[block][key]).toEqual(CANCEL_PILL);
    });

    it.each([
        ['editRound', 'cancelText'],
        ['bagSheet', 'cancelText'],
        ['endRoundSheet', 'cancelText'],
        ['distancesScreen', 'cancelText'],
        ['wedgeChart', 'cancelText'],
        ['reminderForm', 'cancelText'],
    ])('shouldUseTheCancelLabelFor%s.%s', (block, key) => {
        expect(all[block][key]).toEqual(CANCEL_TEXT);
    });

    it.each([
        ['pageHeader', 'circleButton'],
        ['practiceHeader', 'circleButton'],
        ['settingsSheet', 'circleButton'],
        ['distancesScreen', 'circleButton'],
        ['wedgeChart', 'backButton'],
        ['deadlySinTrend', 'backButton'],
        ['editHole', 'backPill'],
    ])('shouldUseTheCircularBackButtonFor%s.%s', (block, key) => {
        expect(all[block][key]).toEqual(CIRCLE_BUTTON);
    });
});
