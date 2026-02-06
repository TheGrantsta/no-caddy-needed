import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WedgeChartScreen from '../../app/play/wedge-chart';

import { getSettingsService, saveSettingsService, getWedgeChartService } from '../../service/DbService';

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
    getWedgeChartService: jest.fn(() => ({
        distanceNames: [],
        clubs: [],
    })),
    saveWedgeChartService: jest.fn(() => Promise.resolve(true)),
    getSettingsService: jest.fn(() => ({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: false,
    })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockGetWedgeChartService = getWedgeChartService as jest.Mock;

describe('WedgeChartScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: false,
        });
        mockGetWedgeChartService.mockReturnValue({
            distanceNames: [],
            clubs: [],
        });
    });

    describe('Onboarding overlay', () => {
        it('shows onboarding overlay on first load when chart is empty and wedgeChartOnboardingSeen is false', () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('does not show onboarding overlay when wedgeChartOnboardingSeen is true', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
            });

            const { queryByTestId } = render(<WedgeChartScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('does not show onboarding overlay when chart has data', () => {
            mockGetWedgeChartService.mockReturnValue({
                distanceNames: ['Half', 'Full'],
                clubs: [{ club: 'PW', distances: [{ name: 'Half', distance: 100 }] }],
            });

            const { queryByTestId } = render(<WedgeChartScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('does not show onboarding overlay when chart has data even if wedgeChartOnboardingSeen is false', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: false,
            });
            mockGetWedgeChartService.mockReturnValue({
                distanceNames: ['Half'],
                clubs: [{ club: 'SW', distances: [{ name: 'Half', distance: 80 }] }],
            });

            const { queryByTestId } = render(<WedgeChartScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('saves wedgeChartOnboardingSeen when overlay is dismissed', async () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('skip-button'));

            await waitFor(() => {
                expect(mockSaveSettingsService).toHaveBeenCalledWith({
                    theme: 'dark',
                    notificationsEnabled: true,
                    wedgeChartOnboardingSeen: true,
                });
            });
        });

        it('hides overlay after dismissal', async () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

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
                wedgeChartOnboardingSeen: true,
            });

            const { getByTestId } = render(<WedgeChartScreen />);

            expect(getByTestId('info-button')).toBeTruthy();
        });

        it('shows onboarding overlay when info icon is pressed', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
            });

            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();

            fireEvent.press(getByTestId('info-button'));

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });
    });
});
