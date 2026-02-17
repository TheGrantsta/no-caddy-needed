import * as React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Homepage from '../../app/(tabs)/index';
import { getSettingsService, saveSettingsService } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
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
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
    }),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

const mockGetSettingsService = getSettingsService as jest.Mock;

describe('renders homepage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: true,
            playOnboardingSeen: true,
            homeOnboardingSeen: true,
            practiceOnboardingSeen: true,
        });
    });

    it('shows title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('No caddy needed!')).toBeTruthy();
    });

    it('shows sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Smarter play, practice & performance')).toBeTruthy();
    });

    it('shows sub, sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Be your own best caddy')).toBeTruthy();
    });

    it('shows links on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Play')).toBeTruthy();
        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('Perform')).toBeTruthy();
    });

    it('shows points on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf simplified')).toBeTruthy();
        expect(getByText('In a nutshell: hit it, find it and hit it again')).toBeTruthy();
        expect(getByText('Point: get the ball in the hole with the fewest shots')).toBeTruthy();
        expect(getByText('Have fun: golf is a game, so for goodness sake enjoy it!')).toBeTruthy();
    });

    it('shows footer text on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf is not a game of perfect, or having a perfect swing')).toBeTruthy();
    });

    it('shows info button', () => {
        const { getByTestId } = render(<Homepage />);

        expect(getByTestId('info-button')).toBeTruthy();
    });

    it('shows onboarding overlay when homeOnboardingSeen is false', () => {
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: true,
            playOnboardingSeen: true,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: true,
        });

        const { getByTestId } = render(<Homepage />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('does not show onboarding overlay when homeOnboardingSeen is true', () => {
        const { queryByTestId } = render(<Homepage />);

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('shows onboarding overlay when info button is pressed', () => {
        const { getByTestId } = render(<Homepage />);

        fireEvent.press(getByTestId('info-button'));

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('dismisses onboarding and saves settings when done is pressed', async () => {
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: true,
            playOnboardingSeen: true,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: true,
        });

        const { getByTestId, queryByTestId } = render(<Homepage />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();

        fireEvent.press(getByTestId('next-button'));
        fireEvent.press(getByTestId('next-button'));
        fireEvent.press(getByTestId('done-button'));

        expect(queryByTestId('onboarding-overlay')).toBeNull();
        expect(saveSettingsService).toHaveBeenCalledWith(
            expect.objectContaining({ homeOnboardingSeen: true })
        );
    });
});
