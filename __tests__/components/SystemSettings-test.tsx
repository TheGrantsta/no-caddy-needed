import React from 'react';
import { render } from '@testing-library/react-native';
import SystemSettings from '../../components/SystemSettings';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

const settings = {
    notificationsEnabled: true,
    voice: 'female',
    soundsEnabled: true,
    units: 'yards',
} as any;

describe('SystemSettings units note', () => {
    it('shouldExplainWhatTheUnitsSettingAffects', () => {
        const { getByText } = render(
            <SystemSettings
                settings={settings}
                onNotificationsChange={jest.fn()}
                onSoundsChange={jest.fn()}
                onVoiceChange={jest.fn()}
                onUnitsChange={jest.fn()}
            />
        );

        expect(getByText(/Applies to distances, wedge chart and wind/)).toBeTruthy();
    });

    it('shouldNoteThatPuttingStaysInFeet', () => {
        const { getByText } = render(
            <SystemSettings
                settings={settings}
                onNotificationsChange={jest.fn()}
                onSoundsChange={jest.fn()}
                onVoiceChange={jest.fn()}
                onUnitsChange={jest.fn()}
            />
        );

        expect(getByText(/Putting stays in feet/)).toBeTruthy();
    });
});
