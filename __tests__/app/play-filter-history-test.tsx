import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';

import {
    getActiveRoundService,
    getAllRoundHistoryService,
    getAllDeadlySinsRoundsService,
    getClubDistancesService,
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

const mockGetActiveRound = getActiveRoundService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
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

    describe('History filter', () => {
        it('renders filter buttons 1, 10, and All when round history exists', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('filter-button-1')).toBeTruthy();
            expect(getByTestId('filter-button-10')).toBeTruthy();
            expect(getByTestId('filter-button-all')).toBeTruthy();
        });

        it('renders Filter label next to the filter buttons', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('filter-label')).toBeTruthy();
        });

        it('all filter buttons have the same fixed width', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            const btn1 = getByTestId('filter-button-1');
            const btn10 = getByTestId('filter-button-10');
            const btnAll = getByTestId('filter-button-all');

            const getWidth = (el: any) => {
                const styles = Array.isArray(el.props.style) ? el.props.style : [el.props.style];
                return styles.find((s: any) => s && s.width !== undefined)?.width;
            };

            expect(getWidth(btn1)).toBeDefined();
            expect(getWidth(btn1)).toEqual(getWidth(btn10));
            expect(getWidth(btn1)).toEqual(getWidth(btnAll));
        });

        it('shows all rounds by default', () => {
            const rounds = Array.from({ length: 5 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId } = render(<Play />);

            rounds.forEach(r => expect(getByTestId(`round-history-row-${r.Id}`)).toBeTruthy());
        });

        it('limits round history to 1 when filter 1 is pressed', () => {
            const rounds = Array.from({ length: 3 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('filter-button-1'));

            expect(getByTestId('round-history-row-1')).toBeTruthy();
            expect(queryByTestId('round-history-row-2')).toBeNull();
            expect(queryByTestId('round-history-row-3')).toBeNull();
        });

        it('limits round history to 10 when filter 10 is pressed', () => {
            const rounds = Array.from({ length: 12 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('filter-button-10'));

            expect(getByTestId('round-history-row-10')).toBeTruthy();
            expect(queryByTestId('round-history-row-11')).toBeNull();
            expect(queryByTestId('round-history-row-12')).toBeNull();
        });

        it('shows all rounds again when All pressed after filtering', () => {
            const rounds = Array.from({ length: 3 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('filter-button-1'));
            fireEvent.press(getByTestId('filter-button-all'));

            rounds.forEach(r => expect(getByTestId(`round-history-row-${r.Id}`)).toBeTruthy());
        });
    });
});
