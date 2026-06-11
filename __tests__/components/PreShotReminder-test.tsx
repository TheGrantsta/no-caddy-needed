import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PreShotReminder from '../../components/PreShotReminder';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('PreShotReminder', () => {
    it('rendersNothingWhenNotVisible', () => {
        const { queryByTestId } = render(
            <PreShotReminder visible={false} text="Target, breathe, go" onDismiss={jest.fn()} />
        );

        expect(queryByTestId('preshot-reminder')).toBeNull();
    });

    it('rendersRoutineTextAndDismissWhenVisible', () => {
        const { getByTestId, getByText } = render(
            <PreShotReminder visible text="Target, breathe, go" onDismiss={jest.fn()} />
        );

        expect(getByTestId('preshot-reminder')).toBeTruthy();
        expect(getByText('Target, breathe, go')).toBeTruthy();
        expect(getByTestId('preshot-reminder-dismiss')).toBeTruthy();
    });

    it('callsOnDismissWhenGotItPressed', () => {
        const onDismiss = jest.fn();
        const { getByTestId } = render(
            <PreShotReminder visible text="Routine" onDismiss={onDismiss} />
        );

        fireEvent.press(getByTestId('preshot-reminder-dismiss'));

        expect(onDismiss).toHaveBeenCalled();
    });
});
