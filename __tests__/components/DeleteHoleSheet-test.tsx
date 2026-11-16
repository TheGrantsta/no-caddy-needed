import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import DeleteHoleSheet from '../../components/DeleteHoleSheet';

const renderSheet = (overrides: object = {}) => {
    const handlers = { onConfirm: jest.fn(), onCancel: jest.fn() };
    const utils = render(<DeleteHoleSheet visible holeNumber={10} deletesRound={false} {...handlers} {...overrides} />);
    return { ...utils, ...handlers };
};

describe('DeleteHoleSheet', () => {
    it('shouldAskToDeleteTheNamedHole', () => {
        const { getByText } = renderSheet();

        expect(getByText('Delete hole 10?')).toBeTruthy();
    });

    it('shouldSayTheRoundIsDeletedTooWhenItIsTheOnlyHole', () => {
        const { getByText } = renderSheet({ deletesRound: true });

        expect(getByText(/the round will be deleted too/i)).toBeTruthy();
    });

    it('shouldConfirmWhenDeleteHoleIsPressed', () => {
        const { getByTestId, onConfirm } = renderSheet();

        fireEvent.press(getByTestId('confirm-delete-hole-button'));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('shouldCancelWithoutDeletingWhenCancelIsPressed', () => {
        const { getByTestId, onConfirm, onCancel } = renderSheet();

        fireEvent.press(getByTestId('delete-hole-cancel-button'));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('shouldShowNothingWhenNotVisible', () => {
        const { queryByTestId } = renderSheet({ visible: false });

        expect(queryByTestId('delete-hole-sheet')).toBeNull();
    });

    it('shouldCentreTheCancelLabelInItsFullWidthPill', () => {
        const { getByTestId, getByText } = renderSheet();
        const pill = StyleSheet.flatten(getByTestId('delete-hole-cancel-button').props.style);

        expect(pill.alignItems).toBe('center');
        expect(pill.justifyContent).toBe('center');
        expect(StyleSheet.flatten(getByText('Cancel').props.style).textAlign).toBe('center');
    });
});
