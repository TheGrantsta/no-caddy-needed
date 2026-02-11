import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WedgeChartScreen from '../../app/play/wedge-chart';

import { getSettingsService, saveSettingsService, getWedgeChartService, saveWedgeChartService } from '../../service/DbService';

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
        distancesOnboardingSeen: false,
        playOnboardingSeen: false,
    })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockGetWedgeChartService = getWedgeChartService as jest.Mock;
const mockSaveWedgeChartService = saveWedgeChartService as jest.Mock;

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

    describe('Clear button', () => {
        beforeEach(() => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
            });
            mockGetWedgeChartService.mockReturnValue({
                distanceNames: ['Half', 'Full'],
                clubs: [{ club: 'PW', distances: [{ name: 'Half', distance: 100 }, { name: 'Full', distance: 120 }] }],
            });
        });

        it('renders clear button when chart has data', () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            expect(getByTestId('clear-button')).toBeTruthy();
        });

        it('does not render clear button when chart is empty', () => {
            mockGetWedgeChartService.mockReturnValue({
                distanceNames: [],
                clubs: [],
            });

            const { queryByTestId } = render(<WedgeChartScreen />);

            expect(queryByTestId('clear-button')).toBeNull();
        });

        it('shows confirmation button when clear is pressed', () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('clear-button'));

            expect(getByTestId('confirm-clear-button')).toBeTruthy();
        });

        it('hides clear button and shows confirm when clear is pressed', () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('clear-button'));

            expect(queryByTestId('clear-button')).toBeNull();
            expect(getByTestId('confirm-clear-button')).toBeTruthy();
        });

        it('clears data when confirm is pressed', async () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('clear-button'));
            fireEvent.press(getByTestId('confirm-clear-button'));

            await waitFor(() => {
                expect(mockSaveWedgeChartService).toHaveBeenCalledWith({
                    distanceNames: [],
                    clubs: [],
                });
            });
        });

        it('shows cancel button when clear is pressed', () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('clear-button'));

            expect(getByTestId('cancel-clear-button')).toBeTruthy();
        });

        it('returns to normal state when cancel is pressed', () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('clear-button'));
            expect(queryByTestId('clear-button')).toBeNull();

            fireEvent.press(getByTestId('cancel-clear-button'));

            expect(getByTestId('clear-button')).toBeTruthy();
            expect(queryByTestId('confirm-clear-button')).toBeNull();
        });
    });
});
