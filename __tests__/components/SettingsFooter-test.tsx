import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SettingsFooter from '../../components/SettingsFooter';

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: { expoConfig: { version: '1.2.3' } },
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe('SettingsFooter', () => {
    it('shouldShowExportAndRateRowsInGreen', () => {
        const { getByText, getByTestId } = render(<SettingsFooter onExportStats={jest.fn()} onRateApp={jest.fn()} />);

        expect(getByText('Export stats for AI coaching')).toBeTruthy();
        expect(getByText('Rate my app')).toBeTruthy();
        expect(getByTestId('export-stats-button')).toBeTruthy();
        expect(getByTestId('rate-app-button')).toBeTruthy();
    });

    it('shouldCallOnExportStatsWhenExportIsPressed', () => {
        const onExportStats = jest.fn();
        const { getByTestId } = render(<SettingsFooter onExportStats={onExportStats} onRateApp={jest.fn()} />);

        fireEvent.press(getByTestId('export-stats-button'));

        expect(onExportStats).toHaveBeenCalledTimes(1);
    });

    it('shouldCallOnRateAppWhenRateIsPressed', () => {
        const onRateApp = jest.fn();
        const { getByTestId } = render(<SettingsFooter onExportStats={jest.fn()} onRateApp={onRateApp} />);

        fireEvent.press(getByTestId('rate-app-button'));

        expect(onRateApp).toHaveBeenCalledTimes(1);
    });

    it('shouldShowTheExportLabelWhileExporting', () => {
        const { getByText } = render(<SettingsFooter onExportStats={jest.fn()} onRateApp={jest.fn()} exporting />);

        expect(getByText('Preparing export…')).toBeTruthy();
    });

    it('shouldShowTheAppVersionBelowTheRows', () => {
        const { getByText } = render(<SettingsFooter onExportStats={jest.fn()} onRateApp={jest.fn()} />);

        expect(getByText('Version 1.2.3')).toBeTruthy();
    });

    it('shouldShowBothRowsOnOneCardWithGreenLabels', () => {
        const { getByTestId, getByText } = render(<SettingsFooter onExportStats={jest.fn()} onRateApp={jest.fn()} />);

        const card = getByTestId('settings-section-card');
        expect(card).toContainElement(getByTestId('export-stats-button'));
        expect(card).toContainElement(getByTestId('rate-app-button'));
        expect(getByText('Rate my app')).toHaveStyle({ color: '#2D5A3D' });
    });
});
