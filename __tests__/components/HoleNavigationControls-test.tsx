import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HoleNavigationControls from '../../components/HoleNavigationControls';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../components/WindDisplay', () => () => null);

const baseProps = {
    currentHole: 5,
    isLastHole: false,
    skipStatsFlow: false,
    onPreviousHole: jest.fn(() => Promise.resolve()),
    onNextHole: jest.fn(() => Promise.resolve()),
    onEndRound: jest.fn(),
};

describe('HoleNavigationControls', () => {
    it('shouldShowPreviousHoleButtonOnScorePhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="score" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldShowPreviousHoleButtonOnStatsPhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="stats" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldShowPreviousHoleButtonOnSinDetailsPhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="sinDetails" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldShowPreviousHoleButtonOnPuttingPhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="putting" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldCallOnPreviousHoleWhenPreviousPressedOnPuttingPhase', () => {
        const onPreviousHole = jest.fn(() => Promise.resolve());
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="putting" onPreviousHole={onPreviousHole} />);

        fireEvent.press(getByTestId('previous-hole-button'));

        expect(onPreviousHole).toHaveBeenCalledTimes(1);
    });

    it('shouldHidePreviousHoleButtonOnFirstHole', () => {
        const { queryByTestId } = render(<HoleNavigationControls {...baseProps} currentHole={1} holePhase="putting" />);

        expect(queryByTestId('previous-hole-button')).toBeNull();
    });
});
