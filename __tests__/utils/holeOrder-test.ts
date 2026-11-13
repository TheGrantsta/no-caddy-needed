import {
    FRONT_NINE_LAST_HOLE,
    HOLES_PER_ROUND,
    isFrontNineHole,
    splitFrontAndBackNine,
    holeAtPlayPosition,
    isFirstHoleOfRound,
    isLastHoleOfRound,
    nextHoleInRound,
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

    });

    describe('front and back nine', () => {
        it('shouldEndTheFrontNineOnHoleNine', () => {
            expect(FRONT_NINE_LAST_HOLE).toBe(9);
        });

        it('shouldCountHolesOneToNineAsTheFrontNine', () => {
            expect(isFrontNineHole(1)).toBe(true);
            expect(isFrontNineHole(9)).toBe(true);
        });

        it('shouldCountHoleTenOnwardsAsTheBackNine', () => {
            expect(isFrontNineHole(10)).toBe(false);
            expect(isFrontNineHole(18)).toBe(false);
        });
    });

    describe('splitFrontAndBackNine', () => {
        it('shouldSplitHolesIntoTheFrontAndBackNine', () => {
            const holes = Array.from({ length: 18 }, (_, i) => i + 1);

            const { front, back } = splitFrontAndBackNine(holes, hole => hole);

            expect(front).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(back).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18]);
        });

        it('shouldReadTheHoleNumberWithTheGivenAccessor', () => {
            const rows = [{ HoleNumber: 4 }, { HoleNumber: 12 }];

            const { front, back } = splitFrontAndBackNine(rows, row => row.HoleNumber);

            expect(front).toEqual([{ HoleNumber: 4 }]);
            expect(back).toEqual([{ HoleNumber: 12 }]);
        });

        it('shouldReturnEmptyNinesForAnEmptyRound', () => {
            expect(splitFrontAndBackNine([], hole => hole)).toEqual({ front: [], back: [] });
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
