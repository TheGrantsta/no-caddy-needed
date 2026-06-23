import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import ScorecardScreen from '../../../app/play/scorecard';
import { getRoundScorecardService, getMultiplayerScorecardService, updateScorecardService, deleteRoundService, getHoleDeadlySinsService, replaceHoleDeadlySinsService, getHolesWithSinsForRoundService, loadCourseNotesService, getAllRoundHistoryService } from '../../../service/DbService';
import { checkPremiumEntitlement } from '../../../service/SubscriptionService';

jest.mock('../../../service/SubscriptionService', () => ({
    checkPremiumEntitlement: jest.fn().mockResolvedValue(true),
}));

const mockExtraConfig = { analyseRoundEnabled: true };
jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {
        get expoConfig() {
            return { extra: mockExtraConfig };
        },
    },
}));

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

const mockShow = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('../../../service/DbService', () => ({
    getRoundScorecardService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    updateScorecardService: jest.fn(),
    deleteRoundService: jest.fn(),
    getHoleDeadlySinsService: jest.fn(),
    replaceHoleDeadlySinsService: jest.fn().mockResolvedValue(true),
    getHolesWithSinsForRoundService: jest.fn(),
    loadCourseNotesService: jest.fn().mockReturnValue({}),
    getAllRoundHistoryService: jest.fn(),
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

const mockCheckPremiumEntitlement = checkPremiumEntitlement as jest.Mock;
const mockGetRoundScorecard = getRoundScorecardService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockUpdateScorecard = updateScorecardService as jest.Mock;
const mockDeleteRound = deleteRoundService as jest.Mock;
const mockGetHoleDeadlySinsService = getHoleDeadlySinsService as jest.Mock;
const mockReplaceHoleDeadlySinsService = replaceHoleDeadlySinsService as jest.Mock;
const mockGetHolesWithSinsForRoundService = getHolesWithSinsForRoundService as jest.Mock;
const mockLoadCourseNotes = loadCourseNotesService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;

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

    it('shows date in brackets after course name on multiplayer scorecard', () => {
        const data = {
            ...multiplayerData,
            round: { ...multiplayerData.round, CourseName: 'St Andrews', Created_At: '26/02' },
        };
        mockGetMultiplayerScorecard.mockReturnValue(data);

        const { getByText } = render(<ScorecardScreen />);

        expect(getByText('St Andrews (26/02)')).toBeTruthy();
    });

    it('shows date in brackets after course name on legacy scorecard', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: 'Pebble Beach', Created_At: '15/06' },
            holes: [{ Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 }],
        });

        const { getByText } = render(<ScorecardScreen />);

        expect(getByText('Pebble Beach (15/06)')).toBeTruthy();
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

    it('renders multiplayer scorecard when multiplayer data exists', () => {
        mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

        const { getByTestId } = render(<ScorecardScreen />);

        expect(getByTestId('player-total-1')).toBeTruthy();
        expect(getByTestId('player-total-2')).toBeTruthy();
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

            expect(getByTestId('save-scorecard-button')).toBeTruthy();
            expect(getByTestId('cancel-edit-button')).toBeTruthy();
            expect(queryByTestId('edit-scorecard-button')).toBeNull();
        });

        it('shows score editor when cell selected in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, getByText } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));

            expect(getByText('#1 - You')).toBeTruthy();
            expect(getByTestId('score-editor-value')).toHaveTextContent('5');
        });

        it('increments selected score', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-increment'));

            expect(getByTestId('score-editor-value')).toHaveTextContent('6');
            expect(getByTestId('hole-1-player-1-score')).toHaveTextContent('6');
        });

        it('decrements selected score', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-decrement'));

            expect(getByTestId('score-editor-value')).toHaveTextContent('4');
            expect(getByTestId('hole-1-player-1-score')).toHaveTextContent('4');
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
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-decrement'));

            expect(getByTestId('score-editor-value')).toHaveTextContent('1');
        });

        it('shows save confirmation when save pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('save-scorecard-button'));

            expect(getByTestId('confirm-save-button')).toBeTruthy();
            expect(getByTestId('cancel-save-button')).toBeTruthy();
        });

        it('calls update service on confirm save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-increment'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(1, [{ id: 10, score: 6 }], []);
            });
        });

        it('shows success toast after save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalledWith('Scorecard updated', expect.objectContaining({ type: 'success' }));
            });
        });

        it('shows error toast when save fails', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(false);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockShow).toHaveBeenCalledWith('Failed to update scorecard', expect.objectContaining({ type: 'danger' }));
            });
        });

        it('exits edit mode after successful save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(queryByTestId('save-scorecard-button')).toBeNull();
                expect(getByTestId('edit-scorecard-button')).toBeTruthy();
            });
        });

        it('discards changes when cancel edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-increment'));
            fireEvent.press(getByTestId('cancel-edit-button'));

            expect(queryByTestId('save-scorecard-button')).toBeNull();
            expect(getByTestId('edit-scorecard-button')).toBeTruthy();
            expect(getByTestId('hole-1-player-1-score')).toHaveTextContent('5');
        });

        it('hides save confirm when cancel save pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('save-scorecard-button'));

            expect(getByTestId('confirm-save-button')).toBeTruthy();

            fireEvent.press(getByTestId('cancel-save-button'));

            expect(queryByTestId('confirm-save-button')).toBeNull();
        });

        it('shows 7 deadly sins tally when hole is selected in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();
        });

        it('calls getHoleDeadlySinsService with correct roundId and holeNumber when hole selected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));

            expect(mockGetHoleDeadlySinsService).toHaveBeenCalledWith(1, 1);
        });

        it('saves sins for selected hole on confirm save', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockReplaceHoleDeadlySinsService).toHaveBeenCalledWith(
                    1,
                    1,
                    expect.objectContaining({ threePutts: false, doubleBogeys: false })
                );
            });
        });

        it('does not save sins when no hole selected during edit', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalled();
            });
            expect(mockReplaceHoleDeadlySinsService).not.toHaveBeenCalled();
        });

        it('does not show 7 deadly sins tally when non-primary player score selected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-2')); // Alice (IsUser: 0)

            expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
        });

        it('does not save sins when non-primary player score is selected during edit', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-2')); // Alice (IsUser: 0)
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalled();
            });
            expect(mockReplaceHoleDeadlySinsService).not.toHaveBeenCalled();
        });

        it('updates 7 deadly sins display when switching to a different hole', () => {
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
            fireEvent.press(getByTestId('score-cell-1-1'));

            expect(getByTestId('7deadly-sins-indicator-three-putts')).toHaveTextContent('✗');

            fireEvent.press(getByTestId('score-cell-2-1'));

            // Unselected sins render an empty outline (no cross).
            expect(getByTestId('7deadly-sins-indicator-three-putts')).not.toHaveTextContent('✗');
        });

        it('clears sins editor when cancel edit pressed', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();

            fireEvent.press(getByTestId('cancel-edit-button'));

            expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
        });
    });

    describe('Sin indicator dots', () => {
        it('shows sin indicator dot for holes with sins recorded', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetHolesWithSinsForRoundService.mockReturnValue(new Set([1]));

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('sin-indicator-1')).toBeTruthy();
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
            expect(getByTestId('cancel-delete-button')).toBeTruthy();
        });

        it('hides delete button when showing confirmation', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));

            expect(queryByTestId('delete-round-button')).toBeNull();
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

            fireEvent.press(getByTestId('cancel-delete-button'));

            expect(queryByTestId('confirm-delete-button')).toBeNull();
            expect(getByTestId('delete-round-button')).toBeTruthy();
        });
    });

    describe('Par editing', () => {
        it('showsParButtonsInScoreEditorWhenScoreCellSelected', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));

            expect(getByTestId('score-editor-par-3')).toBeTruthy();
            expect(getByTestId('score-editor-par-4')).toBeTruthy();
            expect(getByTestId('score-editor-par-5')).toBeTruthy();
        });

        it('callsUpdateScorecardServiceWithParChangesOnConfirmSave', async () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockUpdateScorecard.mockResolvedValue(true);

            const { getByTestId } = render(<ScorecardScreen />);
            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-par-3'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

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
            fireEvent.press(getByTestId('score-cell-1-1'));
            fireEvent.press(getByTestId('score-editor-par-4')); // unchanged par
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(1, [], []);
            });
        });
    });

    describe('Analyse round button', () => {
        it('renders analyse button for multiplayer scorecard', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('analyse-round-button')).toBeTruthy();
        });

        it('does not render analyse button for legacy scorecard', () => {
            mockGetMultiplayerScorecard.mockReturnValue(null);
            mockGetRoundScorecard.mockReturnValue({
                round: { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
                holes: [{ Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 3 }],
            });

            const { queryByTestId } = render(<ScorecardScreen />);

            expect(queryByTestId('analyse-round-button')).toBeNull();
        });

        it('does not render analyse button in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(queryByTestId('analyse-round-button')).toBeNull();
        });

        it('does not render analyse button when delete confirmation is shown', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('delete-round-button'));

            expect(queryByTestId('analyse-round-button')).toBeNull();
        });

        it('navigates to round-analysis when already subscribed', async () => {
            mockCheckPremiumEntitlement.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('analyse-round-button'));

            await waitFor(() => expect(mockPush).toHaveBeenCalledWith({
                pathname: '/play/round-analysis',
                params: { roundId: '1' },
            }));
        });

        it('navigates to premium-paywall when not subscribed', async () => {
            mockCheckPremiumEntitlement.mockResolvedValue(false);
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('analyse-round-button'));

            await waitFor(() => expect(mockPush).toHaveBeenCalledWith({
                pathname: '/play/premium-paywall',
                params: { roundId: '1' },
            }));
        });

        it('does not render analyse button when feature flag is disabled', () => {
            mockExtraConfig.analyseRoundEnabled = false;
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { queryByTestId } = render(<ScorecardScreen />);

            expect(queryByTestId('analyse-round-button')).toBeNull();

            mockExtraConfig.analyseRoundEnabled = true;
        });
    });

    describe('Deadly sin dot', () => {
        it('shows the actual sin name as a danger-styled toast when tapped', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetHolesWithSinsForRoundService.mockReturnValue(new Set([1]));
            mockGetHoleDeadlySinsService.mockReturnValue({
                threePutts: true, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false,
                doubleChips: false, troubleOffTee: false, penalties: false,
            });

            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('sin-cell-1-1'));

            expect(mockShow).toHaveBeenCalledWith(
                expect.stringMatching(/3-putt/i),
                expect.objectContaining({ type: 'danger' })
            );
        });
    });

    describe('Action button hierarchy', () => {
        const colours = require('../../../assets/colours').default;

        it('renders Analyse as the primary (green) action', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            const style = StyleSheet.flatten(getByTestId('analyse-round-button').props.style);

            expect(style.backgroundColor).toBe(colours.primary);
        });

        it('renders Edit as a secondary outlined button when Analyse is shown', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            const style = StyleSheet.flatten(getByTestId('edit-scorecard-button').props.style);

            expect(style.backgroundColor).not.toBe(colours.primary);
            expect(style.borderWidth).toBeGreaterThan(0);
        });

        it('renders Delete as a quiet link, not a filled red block', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            const style = StyleSheet.flatten(getByTestId('delete-round-button').props.style);

            expect(style.backgroundColor).not.toBe(colours.red);
        });

        it('makes Edit the primary action when Analyse is disabled', () => {
            mockExtraConfig.analyseRoundEnabled = false;
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            const style = StyleSheet.flatten(getByTestId('edit-scorecard-button').props.style);

            expect(style.backgroundColor).toBe(colours.primary);

            mockExtraConfig.analyseRoundEnabled = true;
        });
    });

    describe('Round pager', () => {
        it('configures the pager with every round in history order', () => {
            mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            const ids = getByTestId('scorecard-pager').props.data.map((r: { Id: number }) => r.Id);

            expect(ids).toEqual([3, 2, 1]);
        });

        it('starts on the page for the roundId param', () => {
            mockParams = { roundId: '2' };
            mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            // round 2 is at index 1 in the history list
            expect(getByTestId('scorecard-pager').props.initialScrollIndex).toBe(1);
        });

        it('renders the active round as a page', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('scorecard-page-1')).toBeTruthy();
        });

        it('renders one bottom indicator dot per round', () => {
            mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getAllByTestId } = render(<ScorecardScreen />);

            expect(getAllByTestId(/scorecard-indicator-/)).toHaveLength(3);
        });

        // History is newest-first; the pager covers only the most recent 10 rounds.
        const fifteenRoundsNewestFirst = () =>
            Array.from({ length: 15 }, (_, i) => makeHistoryRound(15 - i));

        it('caps the pager to the 10 most recent rounds', () => {
            mockParams = { roundId: '15' }; // newest, within the recent window
            mockGetAllRoundHistory.mockReturnValue(fifteenRoundsNewestFirst());
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            const ids = getByTestId('scorecard-pager').props.data.map((r: { Id: number }) => r.Id);

            expect(ids).toHaveLength(10);
            expect(ids[0]).toBe(15); // newest
            expect(ids[9]).toBe(6);  // 10th most recent
        });

        it('renders at most 10 indicator dots', () => {
            mockParams = { roundId: '15' };
            mockGetAllRoundHistory.mockReturnValue(fifteenRoundsNewestFirst());
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getAllByTestId } = render(<ScorecardScreen />);

            expect(getAllByTestId(/scorecard-indicator-/)).toHaveLength(10);
        });

        it('opens an older round (beyond the recent 10) on its own with no dots', () => {
            mockParams = { roundId: '1' }; // oldest, outside the recent window
            mockGetAllRoundHistory.mockReturnValue(fifteenRoundsNewestFirst());
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId, queryAllByTestId } = render(<ScorecardScreen />);

            expect(getByTestId('scorecard-page-1')).toBeTruthy();
            expect(getByTestId('scorecard-pager').props.data).toHaveLength(1);
            expect(queryAllByTestId(/scorecard-indicator-/)).toHaveLength(0);
        });

        it('uses a red active dot and hollow (non-black-filled) inactive dots', () => {
            const colours = require('../../../assets/colours').default;
            mockParams = { roundId: '1' };
            mockGetAllRoundHistory.mockReturnValue([makeHistoryRound(3), makeHistoryRound(2), makeHistoryRound(1)]);
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            // round '1' is at index 2 → the active dot
            const active = StyleSheet.flatten(getByTestId('scorecard-indicator-2').props.style);
            const inactive = StyleSheet.flatten(getByTestId('scorecard-indicator-0').props.style);

            expect(active.backgroundColor).toBe(colours.red);
            expect(inactive.backgroundColor).not.toBe(colours.black);
        });

        it('locks horizontal swiping while editing and unlocks on cancel', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);

            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('scorecard-pager').props.scrollEnabled).toBe(true);

            fireEvent.press(within(getByTestId('scorecard-page-1')).getByTestId('edit-scorecard-button'));
            expect(getByTestId('scorecard-pager').props.scrollEnabled).toBe(false);

            fireEvent.press(within(getByTestId('scorecard-page-1')).getByTestId('cancel-edit-button'));
            expect(getByTestId('scorecard-pager').props.scrollEnabled).toBe(true);
        });
    });
});
