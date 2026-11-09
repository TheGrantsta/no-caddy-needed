import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeHeader from '../../components/HomeHeader';
import SettingsHeader from '../../components/SettingsHeader';

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({ theme: 'dark', colours: require('../../assets/colours').default }),
}));

describe('info buttons on screen headers', () => {
    const headers: [string, React.ComponentType<{ onInfoPress: () => void }>][] = [
        ['SettingsHeader', SettingsHeader],
    ];

    it.each(headers)('shouldLabelInfoButtonAsShowHelpInHeader %s', (_name, Header) => {
        const onInfoPress = jest.fn();
        const { getByRole } = render(<Header onInfoPress={onInfoPress} />);

        fireEvent.press(getByRole('button', { name: 'Show help' }));

        expect(onInfoPress).toHaveBeenCalledTimes(1);
    });
});

describe('HomeHeader', () => {
    it('shouldNotShowAnInfoOrSettingsButtonOnThePage', () => {
        const { queryByTestId, queryByLabelText } = render(<HomeHeader />);

        expect(queryByTestId('info-button')).toBeNull();
        expect(queryByLabelText('Settings')).toBeNull();
    });

    it('shouldShowTheHeaderTitleAndSubtitle', () => {
        const { getByText } = render(<HomeHeader />);

        expect(getByText('No caddy needed!')).toBeTruthy();
        expect(getByText('Smarter play & practice')).toBeTruthy();
    });
});
