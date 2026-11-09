import styles from '../../assets/styles';

// Every section on the hole screen (score, putting, deadly sins, notes) starts with the same gap above its heading
describe('hole screen section spacing', () => {
    const SECTION_GAP = 20;

    it('shouldGiveEachSectionLabelTheSameGapAbove', () => {
        expect(styles.holeScreen.sectionLabel.marginTop).toBe(SECTION_GAP);
    });

    it('shouldGiveThePuttingHeadingRowTheSameGapAbove', () => {
        expect(styles.holeScreen.sectionHeaderRow.marginTop).toBe(SECTION_GAP);
    });

    it('shouldGiveTheDeadlySinsHeadingRowTheSameGapAbove', () => {
        expect(styles.deadlySinsTally.headerRow.marginTop).toBe(SECTION_GAP);
    });

    it('shouldNotAddAGapBelowTheHeaderBandSoScoreMatchesOtherSections', () => {
        expect(styles.holeScreen.band.marginBottom).toBe(0);
    });

    it('shouldNotAddAGapBelowSectionCards', () => {
        expect(styles.holeScreen.card.marginBottom).toBe(0);
        expect(styles.holeScreen.noteInput.marginBottom).toBe(0);
    });
});
