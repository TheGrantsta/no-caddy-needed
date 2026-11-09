import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RoundSummary from '../../components/RoundSummary';
import { buildRoundSummary } from '../../utils/roundSummary';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const summaryFor = (isScoreOnly: boolean) => buildRoundSummary({
    courseName: 'Stats Flow Test Course',
    players: [{ Id: 1, PlayerName: 'You' }, { Id: 2, PlayerName: 'James M' }],
    holeScores: [
        { RoundPlayerId: 1, HoleNumber: 1, Score: 4 },
        { RoundPlayerId: 2, HoleNumber: 1, Score: 5 },
        { RoundPlayerId: 1, HoleNumber: 2, Score: 3 },
        { RoundPlayerId: 2, HoleNumber: 2, Score: 4 },
    ],
    putting: [{ hole: 1, firstPutt: 20, secondPutt: 3, greenInRegulation: true }],
    sins: { TroubleOffTee: 2, Penalties: 1, ThreePutts: 0, BogeysInside9Iron: 0, DoubleChips: 0, DoubleBogeys: 0, BogeysPar5: 0 },
    isScoreOnly,
});

const renderSummary = (isScoreOnly = false) => {
    const onDone = jest.fn();
    const onViewPerformance = jest.fn();
    const utils = render(
        <RoundSummary summary={summaryFor(isScoreOnly)} onDone={onDone} onViewPerformance={onViewPerformance} />
    );
    return { ...utils, onDone, onViewPerformance };
};

describe('RoundSummary', () => {
    it('shouldConfirmTheRoundWasSaved', () => {
        const { getByText } = renderSummary();

        expect(getByText('Round saved')).toBeTruthy();
    });

    it('shouldShowCourseHolesAndDateInTheSubtitle', () => {
        const { getByText } = renderSummary();

        expect(getByText('Stats Flow Test Course · 2 holes · Today')).toBeTruthy();
    });

    it('shouldListEachPlayersStrokes', () => {
        const { getByText, getByTestId } = renderSummary();

        expect(getByText('Strokes')).toBeTruthy();
        expect(getByTestId('summary-strokes-1')).toHaveTextContent('7');
        expect(getByTestId('summary-strokes-2')).toHaveTextContent('9');
    });

    it('shouldShowPuttsAndGirTilesWithoutAPuttingHeading', () => {
        const { getByText, getByTestId, queryByText } = renderSummary();

        expect(queryByText('Your putting')).toBeNull();
        expect(getByText('Putts')).toBeTruthy();
        expect(getByTestId('summary-putts')).toHaveTextContent('2');
        expect(getByText('GIR')).toBeTruthy();
        expect(queryByText('Greens in regulation')).toBeNull();
        expect(getByTestId('summary-greens')).toHaveTextContent('1 of 2');
    });

    it('shouldShowMarkedSinsWithTheirTotal', () => {
        const { getByText, getByTestId } = renderSummary();

        expect(getByText('Deadly sins')).toBeTruthy();
        expect(getByText('3 total')).toBeTruthy();
        expect(getByText('Trouble off tee')).toBeTruthy();
        expect(getByTestId('summary-sin-trouble-off-tee')).toHaveTextContent(/2$/);
    });

    it('shouldShowZeroCountSinsMuted', () => {
        const { getByTestId } = renderSummary();

        const { StyleSheet } = require('react-native');
        expect(StyleSheet.flatten(getByTestId('summary-sin-bogeys-inside-9iron').props.style)).toEqual(expect.objectContaining({ opacity: 0.5 }));
    });

    it('shouldHidePuttingAndSinsForScoreOnlyRounds', () => {
        const { queryByText } = renderSummary(true);

        expect(queryByText('Your putting')).toBeNull();
        expect(queryByText('Deadly sins')).toBeNull();
        expect(queryByText('Strokes')).toBeTruthy();
    });

    it('shouldCallOnDoneWhenDonePressed', () => {
        const { getByTestId, onDone } = renderSummary();

        fireEvent.press(getByTestId('round-summary-done-button'));

        expect(onDone).toHaveBeenCalled();
    });

    it('shouldCallOnViewPerformanceWhenLinkPressed', () => {
        const { getByTestId, onViewPerformance } = renderSummary();

        fireEvent.press(getByTestId('round-summary-performance-button'));

        expect(onViewPerformance).toHaveBeenCalled();
    });

    it('shouldShowTheRoundSavedTitleOnOneLineAtHeaderSize', () => {
        const { StyleSheet } = require('react-native');
        const fontSizes = require('../../assets/font-sizes').default;
        const { getByText } = renderSummary();

        const style = StyleSheet.flatten(getByText('Round saved').props.style);
        expect(style.fontSize).toBeLessThanOrEqual(fontSizes.header);
    });
});
