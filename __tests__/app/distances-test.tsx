import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DistancesScreen from '../../app/play/distances';

import { getSettingsService, saveSettingsService, getClubDistancesService } from '../../service/DbService';

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
}));

jest.mock('../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('../../service/DbService', () => ({
    getClubDistancesService: jest.fn(() => []),
    saveClubDistancesService: jest.fn(() => Promise.resolve(true)),
    getSettingsService: jest.fn(() => ({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: false,
        distancesOnboardingSeen: false,
    })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockGetClubDistancesService = getClubDistancesService as jest.Mock;

describe('DistancesScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: false,
        });
        mockGetClubDistancesService.mockReturnValue([]);
    });

    describe('Onboarding overlay', () => {
        it('shows onboarding overlay on first load when distances list is empty and distancesOnboardingSeen is false', () => {
            const { getByTestId } = render(<DistancesScreen />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('does not show onboarding overlay when distancesOnboardingSeen is true', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: true,
            });

            const { queryByTestId } = render(<DistancesScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('does not show onboarding overlay when distances list has data', () => {
            mockGetClubDistancesService.mockReturnValue([
                { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
            ]);

            const { queryByTestId } = render(<DistancesScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('does not show onboarding overlay when distances list has data even if distancesOnboardingSeen is false', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
            });
            mockGetClubDistancesService.mockReturnValue([
                { Id: 1, Club: '7 Iron', CarryDistance: 150, TotalDistance: 160, SortOrder: 1 },
            ]);

            const { queryByTestId } = render(<DistancesScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('saves distancesOnboardingSeen when overlay is dismissed', async () => {
            const { getByTestId } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('skip-button'));

            await waitFor(() => {
                expect(mockSaveSettingsService).toHaveBeenCalledWith({
                    theme: 'dark',
                    notificationsEnabled: true,
                    wedgeChartOnboardingSeen: false,
                    distancesOnboardingSeen: true,
                });
            });
        });

        it('hides overlay after dismissal', async () => {
            const { getByTestId, queryByTestId } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('skip-button'));

            await waitFor(() => {
                expect(queryByTestId('onboarding-overlay')).toBeNull();
            });
        });
    });

    describe('Info icon', () => {
        it('renders info icon in header', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: true,
            });

            const { getByTestId } = render(<DistancesScreen />);

            expect(getByTestId('info-button')).toBeTruthy();
        });

        it('shows onboarding overlay when info icon is pressed', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: true,
            });

            const { getByTestId, queryByTestId } = render(<DistancesScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();

            fireEvent.press(getByTestId('info-button'));

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });
    });
});
