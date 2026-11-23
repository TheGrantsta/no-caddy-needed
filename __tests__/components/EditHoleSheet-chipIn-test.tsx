import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EditHoleSheet from '../../components/EditHoleSheet';

const noSins = { troubleOffTee: false, penalties: false, threePutts: false, bogeysInside9Iron: false, doubleChips: false, doubleBogeys: false, bogeysPar5: false };

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

const renderSheet = (overrides: object = {}) => {
    const handlers = {
        onBack: jest.fn(),
        onParChange: jest.fn(),
        onStrokesChange: jest.fn(),
        onPuttingChange: jest.fn(),
        onSinChange: jest.fn(),
        onSave: jest.fn(),
    };
    const utils = render(
        <EditHoleSheet
            holeNumber={3}
            par={4}
            strokes={4}
            putting={{ putts: 2, firstPutt: 18, secondPutt: 2, secondIsLong: false }}
            sins={noSins as any}
            {...handlers}
            {...overrides}
        />
    );
    return { ...utils, ...handlers };
};

describe('EditHoleSheet chip-in', () => {
    it('shouldShowTheChipInTextForZeroPutts', () => {
        const { getByTestId } = renderSheet({ putting: { putts: 0, firstPutt: 0, secondPutt: 0, secondIsLong: false } });

        expect(getByTestId('chip-in-text')).toHaveTextContent('Holed from off the green');
    });

    it('shouldReportTheChipInWhenZeroPuttsIsPressed', () => {
        const { getByTestId, onPuttingChange } = renderSheet();

        fireEvent.press(getByTestId('putts-option-0'));

        expect(onPuttingChange).toHaveBeenCalledWith(expect.objectContaining({ putts: 0 }));
    });

    it('shouldHideThreePuttsForAChipIn', () => {
        const { queryByTestId, getByTestId } = renderSheet({
            putting: { putts: 0, firstPutt: 0, secondPutt: 0, secondIsLong: false },
            sins: { ...noSins, threePutts: false } as any,
        });

        expect(queryByTestId('edit-hole-sin-threePutts')).toBeNull();
        expect(queryByTestId('edit-hole-auto-row-three-putts')).toBeNull();
        expect(getByTestId('chip-in-text')).toBeTruthy();
    });

    it('shouldShowAnAutoThreePuttsRowWhenThePuttCountIsThree', () => {
        const { getByTestId, getByText } = renderSheet({ sins: { ...noSins, threePutts: true } as any });

        expect(getByTestId('edit-hole-auto-row-three-putts')).toBeTruthy();
        expect(getByText('Auto: 3 or more putts')).toBeTruthy();
        expect(getByTestId('edit-hole-auto-three-putts').props.value).toBe(true);
        expect(getByTestId('edit-hole-auto-three-putts').props.disabled).toBe(true);
    });
});
