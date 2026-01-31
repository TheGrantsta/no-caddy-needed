import React from 'react';
import { render } from '@testing-library/react-native';
import ScorecardScreen from '../../../app/play/scorecard';
import { getRoundScorecardService, getMultiplayerScorecardService } from '../../../service/DbService';

jest.mock('../../../service/DbService', () => ({
    getRoundScorecardService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
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

const mockGetRoundScorecard = getRoundScorecardService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;

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
        mockGetMultiplayerScorecard.mockReturnValue({
            round: { Id: 1, CoursePar: 72, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '' },
            players: [
                { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
                { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
            ],
            holeScores: [
                { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
                { Id: 2, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 3 },
            ],
        });

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
});
