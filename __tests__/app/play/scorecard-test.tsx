import React from 'react';
import { StyleSheet } from 'react-native';
import { act, render, fireEvent, waitFor, within } from '@testing-library/react-native';
import ScorecardScreen from '../../../app/play/scorecard';
import { getRoundScorecardService, getMultiplayerScorecardService, updateScorecardService, updateRoundStartTimeService, deleteRoundService, getHoleDeadlySinsService, replaceHoleDeadlySinsService, getHolesWithSinsForRoundService, loadCourseNotesService, getAllRoundHistoryService, getRoundScoreBreakdownService, getClubDistancesService, getHoleSinDetailsService, replaceHoleSinDetailsService, deleteHoleSinDetailsService, getPuttingStatsService, insertPuttingStatsService, _PENALTY_TYPES, _DOUBLE_CHIP_REASONS } from '../../../service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const mockShow = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('../../../service/DbService', () => ({
    getRoundScorecardService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    updateScorecardService: jest.fn(),
    updateRoundStartTimeService: jest.fn().mockResolvedValue(true),
    deleteRoundService: jest.fn(),
    getHoleDeadlySinsService: jest.fn(),
    replaceHoleDeadlySinsService: jest.fn().mockResolvedValue(true),
    getHolesWithSinsForRoundService: jest.fn(),
    loadCourseNotesService: jest.fn().mockReturnValue({}),
    getAllRoundHistoryService: jest.fn(),
    getRoundScoreBreakdownService: jest.fn(),
    getClubDistancesService: jest.fn().mockReturnValue([]),
    getHoleSinDetailsService: jest.fn().mockReturnValue(null),
    replaceHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    deleteHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    getPuttingStatsService: jest.fn().mockReturnValue(null),
    insertPuttingStatsService: jest.fn().mockResolvedValue(true),
    PENALTY_TYPES: ['Out of bounds', 'Water hazard', 'Unplayable lie', 'Lost ball', 'Other 1-shot penalty', 'General penalty'],
    DOUBLE_CHIP_REASONS: ['Poor contact', 'Bad lie', 'Distance miscalculation', 'Other'],
}));

let mockParams: { roundId: string } = { roundId: '1' };
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => mockParams,
    useRouter: () => ({
        back: mockBack,
        push: mockPush,
    }),
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

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: mockShow,
    }),
}));

const mockGetRoundScorecard = getRoundScorecardService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockUpdateScorecard = updateScorecardService as jest.Mock;
const mockUpdateRoundStartTime = updateRoundStartTimeService as jest.Mock;
const mockDeleteRound = deleteRoundService as jest.Mock;
const mockGetHoleDeadlySinsService = getHoleDeadlySinsService as jest.Mock;
const mockReplaceHoleDeadlySinsService = replaceHoleDeadlySinsService as jest.Mock;
const mockGetHolesWithSinsForRoundService = getHolesWithSinsForRoundService as jest.Mock;
const _mockLoadCourseNotes = loadCourseNotesService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;
const mockGetRoundScoreBreakdown = getRoundScoreBreakdownService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockGetHoleSinDetails = getHoleSinDetailsService as jest.Mock;
const mockReplaceHoleSinDetails = replaceHoleSinDetailsService as jest.Mock;
const mockDeleteHoleSinDetails = deleteHoleSinDetailsService as jest.Mock;
const mockGetPuttingStats = getPuttingStatsService as jest.Mock;
const _mockInsertPuttingStats = insertPuttingStatsService as jest.Mock;

const makeHistoryRound = (id: number) => ({
    Id: id, TotalScore: 0, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: null, Created_At: '',
});

