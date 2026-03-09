import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import WedgeChartScreen from '../../../app/play/wedge-chart';
import {
    getSettingsService,
    getWedgeChartService,
    saveSettingsService,
    saveWedgeChartService,
} from '../../../service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../service/DbService', () => ({
    getWedgeChartService: jest.fn(),
    saveWedgeChartService: jest.fn(),
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn(),
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

const mockGetWedgeChartService = getWedgeChartService as jest.Mock;
const mockSaveWedgeChartService = saveWedgeChartService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

const defaultSettings = {
    theme: 'dark',
    notificationsEnabled: true,
    wedgeChartOnboardingSeen: true,
    distancesOnboardingSeen: true,
    playOnboardingSeen: true,
    homeOnboardingSeen: true,
    practiceOnboardingSeen: true,
};

const nonEmptyChart = {
    distanceNames: ['Half', 'Full'],
    clubs: [{ name: 'PW', distances: [100, 130] }],
};

describe('Wedge Chart screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetWedgeChartService.mockReturnValue({ distanceNames: [], clubs: [] });
        mockGetSettingsService.mockReturnValue(defaultSettings);
        mockSaveSettingsService.mockResolvedValue(true);
        mockSaveWedgeChartService.mockResolvedValue(true);
    });

    it('renders wedge chart heading', () => {
        const { getByText } = render(<WedgeChartScreen />);
        expect(getByText('Wedge chart')).toBeTruthy();
    });

    it('renders wedge distances subtitle', () => {
        const { getByText } = render(<WedgeChartScreen />);
        expect(getByText('Your wedge carry distances')).toBeTruthy();
    });

    it('shows save button', () => {
        const { getByTestId } = render(<WedgeChartScreen />);
        expect(getByTestId('save-wedge-chart-button')).toBeTruthy();
    });

    it('shows add club button', () => {
        const { getByTestId } = render(<WedgeChartScreen />);
        expect(getByTestId('add-wedge-club-button')).toBeTruthy();
    });

    it('shows add distance button', () => {
        const { getByTestId } = render(<WedgeChartScreen />);
        expect(getByTestId('add-wedge-distance-button')).toBeTruthy();
    });

    describe('onboarding', () => {
        it('showsOnboardingWhenWedgeChartOnboardingNotSeen', () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            const { getByTestId } = render(<WedgeChartScreen />);
            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('hidesOnboardingWhenWedgeChartOnboardingSeen', () => {
            const { queryByTestId } = render(<WedgeChartScreen />);
            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('hidesOnboardingWhenChartIsNotEmpty', () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            mockGetWedgeChartService.mockReturnValue(nonEmptyChart);
            const { queryByTestId } = render(<WedgeChartScreen />);
            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('infoButtonShowsOnboarding', () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);
            expect(queryByTestId('onboarding-overlay')).toBeNull();
            fireEvent.press(getByTestId('info-button'));
            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('dismissOnboardingHidesOverlay', async () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);
            expect(getByTestId('onboarding-overlay')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('skip-button'));
            });

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('dismissOnboardingCallsSaveSettingsWithWedgeChartOnboardingSeenTrue', async () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            const { getByTestId } = render(<WedgeChartScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('skip-button'));
            });

            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ wedgeChartOnboardingSeen: true })
            );
        });
    });

    describe('clear chart', () => {
        beforeEach(() => {
            mockGetWedgeChartService.mockReturnValue(nonEmptyChart);
        });

        it('showsClearButtonWhenChartIsNotEmpty', () => {
            const { getByTestId } = render(<WedgeChartScreen />);
            expect(getByTestId('clear-button')).toBeTruthy();
        });

        it('doesNotShowClearButtonWhenChartIsEmpty', () => {
            mockGetWedgeChartService.mockReturnValue({ distanceNames: [], clubs: [] });
            const { queryByTestId } = render(<WedgeChartScreen />);
            expect(queryByTestId('clear-button')).toBeNull();
        });

        it('pressingClearButtonShowsConfirmAndCancelButtons', () => {
            const { getByTestId } = render(<WedgeChartScreen />);
            fireEvent.press(getByTestId('clear-button'));
            expect(getByTestId('confirm-clear-button')).toBeTruthy();
            expect(getByTestId('cancel-clear-button')).toBeTruthy();
        });

        it('pressingClearButtonHidesClearButton', () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);
            fireEvent.press(getByTestId('clear-button'));
            expect(queryByTestId('clear-button')).toBeNull();
        });

        it('pressingCancelClearButtonHidesClearConfirm', () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);
            fireEvent.press(getByTestId('clear-button'));
            fireEvent.press(getByTestId('cancel-clear-button'));
            expect(queryByTestId('cancel-clear-button')).toBeNull();
            expect(queryByTestId('confirm-clear-button')).toBeNull();
        });

        it('pressingCancelClearRestoresClearButton', () => {
            const { getByTestId } = render(<WedgeChartScreen />);
            fireEvent.press(getByTestId('clear-button'));
            fireEvent.press(getByTestId('cancel-clear-button'));
            expect(getByTestId('clear-button')).toBeTruthy();
        });

        it('pressingConfirmClearCallsSaveWedgeChartServiceWithEmptyData', async () => {
            const { getByTestId } = render(<WedgeChartScreen />);
            fireEvent.press(getByTestId('clear-button'));

            await act(async () => {
                fireEvent.press(getByTestId('confirm-clear-button'));
            });

            expect(mockSaveWedgeChartService).toHaveBeenCalledWith({ distanceNames: [], clubs: [] });
        });

        it('pressingConfirmClearHidesClearConfirm', async () => {
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);
            fireEvent.press(getByTestId('clear-button'));
            expect(getByTestId('confirm-clear-button')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('confirm-clear-button'));
            });

            expect(queryByTestId('confirm-clear-button')).toBeNull();
        });
    });

    describe('save chart', () => {
        it('pressSaveButtonCallsSaveWedgeChartService', async () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('save-wedge-chart-button'));
            });

            expect(mockSaveWedgeChartService).toHaveBeenCalled();
        });
    });
});
