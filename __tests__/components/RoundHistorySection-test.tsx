import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import RoundHistorySection from '../../components/RoundHistorySection';
import { Round, ParAverages } from '../../service/DbService';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const makeRound = (overrides: Partial<Round> = {}): Round => ({
    Id: 1,
    TotalScore: 0,
    StrokeTotal: 82,
    IsCompleted: 1,
    IsScoreOnly: 0,
    StartTime: '',
    EndTime: '',
    Created_At: '01/11',
    CourseName: 'St Andrews',
    HolesPlayed: 18,
    ...overrides,
} as Round);

const noAverages: ParAverages = { par3: null, par4: null, par5: null } as ParAverages;

const renderSection = (rounds: Round[], parAverages: ParAverages = noAverages) =>
    render(
        <RoundHistorySection
            rounds={rounds}
            parAverages={parAverages}
            fadeAnim={new Animated.Value(1)}
            slideAnim={new Animated.Value(0)}
        />
    );

describe('RoundHistorySection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('par averages', () => {
        it('shouldShowAverageScoreForEachParWithTwoDecimalPlaces', () => {
            const { getByTestId } = renderSection(
                [makeRound()],
                { par3: 3.5, par4: 4.25, par5: 5 } as ParAverages
            );

            expect(getByTestId('par-averages-par3')).toHaveTextContent('Par 3: 3.50');
            expect(getByTestId('par-averages-par4')).toHaveTextContent('Par 4: 4.25');
            expect(getByTestId('par-averages-par5')).toHaveTextContent('Par 5: 5.00');
        });

        it('shouldShowDashWhenThereIsNoAverageForAPar', () => {
            const { getByTestId } = renderSection([makeRound()]);

            expect(getByTestId('par-averages-par4')).toHaveTextContent('Par 4: -');
        });
    });

    describe('round rows', () => {
        it('shouldShowColumnHeadersForDateCourseAndScore', () => {
            const { getByTestId } = renderSection([makeRound()]);

            expect(getByTestId('round-history-header-date')).toHaveTextContent('Date');
            expect(getByTestId('round-history-header-course')).toHaveTextContent('Course');
            expect(getByTestId('round-history-header-strokes')).toHaveTextContent('Score');
        });

        it('shouldShowOneRowPerRoundWithDateAndStrokeTotal', () => {
            const { getByTestId } = renderSection([
                makeRound({ Id: 1, Created_At: '01/11', StrokeTotal: 82 }),
                makeRound({ Id: 2, Created_At: '02/11', StrokeTotal: 90 }),
            ]);

            expect(getByTestId('round-history-date-1')).toHaveTextContent('01/11');
            expect(getByTestId('round-history-strokes-1')).toHaveTextContent('82');
            expect(getByTestId('round-history-date-2')).toHaveTextContent('02/11');
            expect(getByTestId('round-history-strokes-2')).toHaveTextContent('90');
        });

        it('shouldShowDashWhenRoundHasNoStrokeTotal', () => {
            const { getByTestId } = renderSection([makeRound({ StrokeTotal: null as unknown as number })]);

            expect(getByTestId('round-history-strokes-1')).toHaveTextContent('-');
        });

        it('shouldShowHolesPlayedForRoundsShorterThanEighteenHoles', () => {
            const { getByText } = renderSection([makeRound({ HolesPlayed: 9 })]);

            expect(getByText('St Andrews (9)')).toBeTruthy();
        });

        it('shouldNotShowHolesPlayedForEighteenHoleRounds', () => {
            const { getByText, queryByText } = renderSection([makeRound({ HolesPlayed: 18 })]);

            expect(getByText('St Andrews')).toBeTruthy();
            expect(queryByText('St Andrews (18)')).toBeNull();
        });

        it('shouldOpenScorecardWhenRowPressed', () => {
            const { getByTestId } = renderSection([makeRound({ Id: 7 })]);

            fireEvent.press(getByTestId('round-history-row-7'));

            expect(mockPush).toHaveBeenCalledWith({ pathname: '/play/scorecard', params: { roundId: '7' } });
        });
    });

    describe('empty state', () => {
        it('shouldRenderNothingWhenThereAreNoRounds', () => {
            const { queryByTestId, queryByText } = renderSection([]);

            expect(queryByTestId('par-averages-container')).toBeNull();
            expect(queryByText('Round history')).toBeNull();
        });

        it('shouldShowRoundHistoryTitleWhenRoundsExist', () => {
            const { getByText } = renderSection([makeRound()]);

            expect(getByText('Round history')).toBeTruthy();
        });
    });

    it('shows the par averages and the round history each on a card', () => {
        const { getByTestId } = renderSection([makeRound({ Id: 1, StrokeTotal: 80 })]);

        expect(getByTestId('par-averages-card')).toHaveStyle({ borderRadius: 20 });
        expect(getByTestId('round-history-card')).toHaveStyle({ borderRadius: 20 });
    });

    it('aligns the Round history heading with the content on its card', () => {
        const { getByText } = renderSection([makeRound({ Id: 1, StrokeTotal: 80 })]);

        expect(getByText('Round history')).toHaveStyle({ padding: 0 });
    });

    it('shows each round score in bold so it reads like a list item', () => {
        const { getByTestId } = renderSection([makeRound({ Id: 1, StrokeTotal: 80 })]);

        expect(getByTestId('round-history-strokes-1')).toHaveStyle({ fontWeight: 'bold' });
    });

    it('makes the round list tall enough to show the last ten rounds without scrolling', () => {
        const rounds = Array.from({ length: 12 }, (_, i) => makeRound({ Id: i + 1, StrokeTotal: 80 }));
        const { getByTestId } = renderSection(rounds);

        expect(getByTestId('round-history-scroll')).toHaveStyle({ maxHeight: 480 });
        expect(getByTestId('round-history-row-1')).toHaveStyle({ minHeight: 48 });
    });
});