const multiplayerData = {
    round: { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: null, Created_At: '' },
    players: [
        { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
    ],
    holeScores: [
        { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
        { Id: 11, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 3 },
    ],
};

describe('Scorecard screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockParams = { roundId: '1' };
        mockGetMultiplayerScorecard.mockReturnValue(null);
        mockGetHoleDeadlySinsService.mockReturnValue(null);
        mockReplaceHoleDeadlySinsService.mockResolvedValue(true);
        mockGetHolesWithSinsForRoundService.mockReturnValue(new Set());
        mockGetRoundScoreBreakdown.mockReturnValue({ putts: 36, penalties: 0 });
        // Default to a single round (= the param round) so each existing test renders one page.
        mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(1)]);
    });


    it('renders the scorecard page without a top heading', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: null, Created_At: '' },
            holes: [
                { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 1 },
                { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: 0 },
                { Id: 3, RoundId: 1, HoleNumber: 3, ScoreRelativeToPar: 2 },
            ],
        });

        const { getByTestId, queryByText } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-page-1')).toBeTruthy();
        expect(queryByText('Scorecard')).toBeNull();
    });

    it('shows course name when present on multiplayer scorecard', () => {
        const data = {
            ...multiplayerData,
            round: { ...multiplayerData.round, CourseName: 'St Andrews' },
        };
        mockGetMultiplayerScorecard.mockReturnValue(data);

        const { getByText } = render(<ScorecardScreen />);

        expect(getByText('St Andrews')).toBeTruthy();
    });

    it('does not show course name when CourseName is null', () => {
        mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

        const { queryByTestId } = render(<ScorecardScreen />);

        expect(queryByTestId('scorecard-course-name')).toBeNull();
    });

    it('shows course name on legacy scorecard when present', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: 'Pebble Beach', Created_At: '' },
            holes: [{ Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 }],
        });

        const { getByText } = render(<ScorecardScreen />);

        expect(getByText('Pebble Beach')).toBeTruthy();
    });

    it('shows the course name without brackets on the multiplayer scorecard', () => {
        const data = {
            ...multiplayerData,
            round: { ...multiplayerData.round, CourseName: 'St Andrews', Created_At: '26/02' },
        };
        mockGetMultiplayerScorecard.mockReturnValue(data);

        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-course-name')).toHaveTextContent('St Andrews');
    });

    it('shows the course name without brackets on the legacy scorecard', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: 'Pebble Beach', Created_At: '15/06' },
            holes: [{ Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 }],
        });

        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-course-name')).toHaveTextContent('Pebble Beach');
    });

    it('renders RoundScorecard component with correct props', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, TotalScore: 5, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
            holes: [
                { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 5 },
            ],
        });

        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-total')).toBeTruthy();
    });

    it('shows message when round not found', () => {
        mockGetRoundScorecard.mockReturnValue(null);

        const { getByText } = render(<ScorecardScreen />);

        expect(getByText('Round not found')).toBeTruthy();
    });

    it('shows the summary card and score table even when a round has no score breakdown', () => {
        mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
        mockGetRoundScoreBreakdown.mockReturnValue(null);

        const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('round-summary-card')).toBeTruthy();
        expect(getByTestId('round-table-card-out')).toBeTruthy();
        expect(queryByTestId('scorecard-total')).toBeNull();
    });

    it('shows the summary card and score table for a score-only round too', () => {
        mockGetMultiplayerScorecard.mockReturnValue({
            ...multiplayerData,
            round: { ...multiplayerData.round, IsScoreOnly: 1 },
        });

        const { getByTestId, queryByText } = render(<ScorecardScreen />);

        expect(getByTestId('round-summary-card')).toBeTruthy();
        expect(getByTestId('round-table-card-out')).toBeTruthy();
        expect(queryByText('Putts')).toBeNull();
        expect(queryByText('3-putts')).toBeNull();
        expect(queryByText('Penalties')).toBeNull();
    });

    it('renders multiplayer scorecard when multiplayer data exists', () => {
        mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('round-summary-card')).toBeTruthy();
    });

    it('falls back to legacy scorecard when no multiplayer data', () => {
        mockGetMultiplayerScorecard.mockReturnValue(null);
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
            holes: [
                { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 },
            ],
        });

        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-total')).toBeTruthy();
    });

    describe('Edit mode', () => {
        it('shows edit button for multiplayer scorecard', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('edit-scorecard-button')).toBeTruthy();
        });

        it('does not show edit button for legacy scorecard', () => {
            mockGetMultiplayerScorecard.mockReturnValue(null);
            mockGetRoundScorecard.mockReturnValue({
                round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
                holes: [{ Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 }],
            });

            const { queryByTestId } = render(<ScorecardScreen />);

            expect(queryByTestId('edit-scorecard-button')).toBeNull();
        });

        it('enters edit mode when edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(getByTestId('edit-round-save-button')).toBeTruthy();
            expect(getByTestId('edit-round-cancel-button')).toBeTruthy();
            expect(queryByTestId('edit-scorecard-button')).toBeNull();
        });

        it('hides the back button, course name and date while editing', () => {
            mockGetMultiplayerScorecard.mockReturnValue({
                ...multiplayerData,
                round: { ...multiplayerData.round, CourseName: 'Stats Flow Test Course', StartTime: '2026-11-03T10:00:00Z' },
            });

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('scorecard-back-button')).toBeTruthy();
            expect(getByTestId('scorecard-course-name')).toBeTruthy();

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(queryByTestId('scorecard-back-button')).toBeNull();
            expect(queryByTestId('scorecard-course-name')).toBeNull();
            expect(queryByTestId('scorecard-date')).toBeNull();
            expect(getByTestId('edit-round-cancel-button')).toBeTruthy();
        });

        it('shows the club picker inside the trouble off tee row when a hole is edited', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue([
                { Id: 1, Club: 'Driver', CarryDistance: 220, TotalDistance: 230, SortOrder: 0 },
            ]);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);

            expect(within(getByTestId('edit-hole-follow-up-troubleOffTee')).getByTestId('club-picker-dropdown-toggle')).toBeTruthy();
            expect(queryByTestId('edit-hole-follow-up-penalties')).toBeNull();
        });

        it('shows the edit round sheet with each hole and the total when editing', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(getByText('Edit round')).toBeTruthy();
            expect(within(getByTestId('edit-round-hole-1')).getByText('5')).toBeTruthy();
            expect(getByText('Total 5')).toBeTruthy();
        });

        it('lists only the signed-in player holes in the edit round sheet', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(within(getByTestId('edit-round-hole-1')).getByText('5')).toBeTruthy();
            expect(within(getByTestId('edit-round-hole-1')).queryByText('3')).toBeNull();
        });

        it('opens the hole sheet when a hole is pressed in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(getByText('Hole 1')).toBeTruthy();
            expect(getByTestId('edit-hole-strokes-value')).toHaveTextContent('5');
        });

        it('increments selected score', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-strokes-increment'));

            expect(getByTestId('edit-hole-strokes-value')).toHaveTextContent('6');

            fireEvent.press(getByTestId('edit-hole-back-button'));

            expect(within(getByTestId('edit-round-hole-1')).getByText('6')).toBeTruthy();
        });

        it('decrements selected score', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-strokes-decrement'));

            expect(getByTestId('edit-hole-strokes-value')).toHaveTextContent('4');

            fireEvent.press(getByTestId('edit-hole-back-button'));

            expect(within(getByTestId('edit-round-hole-1')).getByText('4')).toBeTruthy();
        });

        it('does not decrement below 1', () => {
            const data = {
                ...multiplayerData,
                holeScores: [
                    { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 1 },
                    { Id: 11, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 3 },
                ],
            };
            mockGetMultiplayerScorecard.mockReturnValue(data);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-strokes-decrement'));

            expect(getByTestId('edit-hole-strokes-value')).toHaveTextContent('1');
        });

        it('saves the round as soon as Save is pressed, without a confirmation step', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledTimes(1);
            });
            expect(queryByTestId('confirm-save-button')).toBeNull();
            expect(queryByTestId('cancel-save-button')).toBeNull();
        });

        it('calls update service on confirm save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-strokes-increment'));
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(1, [{ id: 10, score: 6 }], []);
            });
        });

        it('shows success toast after save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalledWith('Scorecard updated', expect.objectContaining({ type: 'success' }));
            });
        });

        it('shows error toast when save fails', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(false);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalledWith('Failed to update scorecard', expect.objectContaining({ type: 'danger' }));
            });
        });

        it('exits edit mode after successful save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(getByTestId('edit-scorecard-button')).toBeTruthy();
            });
            expect(queryByTestId('edit-round-save-button')).toBeNull();
        });

        it('discards changes when cancel edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-strokes-increment'));
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-cancel-button'));

            expect(queryByTestId('edit-round-save-button')).toBeNull();
            expect(getByTestId('edit-scorecard-button')).toBeTruthy();
            expect(getByTestId('round-table-score-1')).toHaveTextContent('5');
        });

        it('shows the deadly sins switches when a hole is opened in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(getByTestId('edit-hole-sin-threePutts')).toBeTruthy();
        });

        it('calls getHoleDeadlySinsService with correct roundId and holeNumber when hole selected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(mockGetHoleDeadlySinsService).toHaveBeenCalledWith(1, 1);
        });

        it('saves sins for selected hole on confirm save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-threePutts'), 'valueChange', true);
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockReplaceHoleDeadlySinsService).toHaveBeenCalledWith(
                    1,
                    1,
                    expect.objectContaining({ threePutts: true, doubleBogeys: false })
                );
            });
        });

        it('does not save sins when no hole was opened during edit', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalled();
            });
            expect(mockReplaceHoleDeadlySinsService).not.toHaveBeenCalled();
        });

        it('updates the deadly sins switches when switching to a different hole', () => {
            const twoHoleData = {
                ...multiplayerData,
                holeScores: [
                    ...multiplayerData.holeScores,
                    { Id: 12, RoundId: 1, RoundPlayerId: 1, HoleNumber: 2, HolePar: 4, Score: 5 },
                    { Id: 13, RoundId: 1, RoundPlayerId: 2, HoleNumber: 2, HolePar: 4, Score: 4 },
                ],
            };
            mockGetMultiplayerScorecard.mockReturnValue(twoHoleData);
            mockGetHoleDeadlySinsService.mockImplementation((_: number, holeNumber: number) =>
                holeNumber === 1
                    ? { threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false }
                    : null
            );

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(getByTestId('edit-hole-sin-threePutts').props.value).toBe(true);

            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-hole-2'));

            expect(getByTestId('edit-hole-sin-threePutts').props.value).toBe(false);
        });

        it('clears the hole sheet when cancel edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-threePutts'), 'valueChange', true);
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-cancel-button'));
            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(queryByTestId('edit-hole-sin-threePutts')).toBeNull();
        });
    });

    describe('Sin indicator dots', () => {
        it('shows sin indicator dot for holes with sins recorded', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetHolesWithSinsForRoundService.mockReturnValue(new Set([1]));

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('round-table-dot-1')).toBeTruthy();
        });

        it('does not show sin indicator dot for holes without sins', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetHolesWithSinsForRoundService.mockReturnValue(new Set([1]));

            const { queryByTestId } = render(<ScorecardScreen />);

            expect(queryByTestId('sin-indicator-2')).toBeNull();
        });

        it('calls getHolesWithSinsForRoundService with roundId on load', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            render(<ScorecardScreen />);

            expect(mockGetHolesWithSinsForRoundService).toHaveBeenCalledWith(1);
        });
    });

    describe('Delete round', () => {
        it('shows delete button for multiplayer scorecard', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('delete-round-button')).toBeTruthy();
        });

        it('does not show delete button for legacy scorecard', () => {
            mockGetMultiplayerScorecard.mockReturnValue(null);
            mockGetRoundScorecard.mockReturnValue({
                round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
                holes: [{ Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 }],
            });

            const { queryByTestId } = render(<ScorecardScreen />);

            expect(queryByTestId('delete-round-button')).toBeNull();
        });

        it('does not show delete button in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(queryByTestId('delete-round-button')).toBeNull();
        });

        it('shows delete confirmation when delete pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));

            expect(getByTestId('confirm-delete-button')).toBeTruthy();
            expect(getByTestId('delete-round-cancel-button')).toBeTruthy();
        });

        it('shows the delete sheet over the page when Delete round is pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);
            expect(queryByTestId('delete-round-sheet')).toBeNull();

            fireEvent.press(getByTestId('delete-round-button'));

            expect(getByTestId('delete-round-sheet')).toBeTruthy();
        });

        it('calls deleteRoundService on confirm delete', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockDeleteRound.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));
            fireEvent.press(getByTestId('confirm-delete-button'));

            await waitFor(() => {
                expect(mockDeleteRound).toHaveBeenCalledWith(1);
            });
        });

        it('shows success toast and navigates back after delete', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockDeleteRound.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));
            fireEvent.press(getByTestId('confirm-delete-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalledWith('Round deleted', expect.objectContaining({ type: 'success' }));
                expect(mockBack).toHaveBeenCalled();
            });
        });

        it('shows error toast when delete fails', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockDeleteRound.mockResolvedValue(false);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));
            fireEvent.press(getByTestId('confirm-delete-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalledWith('Failed to delete round', expect.objectContaining({ type: 'danger' }));
            });
        });

        it('does not navigate back when delete fails', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockDeleteRound.mockResolvedValue(false);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));
            fireEvent.press(getByTestId('confirm-delete-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalled();
            });
            expect(mockBack).not.toHaveBeenCalled();
        });

        it('hides confirmation when cancel delete pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));

            expect(getByTestId('confirm-delete-button')).toBeTruthy();

            fireEvent.press(getByTestId('delete-round-cancel-button'));

            expect(queryByTestId('confirm-delete-button')).toBeNull();
            expect(getByTestId('delete-round-button')).toBeTruthy();
        });

        it('shows delete confirmation message with warning about irreversibility', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));

            expect(getByText('Delete this round?')).toBeTruthy();
            expect(getByText('Its scores and stats will be removed from Stats. This can’t be undone.')).toBeTruthy();
        });
    });

    describe('Par editing', () => {
        it('showsParButtonsOnHoleSheetWhenHoleSelected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(getByTestId('edit-hole-par-3')).toBeTruthy();
            expect(getByTestId('edit-hole-par-4')).toBeTruthy();
            expect(getByTestId('edit-hole-par-5')).toBeTruthy();
        });

        it('callsUpdateScorecardServiceWithParChangesOnConfirmSave', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);
            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-par-3'));
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(
                    1,
                    [],
                    [{ holeNumber: 1, holePar: 3 }]
                );
            });
        });

        it('doesNotSendParChangeWhenParUnchanged', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);
            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-par-4')); // unchanged par
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(1, [], []);
            });
        });
    });

    describe('Deadly sin dot', () => {
        it('shows the actual sin name as an info toast when tapped', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetHolesWithSinsForRoundService.mockReturnValue(new Set([1]));
            mockGetHoleDeadlySinsService.mockReturnValue({
                threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false,
                doubleChips: false, troubleOffTee: false, penalties: false,
            });

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('round-table-dot-1'));

            expect(mockShow).toHaveBeenCalledWith(
                expect.stringMatching(/3-putt/i),
                expect.objectContaining({ type: 'normal' })
            );
        });
    });

    describe('Action button hierarchy', () => {
        const colours = require('../../../assets/colours').default;

        it('renders Edit as a white pill with green text in the title row', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);
            const style = StyleSheet.flatten(getByTestId('edit-scorecard-button').props.style);

            expect(style.backgroundColor).toBe(colours.backgroundLight);
            expect(getByText('Edit')).toHaveStyle({ color: colours.primary });
        });

        it('renders Delete as a full-width white card with centred red text', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);
            const style = StyleSheet.flatten(getByTestId('delete-round-button').props.style);

            expect(style.backgroundColor).toBe(colours.backgroundLight);
            expect(style.borderRadius).toBe(20);
            expect(getByText('Delete round')).toHaveStyle({ color: colours.red, textAlign: 'center' });
        });
    });

    it('centres the course name in the title row', () => {
        mockGetMultiplayerScorecard.mockReturnValue({ ...multiplayerData, round: { ...multiplayerData.round, CourseName: 'St Andrews' } });
        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-course-name')).toHaveStyle({ textAlign: 'center' });
    });

    it('shows an Edit button to the right of the title, not in the buttons below', () => {
        mockGetMultiplayerScorecard.mockReturnValue({ ...multiplayerData, round: { ...multiplayerData.round, CourseName: 'St Andrews' } });
        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-title-row')).toContainElement(getByTestId('edit-scorecard-button'));
    });

    it('shows the round date on its own line beneath the course name', () => {
        mockGetMultiplayerScorecard.mockReturnValue({
            ...multiplayerData,
            round: { ...multiplayerData.round, CourseName: 'St Andrews', StartTime: new Date(2026, 10, 3, 10).toISOString() },
        });
        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-course-name')).toHaveTextContent('St Andrews');
        expect(getByTestId('scorecard-date')).toHaveTextContent(/^Tue 3 Nov 2026$/);
        expect(getByTestId('scorecard-date')).toHaveStyle({ fontSize: require('../../../assets/font-sizes').default.smallText, textAlign: 'center' });
    });

    it('shows a back button left of the course name that returns to the previous screen', () => {
        mockGetMultiplayerScorecard.mockReturnValue({ ...multiplayerData, round: { ...multiplayerData.round, CourseName: 'St Andrews' } });
        const { getByLabelText, getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('scorecard-course-name')).toBeTruthy();
        fireEvent.press(getByLabelText('Back'));

        expect(mockBack).toHaveBeenCalled();
    });

    describe('Round pager', () => {
        it('configures the pager with every round in history order', () => {
            jest.useFakeTimers();
            try {
                mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });
                const ids = getByTestId('scorecard-pager').props.data.map((r: { Id: number }) => r.Id);

                expect(ids).toEqual([3, 2, 1]);
            } finally {
                jest.useRealTimers();
            }
        });

        it('starts on the page for the roundId param', () => {
            jest.useFakeTimers();
            try {
                mockParams = { roundId: '2' };
                mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });

                // round 2 is at index 1 in the history list
                expect(getByTestId('scorecard-pager').props.initialScrollIndex).toBe(1);
            } finally {
                jest.useRealTimers();
            }
        });

        it('renders the active round as a page', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('scorecard-page-1')).toBeTruthy();
        });

        it('renders one bottom indicator dot per round', () => {
            jest.useFakeTimers();
            try {
                mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getAllByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });

                expect(getAllByTestId(/scorecard-indicator-/)).toHaveLength(3);
            } finally {
                jest.useRealTimers();
            }
        });

        // History is newest-first; the pager covers only the most recent 10 rounds.
        const fifteenRoundsNewestFirst = () =>
            Array.from({ length: 15 }, (_, i) => makeHistoryRound(15 - i));

        it('caps the pager to the 10 most recent rounds', () => {
            jest.useFakeTimers();
            try {
                mockParams = { roundId: '15' }; // newest, within the recent window
                mockGetAllRoundHistory.mockReturnValue(fifteenRoundsNewestFirst());
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });
                const ids = getByTestId('scorecard-pager').props.data.map((r: { Id: number }) => r.Id);

                expect(ids).toHaveLength(10);
                expect(ids[0]).toBe(15); // newest
                expect(ids[9]).toBe(6);  // 10th most recent
            } finally {
                jest.useRealTimers();
            }
        });

        it('renders at most 10 indicator dots', () => {
            jest.useFakeTimers();
            try {
                mockParams = { roundId: '15' };
                mockGetAllRoundHistory.mockReturnValue(fifteenRoundsNewestFirst());
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getAllByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });

                expect(getAllByTestId(/scorecard-indicator-/)).toHaveLength(10);
            } finally {
                jest.useRealTimers();
            }
        });

        it('opens an older round (beyond the recent 10) on its own with no dots', () => {
            jest.useFakeTimers();
            try {
                mockParams = { roundId: '1' }; // oldest, outside the recent window
                mockGetAllRoundHistory.mockReturnValue(fifteenRoundsNewestFirst());
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getByTestId, queryAllByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });

                expect(getByTestId('scorecard-page-1')).toBeTruthy();
                expect(getByTestId('scorecard-pager').props.data).toHaveLength(1);
                expect(queryAllByTestId(/scorecard-indicator-/)).toHaveLength(0);
            } finally {
                jest.useRealTimers();
            }
        });

        it('uses a red active dot and hollow (non-black-filled) inactive dots', () => {
            jest.useFakeTimers();
            try {
                const colours = require('../../../assets/colours').default;
                mockParams = { roundId: '1' };
                mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getByTestId } = render(<ScorecardScreen />);
                act(() => { jest.advanceTimersByTime(100); });
                // round '1' is at index 2 → the active dot
                const active = StyleSheet.flatten(getByTestId('scorecard-indicator-2').props.style);
                const inactive = StyleSheet.flatten(getByTestId('scorecard-indicator-0').props.style);

                expect(active.backgroundColor).toBe(colours.primary);
                expect(inactive.backgroundColor).not.toBe(colours.primary);
            } finally {
                jest.useRealTimers();
            }
        });

        it('locks horizontal swiping while editing and unlocks on cancel', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('scorecard-pager').props.scrollEnabled).toBe(true);

            fireEvent.press(within(getByTestId('scorecard-page-1')).getByTestId('edit-scorecard-button'));
            expect(getByTestId('scorecard-pager').props.scrollEnabled).toBe(false);

            fireEvent.press(within(getByTestId('scorecard-page-1')).getByTestId('edit-round-cancel-button'));
            expect(getByTestId('scorecard-pager').props.scrollEnabled).toBe(true);
        });

        it('shows score breakdown when round data exists', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetRoundScoreBreakdown.mockReturnValue({ putts: 36, threePutts: 2, penalties: 1 });

            const { getByTestId, getByText } = render(<ScorecardScreen />);

            expect(getByTestId('round-summary-card')).toBeTruthy();
            expect(getByText('Putts')).toBeTruthy();
            expect(getByText('36')).toBeTruthy();
            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Penalties')).toBeTruthy();
        });

        it('shows score breakdown with zeros when no deadly sins recorded', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetRoundScoreBreakdown.mockReturnValue({ putts: 36, threePutts: 0, penalties: 0 });

            const { getByTestId, getByText, getAllByText } = render(<ScorecardScreen />);

            expect(getByTestId('round-summary-card')).toBeTruthy();
            expect(getByText('36')).toBeTruthy();
            expect(getAllByText('0').length).toBeGreaterThanOrEqual(2);
        });

        describe('Score-only rounds', () => {
            it('shows the score sheet without putting or sins sections for score-only rounds', () => {
                const scoreOnlyData = {
                    ...multiplayerData,
                    round: { ...multiplayerData.round, IsScoreOnly: 1 },
                };
                mockGetMultiplayerScorecard.mockReturnValue(scoreOnlyData);

                const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

                fireEvent.press(getByTestId('edit-scorecard-button'));
                fireEvent.press(getByTestId('edit-round-hole-1'));

                expect(getByTestId('edit-hole-strokes-value')).toBeTruthy();
                expect(queryByTestId('edit-hole-sin-threePutts')).toBeNull();
            });

            it('does not call getHoleDeadlySinsService for score-only rounds', () => {
                const scoreOnlyData = {
                    ...multiplayerData,
                    round: { ...multiplayerData.round, IsScoreOnly: 1 },
                };
                mockGetMultiplayerScorecard.mockReturnValue(scoreOnlyData);

                const { getByTestId } = render(<ScorecardScreen />);
                fireEvent.press(getByTestId('edit-scorecard-button'));
                fireEvent.press(getByTestId('edit-round-hole-1'));

                expect(mockGetHoleDeadlySinsService).not.toHaveBeenCalled();
            });

            it('hides score breakdown for score-only rounds', () => {
                const scoreOnlyData = {
                    ...multiplayerData,
                    round: { ...multiplayerData.round, IsScoreOnly: 1 },
                };
                mockGetMultiplayerScorecard.mockReturnValue(scoreOnlyData);
                mockGetRoundScoreBreakdown.mockReturnValue({ putts: 36, threePutts: 0, penalties: 0 });

                const { queryByTestId } = render(<ScorecardScreen />);

                expect(queryByTestId('round-score-breakdown')).toBeNull();
            });
        });
    });

    describe('Sin details in edit mode', () => {
        const clubs = [
            { Id: 1, Club: 'Driver', CarryDistance: 220, TotalDistance: 230, SortOrder: 0 },
            { Id: 2, Club: '3 Wood', CarryDistance: 190, TotalDistance: 200, SortOrder: 1 },
        ];

        it('shows club picker when trouble off tee is toggled on', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(queryByTestId('club-picker-dropdown-toggle')).toBeNull();

            fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);

            expect(getByTestId('club-picker-dropdown-toggle')).toBeTruthy();
        });

        it('does not show detail picker when no detail sins are ticked', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(queryByTestId('club-picker-dropdown-toggle')).toBeNull();
            expect(queryByTestId('penalty-type-picker-dropdown-toggle')).toBeNull();
        });

        it('pre-fills existing details when hole with saved details is selected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);
            mockGetHoleSinDetails.mockReturnValue({
                troubleOffTeeClub: 'Driver',
                penaltyType: 'OB',
                bogeysInside9IronClub: '6 Iron',
                doubleChipsReason: 'Poor contact',
            });

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(mockGetHoleSinDetails).toHaveBeenCalledWith(1, 1);
        });

        it('blocks save when trouble off tee is ticked but no club selected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            // Validation blocks the save, so nothing is written
            expect(mockUpdateScorecard).not.toHaveBeenCalled();
        });

        it('does not block save when trouble off tee is ticked but no clubs configured', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue([]); // No clubs
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            // Should allow save when no clubs configured
            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledTimes(1);
            });
        });

        it('does not block save when penalties ticked and penalty type selected', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-penalties'), 'valueChange', true);
            fireEvent.press(getByTestId('penalty-type-picker-dropdown-toggle'));
            fireEvent.press(getByTestId('penalty-type-picker-option-Out of bounds'));
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledTimes(1);
            });
        });

        it('calls replaceHoleSinDetailsService with selected values on confirm save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);
            mockGetClubDistances.mockReturnValue(clubs);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);
            fireEvent.press(getByTestId('club-picker-dropdown-toggle'));
            fireEvent.press(getByTestId('club-picker-option-Driver'));
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockReplaceHoleSinDetails).toHaveBeenCalledWith(
                    1,
                    1,
                    expect.objectContaining({
                        troubleOffTeeClub: 'Driver',
                    })
                );
            });
        });

        it('calls deleteHoleSinDetailsService when detail sin is unticked before save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);
            mockGetClubDistances.mockReturnValue(clubs);
            mockGetHoleSinDetails.mockReturnValue({
                troubleOffTeeClub: 'Driver',
                penaltyType: null,
                bogeysInside9IronClub: null,
                doubleChipsReason: null,
            });

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            // Trouble off tee was previously saved but now untick it
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockDeleteHoleSinDetails).toHaveBeenCalledWith(1, 1);
            });
        });

        it('does not call sin detail services when no detail sins ticked', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);
            mockGetHoleSinDetails.mockReturnValue(null); // Ensure no prior details

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-threePutts'), 'valueChange', true); // Not a detail-needing sin
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalled();
            });
            expect(mockReplaceHoleSinDetails).not.toHaveBeenCalled();
            expect(mockDeleteHoleSinDetails).not.toHaveBeenCalled();
        });

        it('clears detail selections and error state when cancel edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);

            expect(getByTestId('club-picker-dropdown-toggle')).toBeTruthy();

            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-cancel-button'));

            expect(queryByTestId('club-picker-dropdown-toggle')).toBeNull();
        });

        it('does not show detail pickers for sins without follow-ups (three-putts)', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetClubDistances.mockReturnValue(clubs);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent(getByTestId('edit-hole-sin-threePutts'), 'valueChange', true);

            // No detail pickers should show for three-putts
            expect(queryByTestId('club-picker-dropdown-toggle')).toBeNull();
            expect(queryByTestId('penalty-type-picker-dropdown-toggle')).toBeNull();
        });
    });

    describe('Putting stats in edit mode', () => {
        it('shows putting inputs when hole is opened in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(getByTestId('first-putt-input')).toBeTruthy();
            expect(getByTestId('second-putt-input')).toBeTruthy();
        });

        it('pre-fills existing putting stats when hole is selected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetPuttingStats.mockReturnValue({
                Id: 1,
                RoundId: 1,
                HoleNumber: 1,
                FirstPuttDistance: 20,
                SecondPuttDistance: 5,
                SecondPuttIsLong: 0,
            });

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(mockGetPuttingStats).toHaveBeenCalledWith(1, 1);
        });

        it('does not show putting inputs for score-only rounds', () => {
            const scoreOnlyData = {
                ...multiplayerData,
                round: { ...multiplayerData.round, IsScoreOnly: 1 },
            };
            mockGetMultiplayerScorecard.mockReturnValue(scoreOnlyData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(queryByTestId('first-putt-input')).toBeNull();
        });

        it('saves putting stats on confirm save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));
            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalled();
            });
        });

        it('clears putting inputs when cancel edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetPuttingStats.mockReturnValue({
                Id: 1,
                RoundId: 1,
                HoleNumber: 1,
                FirstPuttDistance: 20,
                SecondPuttDistance: 5,
                SecondPuttIsLong: 0,
            });

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-hole-1'));

            expect(getByTestId('first-putt-input')).toBeTruthy();

            fireEvent.press(getByTestId('edit-hole-back-button'));
            fireEvent.press(getByTestId('edit-round-cancel-button'));

            expect(queryByTestId('first-putt-input')).toBeNull();
        });

        describe('green in regulation on scorecard edit', () => {
            const savedPuttingRow = {
                Id: 1,
                RoundId: 1,
                HoleNumber: 1,
                FirstPuttDistance: 20,
                SecondPuttDistance: 0,
                SecondPuttIsLong: 0,
                ThirdPuttDistance: undefined,
                ThirdPuttIsLong: undefined,
                GreenInRegulation: true,
            };

            beforeEach(() => {
                mockGetPuttingStats.mockReturnValue(savedPuttingRow);
            });

            afterEach(() => {
                mockGetPuttingStats.mockReturnValue(null);
            });

            it('shouldShowSavedGreenInRegulationWhenEditingHole', async () => {
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

                const { getByTestId } = render(<ScorecardScreen />);
                fireEvent.press(getByTestId('edit-scorecard-button'));
                fireEvent.press(getByTestId('edit-round-hole-1'));

                await waitFor(() => {
                    expect(getByTestId('edit-hole-gir-switch').props.value).toBe(true);
                });
            });

            it('shouldSaveGreenInRegulationWhenToggledOnScorecardEdit', async () => {
                mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
                mockUpdateScorecard.mockResolvedValue(true);

                const { getByTestId } = render(<ScorecardScreen />);
                fireEvent.press(getByTestId('edit-scorecard-button'));
                fireEvent.press(getByTestId('edit-round-hole-1'));
                await waitFor(() => expect(getByTestId('edit-hole-gir-switch').props.value).toBe(true));

                fireEvent(getByTestId('edit-hole-gir-switch'), 'valueChange', false);
                fireEvent.press(getByTestId('edit-hole-back-button'));
                fireEvent.press(getByTestId('edit-round-save-button'));

                await waitFor(() => {
                    expect(insertPuttingStatsService).toHaveBeenCalledWith(1, 1, 20, 0, false, undefined, undefined, false);
                });
            });
        });

        it('shows the edit round sheet with its Cancel and Save actions when editing', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(getByText('Edit round')).toBeTruthy();
            expect(getByTestId('edit-round-cancel-button')).toBeTruthy();
            expect(getByTestId('edit-round-save-button')).toBeTruthy();
        });
    });

    describe('editing the round date', () => {
        const playedOn = new Date(2026, 10, 3, 10);
        const dateRoundData = {
            ...multiplayerData,
            round: { ...multiplayerData.round, CourseName: 'Stats Flow Test Course', StartTime: playedOn.toISOString() },
        };

        it('shouldOpenTheDatePickerOnTheRoundDateWhenTheDateRowIsPressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(dateRoundData);
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-date'));

            expect(getByTestId('edit-round-date-picker')).toHaveProp('value', playedOn);
        });

        it('shouldNotAllowADateAfterTodayInThePicker', () => {
            mockGetMultiplayerScorecard.mockReturnValue(dateRoundData);
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-date'));
            const maximumDate: Date = getByTestId('edit-round-date-picker').props.maximumDate;

            expect(maximumDate.toDateString()).toBe(new Date().toDateString());
            expect(maximumDate.getHours()).toBe(23);
        });

        it('shouldShowThePickedDateInTheDateRowBeforeSaving', () => {
            mockGetMultiplayerScorecard.mockReturnValue(dateRoundData);
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-date'));
            fireEvent(getByTestId('edit-round-date-picker'), 'change', {}, new Date(2026, 10, 5, 10));

            expect(getByTestId('edit-round-date')).toHaveTextContent(/Thu 5 Nov 2026$/);
        });

        it('shouldSaveTheChangedRoundDateWhenSaveIsPressed', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(dateRoundData);
            mockUpdateScorecard.mockResolvedValue(true);
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-date'));
            fireEvent(getByTestId('edit-round-date-picker'), 'change', {}, new Date(2026, 10, 5, 10));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => {
                expect(mockUpdateRoundStartTime).toHaveBeenCalledWith(1, new Date(2026, 10, 5, 10));
            });
        });

        it('shouldNotChangeTheRoundDateWhenTheDateIsNotPicked', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(dateRoundData);
            mockUpdateScorecard.mockResolvedValue(true);
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-save-button'));

            await waitFor(() => expect(mockUpdateScorecard).toHaveBeenCalled());
            expect(mockUpdateRoundStartTime).not.toHaveBeenCalled();
        });

        it('shouldDiscardAPickedDateWhenEditIsCancelled', () => {
            mockGetMultiplayerScorecard.mockReturnValue(dateRoundData);
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('edit-round-date'));
            fireEvent(getByTestId('edit-round-date-picker'), 'change', {}, new Date(2026, 10, 5, 10));
            fireEvent.press(getByTestId('edit-round-cancel-button'));
            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(getByTestId('edit-round-date')).toHaveTextContent(/Tue 3 Nov 2026$/);
            expect(mockUpdateRoundStartTime).not.toHaveBeenCalled();
        });
    });
});
