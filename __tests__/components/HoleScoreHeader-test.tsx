import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { HoleScoreHeader } from '../../components/HoleScoreInput';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const renderHeader = (overrides: object = {}) => {
    const handlers = { onParChange: jest.fn(), onEndRound: jest.fn(), onOpenBag: jest.fn() };
    const utils = render(
        <HoleScoreHeader holeNumber={2} courseName="New course" par={4} {...handlers} {...overrides} />
    );
    return { ...utils, ...handlers };
};

describe('HoleScoreHeader', () => {
    it('shouldShowTheHoleNumberCourseAndParOptions', () => {
        const { getByText, getByTestId } = renderHeader();

        expect(getByTestId('hole-number-text')).toHaveTextContent('Hole 2');
        expect(getByTestId('hole-course-name')).toHaveTextContent('New course');
        expect(getByTestId('par-3-button')).toBeTruthy();
        expect(getByText('Par 4')).toBeTruthy();
        expect(getByTestId('par-5-button')).toBeTruthy();
    });

    it('shouldReportTheParChosen', () => {
        const { getByTestId, onParChange } = renderHeader();

        fireEvent.press(getByTestId('par-3-button'));

        expect(onParChange).toHaveBeenCalledWith(3);
    });

    it('shouldReportEndRoundAndBagPresses', () => {
        const { getByTestId, onEndRound, onOpenBag } = renderHeader();

        fireEvent.press(getByTestId('end-round-button'));
        fireEvent.press(getByTestId('open-bag-button'));

        expect(onEndRound).toHaveBeenCalledTimes(1);
        expect(onOpenBag).toHaveBeenCalledTimes(1);
    });
});
