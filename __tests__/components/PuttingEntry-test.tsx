import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import PuttingEntry from '../../components/PuttingEntry';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

const baseProps = {
    putts: undefined,
    firstPutt: undefined,
    secondPutt: undefined,
    secondIsLong: false,
    onChange: jest.fn(),
};

describe('PuttingEntry', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('putt count', () => {
        it('shouldOfferZeroOneTwoAndThreePlusPutts', () => {
            const { getByTestId, getByText } = render(<PuttingEntry {...baseProps} />);

            expect(getByTestId('putts-option-0')).toBeTruthy();
            expect(getByTestId('putts-option-1')).toBeTruthy();
            expect(getByTestId('putts-option-2')).toBeTruthy();
            expect(getByTestId('putts-option-3')).toBeTruthy();
            expect(getByText('3+')).toBeTruthy();
        });

        it('shouldEmitTheDefaultDistancesWhenTwoPuttsIsChosenForTheFirstTime', () => {
            const onChange = jest.fn();
            const { getByTestId } = render(<PuttingEntry {...baseProps} onChange={onChange} />);

            fireEvent.press(getByTestId('putts-option-2'));

            expect(onChange).toHaveBeenCalledWith({ putts: 2, firstPutt: 10, secondPutt: 3, secondIsLong: false });
        });

        it('shouldKeepAnExistingFirstPuttWhenOnePuttIsChosen', () => {
            const onChange = jest.fn();
            const { getByTestId } = render(<PuttingEntry {...baseProps} firstPutt={22} onChange={onChange} />);

            fireEvent.press(getByTestId('putts-option-1'));

            expect(onChange).toHaveBeenCalledWith({ putts: 1, firstPutt: 22, secondPutt: 3, secondIsLong: false });
        });

        it('shouldEmitThreePluttsAsThreePuttsChosen', () => {
            const onChange = jest.fn();
            const { getByTestId } = render(<PuttingEntry {...baseProps} onChange={onChange} />);

            fireEvent.press(getByTestId('putts-option-3'));

            expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ putts: 3 }));
        });
    });

    describe('rows for each count', () => {
        it('shouldShowChipInTextAndNoDistanceRowsForZeroPutts', () => {
            const { getByText, queryByTestId } = render(<PuttingEntry {...baseProps} putts={0} firstPutt={0} secondPutt={0} />);

            expect(getByText('Holed from off the green')).toBeTruthy();
            expect(queryByTestId('first-putt-value')).toBeNull();
            expect(queryByTestId('second-putt-value')).toBeNull();
            expect(queryByTestId('finished-short')).toBeNull();
        });

        it('shouldReadTheFirstRowAsHoledFromForOnePutt', () => {
            const { getByText, getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

            expect(getByText('Holed from')).toBeTruthy();
            expect(getByTestId('first-putt-value')).toHaveTextContent('18 ft');
            expect(queryByTestId('second-putt-value')).toBeNull();
            expect(queryByTestId('finished-short')).toBeNull();
        });

        it('shouldShowTheFirstPuttAndSecondPuttRowsForTwoPutts', () => {
            const { getByText, getByTestId } = render(<PuttingEntry {...baseProps} putts={2} firstPutt={18} secondPutt={3} />);

            expect(getByText('1st putt from')).toBeTruthy();
            expect(getByTestId('second-putt-value')).toHaveTextContent('3 ft');
        });

        it('shouldShowShortAndLongForTheFirstPuttOnlyWithTwoOrMorePutts', () => {
            const { getByTestId } = render(<PuttingEntry {...baseProps} putts={3} firstPutt={18} secondPutt={3} />);

            expect(getByTestId('finished-short')).toBeTruthy();
            expect(getByTestId('finished-long')).toBeTruthy();
        });

        it('shouldShowNoRowsBeforeACountIsChosen', () => {
            const { queryByTestId } = render(<PuttingEntry {...baseProps} />);

            expect(queryByTestId('first-putt-value')).toBeNull();
            expect(queryByTestId('second-putt-value')).toBeNull();
        });
    });

    describe('wheels', () => {
        it('shouldOpenTheFirstPuttWheelWhenItsValueIsTapped', () => {
            const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

            expect(queryByTestId('first-putt-wheel')).toBeNull();
            fireEvent.press(getByTestId('first-putt-value'));
            expect(getByTestId('first-putt-wheel')).toBeTruthy();
        });

        it('shouldCloseTheWheelWhenItsValueIsTappedAgain', () => {
            const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

            fireEvent.press(getByTestId('first-putt-value'));
            fireEvent.press(getByTestId('first-putt-value'));

            expect(queryByTestId('first-putt-wheel')).toBeNull();
        });

        it('shouldOnlyOpenOneWheelAtATime', () => {
            const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={2} firstPutt={18} secondPutt={3} />);

            fireEvent.press(getByTestId('first-putt-value'));
            fireEvent.press(getByTestId('second-putt-value'));

            expect(queryByTestId('first-putt-wheel')).toBeNull();
            expect(getByTestId('second-putt-wheel')).toBeTruthy();
        });

        it('shouldEmitTheNewFirstPuttWhenTheWheelIsSpun', () => {
            const onChange = jest.fn();
            const { getByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} onChange={onChange} />);

            fireEvent.press(getByTestId('first-putt-value'));
            fireEvent(getByTestId('first-putt-wheel'), 'change', { nativeEvent: { newValue: 25, newIndex: 24 } });

            expect(onChange).toHaveBeenLastCalledWith({ putts: 1, firstPutt: 25, secondPutt: 0, secondIsLong: false });
        });

        describe('closing after the spin settles', () => {
            beforeEach(() => jest.useFakeTimers());
            afterEach(() => jest.useRealTimers());

            it('shouldKeepTheFirstPuttWheelOpenWhileSpinning', () => {
                const { getByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

                fireEvent.press(getByTestId('first-putt-value'));
                fireEvent(getByTestId('first-putt-wheel'), 'change', { nativeEvent: { newValue: 25, newIndex: 24 } });

                expect(getByTestId('first-putt-wheel')).toBeTruthy();
            });

            it('shouldCloseTheFirstPuttWheelOnceTheSpinSettles', () => {
                const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

                fireEvent.press(getByTestId('first-putt-value'));
                fireEvent(getByTestId('first-putt-wheel'), 'change', { nativeEvent: { newValue: 25, newIndex: 24 } });
                act(() => { jest.advanceTimersByTime(500); });

                expect(queryByTestId('first-putt-wheel')).toBeNull();
            });

            it('shouldRestartTheSettleWhileStillSpinning', () => {
                const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

                fireEvent.press(getByTestId('first-putt-value'));
                fireEvent(getByTestId('first-putt-wheel'), 'change', { nativeEvent: { newValue: 25, newIndex: 24 } });
                act(() => { jest.advanceTimersByTime(300); });
                fireEvent(getByTestId('first-putt-wheel'), 'change', { nativeEvent: { newValue: 26, newIndex: 25 } });
                act(() => { jest.advanceTimersByTime(300); });

                expect(queryByTestId('first-putt-wheel')).toBeTruthy();

                act(() => { jest.advanceTimersByTime(200); });
                expect(queryByTestId('first-putt-wheel')).toBeNull();
            });

            it('shouldCloseTheSecondPuttWheelOnceTheSpinSettles', () => {
                const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={2} firstPutt={18} secondPutt={3} />);

                fireEvent.press(getByTestId('second-putt-value'));
                fireEvent(getByTestId('second-putt-wheel'), 'change', { nativeEvent: { newValue: 7, newIndex: 6 } });
                act(() => { jest.advanceTimersByTime(500); });

                expect(queryByTestId('second-putt-wheel')).toBeNull();
            });
        });

        it('shouldCloseTheWheelsWhenChipInIsChosen', () => {
            const { getByTestId, queryByTestId } = render(<PuttingEntry {...baseProps} putts={1} firstPutt={18} secondPutt={0} />);

            fireEvent.press(getByTestId('first-putt-value'));
            fireEvent.press(getByTestId('putts-option-0'));

            expect(queryByTestId('first-putt-wheel')).toBeNull();
        });
    });

    describe('short or long', () => {
        it('shouldEmitLongWhenLongIsPressed', () => {
            const onChange = jest.fn();
            const { getByTestId } = render(<PuttingEntry {...baseProps} putts={2} firstPutt={18} secondPutt={3} onChange={onChange} />);

            fireEvent.press(getByTestId('finished-long'));

            expect(onChange).toHaveBeenCalledWith({ putts: 2, firstPutt: 18, secondPutt: 3, secondIsLong: true });
        });
    });

    describe('errors', () => {
        it('shouldShowTheShortSecondPuttErrorWhenFlagged', () => {
            const { getByTestId } = render(<PuttingEntry {...baseProps} putts={2} firstPutt={10} secondPutt={12} secondPuttError />);

            expect(getByTestId('second-putt-error')).toHaveTextContent('Short second putt must be shorter than first putt');
        });

        it('shouldAskForAPuttCountWhenRequired', () => {
            const { getByTestId } = render(<PuttingEntry {...baseProps} showRequiredError />);

            expect(getByTestId('putts-required-error')).toHaveTextContent('Choose the number of putts');
        });

        it('shouldNotShowErrorsByDefault', () => {
            const { queryByTestId } = render(<PuttingEntry {...baseProps} putts={2} firstPutt={10} secondPutt={3} />);

            expect(queryByTestId('second-putt-error')).toBeNull();
            expect(queryByTestId('putts-required-error')).toBeNull();
        });
    });
});
