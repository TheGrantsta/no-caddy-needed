import React from 'react';
import { render } from '@testing-library/react-native';
import TabLayout from '../../app/(tabs)/_layout';
import { getPracticeRemindersService } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const mockUseSegments = jest.fn().mockReturnValue(['(tabs)', 'practice']);

jest.mock('expo-router', () => ({
    Tabs: Object.assign(
        jest.fn(({ children }: any) => <>{children}</>),
        {
            Screen: jest.fn(({ options }: any) => {
                const colours = require('../../assets/colours').default;
                if (options?.tabBarIcon) {
                    const icon = options.tabBarIcon({ color: colours.primary, focused: false });
                    const React = require('react');
                    return React.isValidElement(icon) ? icon : null;
                }
                return null;
            }),
        }
    ),
    useSegments: () => mockUseSegments(),
}));

jest.mock('../../app/screen-wrapper', () => ({ children }: any) => <>{children}</>);

jest.mock('../../service/DbService', () => ({
    getPracticeRemindersService: jest.fn().mockReturnValue([]),
}));

const mockGetPracticeRemindersService = getPracticeRemindersService as jest.Mock;

describe('Tabs layout — Practice overdue badge', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPracticeRemindersService.mockReturnValue([]);
    });

    it('shouldShowOverdueBadgeOnPracticeTabWhenReminderIsOverdue', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2020-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2019-12-31T09:00:00.000Z' }
        ]);
        const { getByTestId } = render(<TabLayout />);
        expect(getByTestId('practice-overdue-badge')).toBeTruthy();
    });

    it('shouldNotShowOverdueBadgeWhenNoRemindersAreOverdue', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2099-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' }
        ]);
        const { queryByTestId } = render(<TabLayout />);
        expect(queryByTestId('practice-overdue-badge')).toBeNull();
    });

    it('shouldNotShowOverdueBadgeWhenRemindersListIsEmpty', () => {
        const { queryByTestId } = render(<TabLayout />);
        expect(queryByTestId('practice-overdue-badge')).toBeNull();
    });

    it('shouldNotShowActiveIndicatorWhenFocused', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const colours = require('../../assets/colours').default;
        const firstCall = (Tabs.Screen as jest.Mock).mock.calls[0];
        const icon = firstCall[0].options.tabBarIcon({ color: colours.primary, focused: true });
        const { queryByTestId } = render(icon);
        expect(queryByTestId('tab-active-indicator')).toBeNull();
    });

    it('shouldUseAMutedGreenForActiveTabTintColour', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const activeTint = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarActiveTintColor;
        expect(activeTint).not.toBe('#00C851');
        expect(activeTint).not.toBe('#2D5A3D');
    });

    it('shouldUseEnlargedIconSize', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const firstCall = (Tabs.Screen as jest.Mock).mock.calls[0];
        const icon = firstCall[0].options.tabBarIcon({ color: '#4A9068', focused: false });
        const { getByText } = render(icon);
        expect(getByText(/Size: 32/)).toBeTruthy();
    });

    it('shouldUseEnlargedLabelFontSize', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const labelStyle = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarLabelStyle;
        expect(labelStyle.fontSize).toBe(14);
    });

    it('shouldClearOverdueBadgeWhenOverdueReminderIsDeleted', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2020-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2019-12-31T09:00:00.000Z' }
        ]);
        const { getByTestId, queryByTestId, rerender } = render(<TabLayout />);
        expect(getByTestId('practice-overdue-badge')).toBeTruthy();

        mockGetPracticeRemindersService.mockReturnValue([]);
        mockUseSegments.mockReturnValue(['(tabs)', 'practice']);
        rerender(<TabLayout />);

        expect(queryByTestId('practice-overdue-badge')).toBeNull();
    });
});
