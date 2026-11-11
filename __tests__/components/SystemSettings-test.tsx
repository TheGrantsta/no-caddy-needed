import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SystemSettings from '../../components/SystemSettings';

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

const settings = {
    notificationsEnabled: true,
    soundsEnabled: true,
    voice: 'female',
    units: 'yards',
} as any;

const renderSystem = (overrides: object = {}) => {
    const handlers = {
        onNotificationsChange: jest.fn(),
        onSoundsChange: jest.fn(),
        onVoiceChange: jest.fn(),
        onUnitsChange: jest.fn(),
    };
    const utils = render(<SystemSettings settings={{ ...settings, ...overrides }} {...handlers} />);
    return { ...utils, ...handlers };
};

describe('SystemSettings', () => {
    it('shouldShowTheUnitsSectionWithItsNote', () => {
        const { getByText } = renderSystem();

        expect(getByText('UNITS')).toBeTruthy();
        expect(getByText('Applies to distances, wedge chart and wind. Putting stays in feet.')).toBeTruthy();
    });

    it('shouldShowYardsAndMetresAsASegmentedChoiceForDistances', () => {
        const { getByText, getByTestId } = renderSystem();

        expect(getByText('Distances')).toBeTruthy();
        expect(getByTestId('units-yards')).toBeSelected();
    });

    it('shouldReportMetresWhenMetresIsPressed', () => {
        const { getByTestId, onUnitsChange } = renderSystem();

        fireEvent.press(getByTestId('units-metres'));

        expect(onUnitsChange).toHaveBeenCalledWith('metres');
    });

    it('shouldShowTheSoundAndNotificationsSection', () => {
        const { getByText } = renderSystem();

        expect(getByText('SOUND & NOTIFICATIONS')).toBeTruthy();
        expect(getByText('Notifications')).toBeTruthy();
        expect(getByText('Sounds')).toBeTruthy();
        expect(getByText('Voice')).toBeTruthy();
    });

    it('shouldShowNotificationsSwitchReflectingTheSetting', () => {
        const { getByTestId } = renderSystem({ notificationsEnabled: false });

        expect(getByTestId('notifications-switch').props.value).toBe(false);
    });

    it('shouldReportNotificationsChangeFromTheSwitch', () => {
        const { getByTestId, onNotificationsChange } = renderSystem();

        fireEvent(getByTestId('notifications-switch'), 'valueChange', false);

        expect(onNotificationsChange).toHaveBeenCalledWith(false);
    });

    it('shouldReportSoundsChangeFromTheSwitch', () => {
        const { getByTestId, onSoundsChange } = renderSystem();

        fireEvent(getByTestId('sounds-switch'), 'valueChange', false);

        expect(onSoundsChange).toHaveBeenCalledWith(false);
    });

    it('shouldShowTheCurrentVoiceInAPickerAndReportTheChoice', () => {
        const { getByTestId, getByText, onVoiceChange } = renderSystem({ voice: 'female' });

        expect(getByText('Female')).toBeTruthy();
        fireEvent.press(getByTestId('voice-dropdown-toggle'));
        fireEvent.press(getByTestId('voice-option-Male'));

        expect(onVoiceChange).toHaveBeenCalledWith('male');
    });

    it('shouldListTheVoicesInlineUnderTheVoiceRowWithoutOpeningAModal', () => {
        const { getByTestId, queryByTestId } = renderSystem({ voice: 'female' });

        fireEvent.press(getByTestId('voice-dropdown-toggle'));

        expect(getByTestId('voice-option-Male')).toBeTruthy();
        expect(queryByTestId('voice-modal')).toBeNull();
    });
});
