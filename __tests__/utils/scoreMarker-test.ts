import colours from '../../assets/colours';
import { getScoreMarker, SCORE_MARKER_COLOURS } from '../../utils/scoreMarker';

describe('getScoreMarker', () => {
    it('shouldMarkAnEagleOrBetterYellowWithWhiteText', () => {
        expect(getScoreMarker(-2)).toEqual({
            category: 'eagle',
            background: SCORE_MARKER_COLOURS.eagle,
            text: colours.white,
        });
        expect(getScoreMarker(-3).category).toBe('eagle');
    });

    it('shouldMarkABirdieRedWithWhiteText', () => {
        expect(getScoreMarker(-1)).toEqual({
            category: 'birdie',
            background: colours.errorText,
            text: colours.white,
        });
    });

    it('shouldMarkParGreyWithWhiteText', () => {
        expect(getScoreMarker(0)).toEqual({
            category: 'par',
            background: SCORE_MARKER_COLOURS.par,
            text: colours.white,
        });
    });

    it('shouldMarkABogeyBlackWithWhiteText', () => {
        expect(getScoreMarker(1)).toEqual({
            category: 'bogey',
            background: colours.black,
            text: colours.white,
        });
    });

    it('shouldMarkADoubleBogeyOrWorseBlueWithWhiteText', () => {
        expect(getScoreMarker(2)).toEqual({
            category: 'doubleBogey',
            background: SCORE_MARKER_COLOURS.doubleBogey,
            text: colours.white,
        });
        expect(getScoreMarker(7).category).toBe('doubleBogey');
    });

    it('shouldUseDistinctBackgroundsForEachCategory', () => {
        const backgrounds = [-2, -1, 0, 1, 2].map(diff => getScoreMarker(diff).background);
        expect(new Set(backgrounds).size).toBe(5);
    });
});
