import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EditHoleSheet from '../../components/EditHoleSheet';

const noSins = { troubleOffTee: false, penalties: false, threePutts: false, bogeysInside9Iron: false, doubleChips: false, doubleBogeys: false, bogeysPar5: false };

const renderSheet = (overrides: object = {}) => {
    const handlers = {
        onBack: jest.fn(),
        onParChange: jest.fn(),
        onStrokesChange: jest.fn(),
        onFirstPuttChange: jest.fn(),
        onSecondPuttChange: jest.fn(),
        onGreenInRegulationChange: jest.fn(),
        onSinChange: jest.fn(),
        onSave: jest.fn(),
    };
    const utils = render(
        <EditHoleSheet
            holeNumber={3}
            par={4}
            strokes={4}
            firstPutt="18"
            secondPutt="2"
            greenInRegulation={false}
            sins={noSins as any}
            {...handlers}
            {...overrides}
        />
    );
    return { ...utils, ...handlers };
};

describe('EditHoleSheet chip-in', () => {
    it('shouldOfferChipInInTheFirstPuttPicker', () => {
        const { getByTestId } = renderSheet();

        fireEvent.press(getByTestId('first-putt-input'));

        expect(getByTestId('first-putt-input-option-chip-in')).toHaveTextContent('No putt');
    });

    it('shouldShowChipInLabelWhenFirstPuttIsZero', () => {
        const { getByTestId } = renderSheet({ firstPutt: '0', secondPutt: '' });

        expect(getByTestId('first-putt-input')).toHaveTextContent('No putt');
    });

    it('shouldHideSecondPuttWhenFirstPuttIsChipIn', () => {
        const { queryByTestId } = renderSheet({ firstPutt: '0', secondPutt: '' });

        expect(queryByTestId('second-putt-input')).toBeNull();
    });

    it('shouldKeepSecondPuttVisibleForARegularFirstPutt', () => {
        const { getByTestId } = renderSheet({ firstPutt: '18', secondPutt: '2' });

        expect(getByTestId('second-putt-input')).toBeTruthy();
    });

    it('shouldShowThreePuttsAsUnmarkedAndLockedWhenFirstPuttIsChipIn', () => {
        const { getByTestId, getByText } = renderSheet({
            firstPutt: '0',
            secondPutt: '',
            sins: { ...noSins, threePutts: true } as any,
        });

        expect(getByTestId('edit-hole-sin-threePutts').props.value).toBe(false);
        expect(getByTestId('edit-hole-sin-threePutts').props.disabled).toBe(true);
        expect(getByText('Not possible after a chip-in')).toBeTruthy();
    });

    it('shouldShowThreePuttsAsMarkedAndUnlockedForARegularFirstPutt', () => {
        const { getByTestId } = renderSheet({
            firstPutt: '18',
            secondPutt: '2',
            sins: { ...noSins, threePutts: true } as any,
        });

        expect(getByTestId('edit-hole-sin-threePutts').props.value).toBe(true);
        expect(getByTestId('edit-hole-sin-threePutts').props.disabled).toBeFalsy();
    });
});
