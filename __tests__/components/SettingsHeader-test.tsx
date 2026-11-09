import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SettingsHeader from '../../components/SettingsHeader';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({ theme: 'dark', colours: require('../../assets/colours').default }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('SettingsHeader', () => {
    it('shouldShowTheSettingsTitle', () => {
        const { getByText } = render(<SettingsHeader onInfoPress={jest.fn()} />);

        expect(getByText('Settings')).toBeTruthy();
    });

    it('shouldNotShowADoneButtonBecauseChangesSaveAsTheyAreMade', () => {
        const { queryByText, queryByTestId } = render(<SettingsHeader onInfoPress={jest.fn()} />);

        expect(queryByText('Done')).toBeNull();
        expect(queryByTestId('settings-done-button')).toBeNull();
    });

    it('shouldKeepTheInfoButtonOnTheLeft', () => {
        const onInfoPress = jest.fn();
        const { getByTestId } = render(<SettingsHeader onInfoPress={onInfoPress} />);

        fireEvent.press(getByTestId('settings-info-button'));

        expect(onInfoPress).toHaveBeenCalledTimes(1);
    });

    it('shouldSetTheTitleAtThePracticeHeadingSize', () => {
        const { getByText } = render(<SettingsHeader onInfoPress={jest.fn()} />);

        expect(getByText('Settings')).toHaveStyle({ fontSize: 32, fontWeight: 'bold' });
    });
});
