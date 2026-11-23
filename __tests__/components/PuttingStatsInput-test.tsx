import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PuttingStatsInput from '../../components/PuttingStatsInput';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

const baseProps = {
    holePar: 4,
    threePuttSelected: false,
    onStatsChange: jest.fn(),
};

describe('PuttingStatsInput', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('choosing putts', () => {
        it('shouldEmitTwoPuttsWithTheDefaultDistances', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} onStatsChange={onStatsChange} />);

            fireEvent.press(getByTestId('putts-option-2'));

            expect(onStatsChange).toHaveBeenLastCalledWith(10, 3, false, false);
        });

        it('shouldEmitAChipInAsZeroFirstAndSecondPutt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} onStatsChange={onStatsChange} />);

            fireEvent.press(getByTestId('putts-option-0'));

            expect(onStatsChange).toHaveBeenLastCalledWith(0, 0, false, false);
        });

        it('shouldEmitOnePuttWithZeroSecondPutt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} onStatsChange={onStatsChange} />);

            fireEvent.press(getByTestId('putts-option-1'));

            expect(onStatsChange).toHaveBeenLastCalledWith(10, 0, false, false);
        });

        it('shouldReportThreePuttsSoTheThreePuttSinCanBeSet', () => {
            const onPuttCountChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} onPuttCountChange={onPuttCountChange} />);

            fireEvent.press(getByTestId('putts-option-3'));

            expect(onPuttCountChange).toHaveBeenLastCalledWith(3);
        });

        it('shouldReportTheCountWhenItGoesBackBelowThree', () => {
            const onPuttCountChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} onPuttCountChange={onPuttCountChange} />);

            fireEvent.press(getByTestId('putts-option-3'));
            fireEvent.press(getByTestId('putts-option-2'));

            expect(onPuttCountChange).toHaveBeenLastCalledWith(2);
        });
    });

    describe('green in regulation', () => {
        it('shouldBeWorkedOutFromTheScoreParAndPutts', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} userScore={4} onStatsChange={onStatsChange} />);

            fireEvent.press(getByTestId('putts-option-2'));

            expect(onStatsChange).toHaveBeenLastCalledWith(10, 3, false, true);
        });

        it('shouldBeFalseWhenTheScoreIsOverParWithTwoPutts', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} userScore={5} onStatsChange={onStatsChange} />);

            fireEvent.press(getByTestId('putts-option-2'));

            expect(onStatsChange).toHaveBeenLastCalledWith(10, 3, false, false);
        });

        it('shouldUpdateWhenTheScoreIsEnteredAfterThePutts', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, rerender } = render(<PuttingStatsInput {...baseProps} onStatsChange={onStatsChange} />);
            fireEvent.press(getByTestId('putts-option-2'));
            onStatsChange.mockClear();

            rerender(<PuttingStatsInput {...baseProps} userScore={4} onStatsChange={onStatsChange} />);

            expect(onStatsChange).toHaveBeenLastCalledWith(10, 3, false, true);
        });

        it('shouldNeverBeTrueForAChipIn', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} userScore={4} onStatsChange={onStatsChange} />);

            fireEvent.press(getByTestId('putts-option-0'));

            expect(onStatsChange).toHaveBeenLastCalledWith(0, 0, false, false);
        });

        it('shouldHaveNoGreenInRegulationSwitch', () => {
            const { queryByTestId } = render(<PuttingStatsInput {...baseProps} />);

            expect(queryByTestId('gir-switch')).toBeNull();
        });
    });

    describe('short or long', () => {
        it('shouldRefuseAShortSecondPuttThatIsNotShorterThanTheFirst', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            const { getByTestId, getByText } = render(
                <PuttingStatsInput
                    {...baseProps}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={12}
                    initialSecondIsLong={false}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            expect(getByText('Short second putt must be shorter than first putt')).toBeTruthy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(true);
            onStatsChange.mockClear();

            fireEvent.press(getByTestId('finished-short'));

            expect(onStatsChange).not.toHaveBeenCalled();
        });

        it('shouldAcceptALongSecondPuttThatIsLongerThanTheFirst', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput {...baseProps} onStatsChange={onStatsChange} initialFirstPutt={10} initialSecondPutt={12} initialSecondIsLong={false} />
            );

            fireEvent.press(getByTestId('finished-long'));

            expect(onStatsChange).toHaveBeenLastCalledWith(10, 12, true, false);
        });
    });

    describe('loading a saved hole', () => {
        it('shouldShowTheChipInWhenTheSavedFirstPuttIsZero', () => {
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput {...baseProps} initialFirstPutt={0} initialSecondPutt={0} />
            );

            expect(getByTestId('chip-in-text')).toBeTruthy();
            expect(queryByTestId('second-putt-value')).toBeNull();
        });

        it('shouldShowOnePuttWhenTheSavedSecondPuttIsZero', () => {
            const { getByText, getByTestId, queryByTestId } = render(
                <PuttingStatsInput {...baseProps} initialFirstPutt={20} initialSecondPutt={0} />
            );

            expect(getByText('Holed from')).toBeTruthy();
            expect(getByTestId('first-putt-value')).toHaveTextContent('20 ft');
            expect(queryByTestId('second-putt-value')).toBeNull();
        });

        it('shouldShowTheSecondPuttWhenTheSavedHoleHasTwoPutts', () => {
            const { getByTestId } = render(
                <PuttingStatsInput {...baseProps} initialFirstPutt={20} initialSecondPutt={5} />
            );

            expect(getByTestId('second-putt-value')).toHaveTextContent('5 ft');
            expect(getByTestId('finished-short')).toBeTruthy();
        });
    });

    describe('errors', () => {
        it('shouldAskForAPuttCountWhenTheFirstPuttErrorIsShown', () => {
            const { getByTestId } = render(<PuttingStatsInput {...baseProps} showFirstPuttError />);

            expect(getByTestId('putts-required-error')).toBeTruthy();
        });
    });
});
