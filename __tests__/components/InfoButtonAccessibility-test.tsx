import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeHeader from '../../components/HomeHeader';
import SettingsHeader from '../../components/SettingsHeader';
import DistancesHeader from '../../components/DistancesHeader';
import WedgeChartHeader from '../../components/WedgeChartHeader';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({ theme: 'dark', colours: require('../../assets/colours').default }),
}));

describe('info buttons on screen headers', () => {
    const headers: [string, React.ComponentType<{ onInfoPress: () => void }>][] = [
        ['HomeHeader', HomeHeader],
        ['SettingsHeader', SettingsHeader],
        ['DistancesHeader', DistancesHeader],
        ['WedgeChartHeader', WedgeChartHeader],
    ];

    it.each(headers)('shouldLabelInfoButtonAsShowHelpInHeader %s', (_name, Header) => {
        const onInfoPress = jest.fn();
        const { getByRole } = render(<Header onInfoPress={onInfoPress} />);

        fireEvent.press(getByRole('button', { name: 'Show help' }));

        expect(onInfoPress).toHaveBeenCalledTimes(1);
    });
});
