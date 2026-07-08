import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../app/(tabs)/practice';
import { getAllDrillHistoryService, getDrillStatsByTypeService, getSettingsService, saveSettingsService } from '@/service/DbService';

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
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('../../service/DbService', () => ({
    getAllDrillHistoryService: jest.fn(),
    getDrillStatsByTypeService: jest.fn(),
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

// Explicitly cast as Jest mock functions
const mockedGetAllDrillHistoryService = getAllDrillHistoryService as jest.Mock;
const mockedGetDrillStatsByTypeService = getDrillStatsByTypeService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

jest.mock('../../service/FirebaseService', () => ({
    logEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn((callback) => {
        // In tests, don't call the callback to avoid infinite re-renders
    }),
}));

jest.mock('expo-router', () => ({
    Link: ({ children }: any) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
}));

describe('Practice page ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetAllDrillHistoryService.mockReturnValue([{ Id: 1, Name: 'Fake', Result: 1, Score: 5, Created_At: '' }]);
        mockedGetDrillStatsByTypeService.mockReturnValue([]);
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

    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('Making practice time effective')).toBeTruthy();
        expect(getByText('Practice areas')).toBeTruthy();
    });

    it('renders correctly practice area options', () => {
        const { getByText } = render(<View />);

        expect(getByText('Putting')).toBeTruthy();
        expect(getByText('Chipping')).toBeTruthy();
        expect(getByText('Pitching')).toBeTruthy();
        expect(getByText('Bunker play')).toBeTruthy();
    });

    it('renders correctly tool options', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-tools');

        fireEvent.press(subMenuItem);

        expect(getByText('Practice tools')).toBeTruthy();
        expect(getByText('Tempo')).toBeTruthy();
        expect(getByText('Random')).toBeTruthy();
        expect(getByText('Reminders')).toBeTruthy();
    });

    it('renders correctly history options', () => {
        const drills = [
            { Id: 1, Name: 'Fake - ladder', Result: 1, Score: 8, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 2, Name: 'Fake - clock', Result: 0, Score: 2, Created_At: '2025-03-16T13:01:00.684Z' }
        ];

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Fake - ladder')).toBeTruthy();
    });

    it('renders correctly drill history headings with infinite scroll', () => {
        const drills = Array.from({ length: 25 }, (_, i) => ({
            Id: i + 1,
            Name: `Drill - ${i + 1}`,
            Result: 1,
            Score: 5 + i,
            Created_At: '2025-03-17T13:01:00.684Z'
        }));

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getAllByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        // With infinite scroll, there's one header row with these labels
        expect(getAllByText('Test').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('Score').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('Date').length).toBeGreaterThanOrEqual(1);
    });

    it('renders correctly when drill history is empty', () => {
        mockedGetAllDrillHistoryService.mockReturnValue([]);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('No test history yet')).toBeTruthy();
    });

    it('renders correctly drill history items', () => {
        const drills = [
            { Id: 1, Name: 'Fake - ladder', Result: 1, Score: 8, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 2, Name: 'Fake - clock', Result: 0, Score: 2, Created_At: '2025-03-16T13:01:00.684Z' }
        ];

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Fake - ladder')).toBeTruthy();
        expect(getByText('Fake - clock')).toBeTruthy();
    });

    it('renders correctly drill history items paged', () => {
        const drills = [
            { Id: 1, Name: 'Fake - 1', Result: 1, Score: 8, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 2, Name: 'Fake - 2', Result: 0, Score: 2, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 3, Name: 'Fake - 3', Result: 0, Score: 3, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 4, Name: 'Fake - 4', Result: 0, Score: 1, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 5, Name: 'Fake - 5', Result: 0, Score: 4, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 6, Name: 'Fake - 6', Result: 0, Score: 2, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 7, Name: 'Fake - 7', Result: 1, Score: 7, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 8, Name: 'Fake - 8', Result: 0, Score: 3, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 9, Name: 'Fake - 9', Result: 0, Score: 2, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 10, Name: 'Fake - 10', Result: 0, Score: 1, Created_At: '2025-03-16T13:01:00.684Z' },
        ];

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Fake - 1')).toBeTruthy();
        expect(getByText('Fake - 2')).toBeTruthy();
        expect(getByText('Fake - 3')).toBeTruthy();
        expect(getByText('Fake - 4')).toBeTruthy();
        expect(getByText('Fake - 5')).toBeTruthy();
        expect(getByText('Fake - 6')).toBeTruthy();
        expect(getByText('Fake - 7')).toBeTruthy();
        expect(getByText('Fake - 8')).toBeTruthy();
        expect(getByText('Fake - 9')).toBeTruthy();
        expect(getByText('Fake - 10')).toBeTruthy();
    });

    it('shows info button', () => {
        const { getByTestId } = render(<View />);

        expect(getByTestId('info-button')).toBeTruthy();
    });

    it('shows onboarding overlay when practiceOnboardingSeen is false', () => {
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: true,
            playOnboardingSeen: true,
            homeOnboardingSeen: true,
            practiceOnboardingSeen: false,
        });

        const { getByTestId } = render(<View />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('does not show onboarding overlay when practiceOnboardingSeen is true', () => {
        const { queryByTestId } = render(<View />);

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('shows onboarding overlay when info button is pressed', () => {
        const { getByTestId } = render(<View />);

        fireEvent.press(getByTestId('info-button'));

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('shouldRenderRemindersButtonInToolsSection', () => {
        const { getByText, getByTestId } = render(<View />);
        fireEvent.press(getByTestId('practice-sub-menu-tools'));
        expect(getByText('Reminders')).toBeTruthy();
    });

    it('dismisses onboarding and saves settings when done is pressed', async () => {
        mockGetSettingsService.mockReturnValue({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: true,
            playOnboardingSeen: true,
            homeOnboardingSeen: true,
            practiceOnboardingSeen: false,
        });

        const { getByTestId, queryByTestId } = render(<View />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();

        fireEvent.press(getByTestId('next-button'));
        fireEvent.press(getByTestId('next-button'));
        fireEvent.press(getByTestId('done-button'));

        expect(queryByTestId('onboarding-overlay')).toBeNull();
        expect(saveSettingsService).toHaveBeenCalledWith(
            expect.objectContaining({ practiceOnboardingSeen: true })
        );
    });

    it('practiceAreasSectionIsLabelledPracticeAreas', () => {
        const { getByText } = render(<View />);
        expect(getByText('Practice areas')).toBeTruthy();
    });

    it('showsFullSwingTileInPracticeAreas', () => {
        const { getByText } = render(<View />);
        expect(getByText('Full swing')).toBeTruthy();
    });
});
