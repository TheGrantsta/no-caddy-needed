import {
    HOLES_PER_ROUND,
    holeAtPlayPosition,
    isFirstHoleOfRound,
    isLastHoleOfRound,
    nextHoleInRound,
    playPositionOf,
    previousHoleInRound,
    sanitiseStartHole,
} from '../../utils/holeOrder';

describe('hole order', () => {
    it('shouldPlayEighteenHoles', () => {
        expect(HOLES_PER_ROUND).toBe(18);
    });

    describe('when the round starts on hole 1', () => {
        it('shouldMoveFromHoleOneToHoleTwo', () => {
            expect(nextHoleInRound(1, 1)).toBe(2);
        });

        it('shouldEndTheRoundAfterHoleEighteen', () => {
            expect(isLastHoleOfRound(18, 1)).toBe(true);
            expect(isLastHoleOfRound(17, 1)).toBe(false);
        });

        it('shouldHaveNoPreviousHoleOnHoleOne', () => {
            expect(isFirstHoleOfRound(1, 1)).toBe(true);
        });
    });

    describe('a shotgun start on hole 10', () => {
        it('shouldPlayHoleTenThenContinueToEighteenThenWrapToOne', () => {
            expect(nextHoleInRound(10, 10)).toBe(11);
            expect(nextHoleInRound(18, 10)).toBe(1);
        });

        it('shouldEndTheRoundAfterHoleNine', () => {
            expect(isLastHoleOfRound(9, 10)).toBe(true);
            expect(isLastHoleOfRound(8, 10)).toBe(false);
        });

        it('shouldHaveNoPreviousHoleOnHoleTen', () => {
            expect(isFirstHoleOfRound(10, 10)).toBe(true);
        });

        it('shouldGoBackFromHoleOneToHoleEighteen', () => {
            expect(previousHoleInRound(1, 10)).toBe(18);
            expect(previousHoleInRound(11, 10)).toBe(10);
        });

        it('shouldFindTheHoleAtEachPlayPosition', () => {
            expect(holeAtPlayPosition(10, 0)).toBe(10);
            expect(holeAtPlayPosition(10, 8)).toBe(18);
            expect(holeAtPlayPosition(10, 9)).toBe(1);
            expect(holeAtPlayPosition(10, 17)).toBe(9);
        });

        it('shouldGiveThePlayPositionOfEachHole', () => {
            expect(playPositionOf(10, 10)).toBe(0);
            expect(playPositionOf(1, 10)).toBe(9);
        });
    });

    describe('sanitiseStartHole', () => {
        it('shouldKeepAHoleBetweenOneAndEighteen', () => {
            expect(sanitiseStartHole(7)).toBe(7);
        });

        it('shouldFallBackToHoleOneForAnyOtherValue', () => {
            expect(sanitiseStartHole(0)).toBe(1);
            expect(sanitiseStartHole(19)).toBe(1);
            expect(sanitiseStartHole(Number.NaN)).toBe(1);
            expect(sanitiseStartHole(null)).toBe(1);
        });
    });
});
