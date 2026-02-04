import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScorecardScreen from '../../../app/play/scorecard';
import { getRoundScorecardService, getMultiplayerScorecardService, updateScorecardService, getTiger5ForRoundService } from '../../../service/DbService';

const mockShow = jest.fn();

jest.mock('../../../service/DbService', () => ({
    getRoundScorecardService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    updateScorecardService: jest.fn(),
    getTiger5ForRoundService: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ roundId: '1' }),
    useRouter: () => ({
        back: jest.fn(),
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
const mockGetTiger5ForRound = getTiger5ForRoundService as jest.Mock;

const multiplayerData = {
    round: { Id: 1, CoursePar: 72, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
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
        mockGetMultiplayerScorecard.mockReturnValue(null);
    });

    it('renders scorecard heading', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, CoursePar: 72, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
            holes: [
                { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 1 },
                { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: 0 },
                { Id: 3, RoundId: 1, HoleNumber: 3, ScoreRelativeToPar: 2 },
            ],
        });

        const { getByText } = render(<ScorecardScreen />);

        expect(getByText('Scorecard')).toBeTruthy();
    });

    it('renders RoundScorecard component with correct props', () => {
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, CoursePar: 72, TotalScore: 5, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
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

        const { getByText, getByTestId } = render(<ScorecardScreen />);

        expect(getByText('Scorecard')).toBeTruthy();
        expect(getByTestId('player-total-1')).toBeTruthy();
        expect(getByTestId('player-total-2')).toBeTruthy();
    });

    it('falls back to legacy scorecard when no multiplayer data', () => {
        mockGetMultiplayerScorecard.mockReturnValue(null);
        mockGetRoundScorecard.mockReturnValue({
            round: { Id: 1, CoursePar: 72, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
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
                round: { Id: 1, CoursePar: 72, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
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

            expect(getByText('Hole 1 - You')).toBeTruthy();
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
                expect(mockUpdateScorecard).toHaveBeenCalledWith(1, [{ id: 10, score: 6 }]);
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
                expect(mockShow).toHaveBeenCalledWith('Scorecard updated', { type: 'success' });
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
                expect(mockShow).toHaveBeenCalledWith('Failed to update scorecard', { type: 'danger' });
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
    });

    describe('Tiger 5 chart', () => {
        it('shows tiger 5 chart when tiger 5 data exists for the round', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetTiger5ForRound.mockReturnValue({
                Id: 1, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, Total: 4, Created_At: '15/06',
            });

            const { getByText } = render(<ScorecardScreen />);

            expect(getByText('Tiger 5')).toBeTruthy();
        });

        it('does not show tiger 5 chart when no tiger 5 data for the round', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetTiger5ForRound.mockReturnValue(null);

            const { queryByText } = render(<ScorecardScreen />);

            expect(queryByText('Tiger 5')).toBeNull();
        });

        it('does not show tiger 5 chart in edit mode', () => {
            mockGetMultiplayerScorecard.mockReturnValue(multiplayerData);
            mockGetTiger5ForRound.mockReturnValue({
                Id: 1, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, Total: 4, Created_At: '15/06',
            });

            const { getByTestId, queryByText } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));

            expect(queryByText('Tiger 5')).toBeNull();
        });
    });
});
