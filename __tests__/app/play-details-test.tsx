import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';

import {
    startRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    getAllDeadlySinsRoundsService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getHolesPlayedForRoundService,
    loadCourseNotesService,
    getHolesWithSinsForRoundService,
    _PENALTY_TYPES,
} from '../../service/DbService';

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

jest.mock('../../service/DbService', () => ({
    startRoundService: jest.fn(),
    endRoundService: jest.fn(),
    addMultiplayerHoleScoresService: jest.fn(),
    getActiveRoundService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
    insertHoleDeadlySinsService: jest.fn().mockResolvedValue(true),
    getAllDeadlySinsRoundsService: jest.fn(),
    getClubDistancesService: jest.fn().mockReturnValue([]),
    getWedgeChartService: jest.fn().mockReturnValue({ distanceNames: [], clubs: [] }),
    saveWedgeChartService: jest.fn(),
    addRoundPlayersService: jest.fn(),
    getRoundPlayersService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    getRecentCourseNamesService: jest.fn(),
    getRecentPlayerNamesService: jest.fn(),
    getHolesPlayedForRoundService: jest.fn().mockReturnValue(0),
    getCourseHoleParsService: jest.fn().mockReturnValue({}),
    loadCourseNotesService: jest.fn().mockReturnValue({}),
    saveHoleNoteService: jest.fn().mockResolvedValue(true),
    getParAveragesService: jest.fn().mockReturnValue({ par3: null, par4: null, par5: null }),
    getHoleDeadlySinsService: jest.fn().mockReturnValue(null),
    getHoleScoresService: jest.fn().mockReturnValue(null),
    getHolesWithSinsForRoundService: jest.fn().mockReturnValue(new Set()),
    getPuttingStatsService: jest.fn().mockReturnValue(null),
    insertPuttingStatsService: jest.fn().mockResolvedValue(true),
    insertHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    getHoleSinDetailsService: jest.fn().mockReturnValue(null),
    deleteHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
        reviewPromptShown: false,
        skipStatsFlowEnabled: false,
        preShotReminderEnabled: true,
        badHoleReassuranceEnabled: true,
    } as any),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../service/ReviewService', () => ({
    maybeRequestRoundReviewService: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../database/db', () => ({
    getWedgeChartDistanceNames: jest.fn().mockReturnValue([]),
    getWedgeChartEntries: jest.fn().mockReturnValue([]),
}));

const mockToastShow = jest.fn();
jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: mockToastShow,
    }),
}));

jest.mock('../../service/NotificationService', () => ({
    scheduleRoundReminder: jest.fn(),
    cancelRoundReminder: jest.fn(),
    cancelAllRoundReminders: jest.fn(),
}));

jest.mock('../../service/FirebaseService', () => ({
    logEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: { Medium: 'medium' },
}));

const mockPush = jest.fn();
const mockSetOptions = jest.fn();
jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        useRouter: () => ({
            push: mockPush,
        }),
        useNavigation: () => ({
            setOptions: mockSetOptions,
        }),
        useFocusEffect: (cb: () => void) => { capturedFocusEffect = cb; },
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <View testID={`link-${href}`}>{children}</View>
        ),
    };
});

const mockRefreshWind = jest.fn();
let mockWindValue: { directionFrom: number; speedMph: number } | null = { directionFrom: 270, speedMph: 12 };
jest.mock('../../hooks/useWind', () => ({
    useWind: () => ({ wind: mockWindValue, heading: 0, refreshWind: mockRefreshWind }),
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

const mockStartRound = startRoundService as jest.Mock;
const mockAddMultiplayerHoleScores = addMultiplayerHoleScoresService as jest.Mock;
const mockGetActiveRound = getActiveRoundService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockGetRecentCourseNames = getRecentCourseNamesService as jest.Mock;
const mockGetRecentPlayerNames = getRecentPlayerNamesService as jest.Mock;
const mockGetHolesPlayedForRound = getHolesPlayedForRoundService as jest.Mock;
const mockLoadCourseNotes = loadCourseNotesService as jest.Mock;
const mockGetHolesWithSinsForRound = getHolesWithSinsForRoundService as jest.Mock;

describe('Play screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRound.mockReturnValue(null);
        mockGetAllRoundHistory.mockReturnValue([]);
        mockGetAllDeadlySinsRounds.mockReturnValue([]);
        mockGetClubDistances.mockReturnValue([]);
        mockGetRoundPlayers.mockReturnValue([]);
        mockGetMultiplayerScorecard.mockReturnValue(null);
        mockGetRecentCourseNames.mockReturnValue([]);
        mockGetRecentPlayerNames.mockReturnValue([]);
        mockGetHolesPlayedForRound.mockReturnValue(0);
        mockLoadCourseNotes.mockReturnValue({});
        mockGetHolesWithSinsForRound.mockReturnValue(new Set());
    });

    describe('Wind display', () => {
        beforeEach(() => {
            mockRefreshWind.mockClear();
            mockWindValue = { directionFrom: 270, speedMph: 12 };
        });

        it('showsWindDisplayCardWithSpeedDuringActiveRoundScorePhase', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);
            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('wind-display-container')).toBeTruthy());
            expect(getByTestId('wind-speed-text-large')).toHaveTextContent('12 mph');
        });

        it('refreshesWindWhenAdvancingHole', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);
            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('next-hole-button')).toBeTruthy());
            expect(mockRefreshWind).toHaveBeenCalled();
        });

        it('hidesWindDisplayCardWhenNoWindData', async () => {
            mockWindValue = null;
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);
            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('next-hole-button')).toBeTruthy());
            expect(queryByTestId('wind-display-container')).toBeNull();
        });
    });

    describe('Sin Details phase', () => {
        it('loadsClubDistancesOnInitialization', () => {
            mockGetClubDistances.mockReturnValue([
                { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 0 },
            ]);

            render(<Play />);

            expect(mockGetClubDistances).toHaveBeenCalled();
        });
    });
});
