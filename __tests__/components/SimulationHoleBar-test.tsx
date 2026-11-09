import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SimulationHoleBar from '../../components/SimulationHoleBar';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const renderBar = (overrides: Partial<React.ComponentProps<typeof SimulationHoleBar>> = {}) => {
    const props = {
        holeNumber: 2,
        totalHoles: 9,
        onPrevious: jest.fn(),
        onNext: jest.fn(),
        ...overrides,
    };
    return { props, ...render(<SimulationHoleBar {...props} />) };
};

describe('SimulationHoleBar', () => {
    it('shouldLabelPreviousAndNextWithTheAdjacentHoleNumbers', () => {
        const { getByText } = renderBar({ holeNumber: 2 });

        expect(getByText('Hole 1')).toBeTruthy();
        expect(getByText('Hole 3')).toBeTruthy();
    });

    it('shouldHidePreviousOnHoleOne', () => {
        const { queryByTestId } = renderBar({ holeNumber: 1 });

        expect(queryByTestId('previous-hole-button')).toBeNull();
    });

    it('shouldLabelNextAsFinishOnTheLastHole', () => {
        const { getByText, queryByText } = renderBar({ holeNumber: 9, totalHoles: 9 });

        expect(getByText('Finish')).toBeTruthy();
        expect(queryByText('Hole 10')).toBeNull();
    });

    it('shouldCallOnPreviousAndOnNextWhenPressed', () => {
        const { props, getByTestId } = renderBar();

        fireEvent.press(getByTestId('previous-hole-button'));
        fireEvent.press(getByTestId('next-hole-button'));

        expect(props.onPrevious).toHaveBeenCalledTimes(1);
        expect(props.onNext).toHaveBeenCalledTimes(1);
    });

    it('shouldLabelNeighboursWithTheGivenUnitWhenProvided', () => {
        const { getByText } = renderBar({ holeNumber: 2, totalHoles: 7, unitLabel: 'Level' });

        expect(getByText('Level 1')).toBeTruthy();
        expect(getByText('Level 3')).toBeTruthy();
    });
});
