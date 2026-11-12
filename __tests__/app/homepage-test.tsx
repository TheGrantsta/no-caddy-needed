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

jest.mock('../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: { expoConfig: { version: '2.0.17' } },
}));

jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Link: ({ href, children, testID }: { href: string; children: React.ReactNode; testID?: string }) => (
            <View testID={testID ?? `link-${href}`}>{children}</View>
        ),
        useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
        useFocusEffect: (callback: () => void) => {
            React.useEffect(callback, [callback]);
        },
    };
});

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
        whatsNewVersionSeen: '2.0.17',
    }),
    saveSettingsService: jest.fn().mockResolvedValue(true),
    getAllRoundHistoryService: jest.fn(() => []),
    getAllDrillHistoryService: jest.fn(() => []),
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
const mockSaveSettingsService = saveSettingsService as jest.Mock;

const homeSettings = (overrides: Record<string, unknown> = {}) => ({
    theme: 'dark',
    notificationsEnabled: true,
    wedgeChartOnboardingSeen: true,
    distancesOnboardingSeen: true,
    playOnboardingSeen: true,
    homeOnboardingSeen: true,
    practiceOnboardingSeen: true,
    whatsNewVersionSeen: '2.0.17',
    ...overrides,
});

describe('renders homepage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(homeSettings());
    });

    it('shows title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('No caddy needed!')).toBeTruthy();
    });

    it('shows sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Smarter play & practice')).toBeTruthy();
    });

    it('shows sub, sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Be your own best caddy')).toBeTruthy();
    });

    it('shows the start a round button and quick tools on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Start a round')).toBeTruthy();
        expect(getByText('Wind')).toBeTruthy();
        expect(getByText('Tempo')).toBeTruthy();
        expect(getByText('Random')).toBeTruthy();
    });

    it('shows points on homepage once Golf, simplified is opened', () => {
        const { getByText, getByTestId } = render(<Homepage />);

        expect(getByText('Golf, simplified')).toBeTruthy();
        fireEvent.press(getByTestId('golf-simplified-row'));

        expect(getByText('Method: hit it, find it, hit it again')).toBeTruthy();
        expect(getByText('Objective: get the ball in the hole with the fewest shots')).toBeTruthy();
        expect(getByText('Enjoyment: golf is a game')).toBeTruthy();
    });

    it('shows the tagline in the hero card on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf is not a game of perfect, or having a perfect swing')).toBeTruthy();
    });

    it('does not show an info button on the page', () => {
        const { queryByTestId } = render(<Homepage />);

        expect(queryByTestId('info-button')).toBeNull();
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

        fireEvent.press(getByTestId('done-button'));

        expect(queryByTestId('onboarding-overlay')).toBeNull();
        expect(saveSettingsService).toHaveBeenCalledWith(
            expect.objectContaining({ homeOnboardingSeen: true, whatsNewVersionSeen: '2.0.17' })
        );
    });

    describe("What's new overlay", () => {
        it('shows What\'s new for an existing user on a new version', () => {
            mockGetSettingsService.mockReturnValue(homeSettings({ homeOnboardingSeen: true, whatsNewVersionSeen: '2.0.10' }));

            const { getByText } = render(<Homepage />);

            expect(getByText("What's new")).toBeTruthy();
        });

        it('does not show What\'s new when the current version was already seen', () => {
            mockGetSettingsService.mockReturnValue(homeSettings({ homeOnboardingSeen: true, whatsNewVersionSeen: '2.0.17' }));

            const { queryByText } = render(<Homepage />);

            expect(queryByText("What's new")).toBeNull();
        });

        it('does not show What\'s new to a brand-new user (onboarding shows instead)', () => {
            mockGetSettingsService.mockReturnValue(homeSettings({ homeOnboardingSeen: false, whatsNewVersionSeen: '' }));

            const { queryByText, getByTestId } = render(<Homepage />);

            expect(queryByText("What's new")).toBeNull();
            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('saves the current version and hides the overlay when dismissed', () => {
            mockGetSettingsService.mockReturnValue(homeSettings({ homeOnboardingSeen: true, whatsNewVersionSeen: '2.0.10' }));

            const { getByTestId, queryByText } = render(<Homepage />);
            expect(queryByText("What's new")).toBeTruthy();

            fireEvent.press(getByTestId('acknowledge-dismiss'));

            expect(queryByText("What's new")).toBeNull();
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ whatsNewVersionSeen: '2.0.17' })
            );
        });
    });
});
