import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DeleteRoundSheet from '../../components/DeleteRoundSheet';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('DeleteRoundSheet', () => {
    it('shouldAskToDeleteThisRoundAndExplainItsEffect', () => {
        const { getByText } = render(<DeleteRoundSheet visible onConfirm={jest.fn()} onCancel={jest.fn()} />);

        expect(getByText('Delete this round?')).toBeTruthy();
        expect(getByText('Its scores and stats will be removed from Stats. This can’t be undone.')).toBeTruthy();
    });

    it('shouldOfferADeleteRoundActionInRed', () => {
        const { getByTestId, getByText } = render(<DeleteRoundSheet visible onConfirm={jest.fn()} onCancel={jest.fn()} />);

        expect(getByTestId('confirm-delete-button')).toBeTruthy();
        expect(getByText('Delete round')).toHaveStyle({ color: '#fd0303' });
    });

    it('shouldCallOnConfirmWhenDeleteRoundIsPressed', () => {
        const onConfirm = jest.fn();
        const { getByTestId } = render(<DeleteRoundSheet visible onConfirm={onConfirm} onCancel={jest.fn()} />);

        fireEvent.press(getByTestId('confirm-delete-button'));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('shouldCallOnCancelWhenCancelIsPressed', () => {
        const onCancel = jest.fn();
        const { getByTestId } = render(<DeleteRoundSheet visible onConfirm={jest.fn()} onCancel={onCancel} />);

        fireEvent.press(getByTestId('cancel-delete-button'));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('shouldShowNothingWhenNotVisible', () => {
        const { queryByTestId } = render(<DeleteRoundSheet visible={false} onConfirm={jest.fn()} onCancel={jest.fn()} />);

        expect(queryByTestId('delete-round-sheet')).toBeNull();
    });
});
