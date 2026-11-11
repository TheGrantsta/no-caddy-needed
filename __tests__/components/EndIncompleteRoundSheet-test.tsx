import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EndIncompleteRoundSheet from '../../components/EndIncompleteRoundSheet';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('EndIncompleteRoundSheet', () => {
    it('shouldAskToEndTheRoundAsAnOverlay', () => {
        const { getByTestId, getByText } = render(
            <EndIncompleteRoundSheet visible onConfirm={jest.fn()} onCancel={jest.fn()} />
        );

        expect(getByTestId('end-incomplete-round-sheet')).toBeTruthy();
        expect(getByText('End round?')).toBeTruthy();
    });

    it('shouldRenderNothingWhenHidden', () => {
        const { queryByTestId } = render(
            <EndIncompleteRoundSheet visible={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
        );

        expect(queryByTestId('end-incomplete-round-sheet')).toBeNull();
    });

    it('shouldReportConfirmFromTheConfirmAction', () => {
        const onConfirm = jest.fn();
        const { getByTestId } = render(
            <EndIncompleteRoundSheet visible onConfirm={onConfirm} onCancel={jest.fn()} />
        );

        fireEvent.press(getByTestId('confirm-end-round-button'));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('shouldReportCancelFromTheCancelAction', () => {
        const onCancel = jest.fn();
        const { getByTestId } = render(
            <EndIncompleteRoundSheet visible onConfirm={jest.fn()} onCancel={onCancel} />
        );

        fireEvent.press(getByTestId('end-round-cancel-button'));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
