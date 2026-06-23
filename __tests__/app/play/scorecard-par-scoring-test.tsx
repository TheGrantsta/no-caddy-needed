import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScorecardScreen from '../../../app/play/scorecard';
import {
    getRoundScorecardService,
    getMultiplayerScorecardService,
    updateScorecardService,
    deleteRoundService,
    getHoleDeadlySinsService,
    replaceHoleDeadlySinsService,
    getHolesWithSinsForRoundService,
    loadCourseNotesService,
} from '../../../service/DbService';
import { checkPremiumEntitlement } from '../../../service/SubscriptionService';

jest.mock('../../../service/SubscriptionService', () => ({
    checkPremiumEntitlement: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {
        get expoConfig() {
            return { extra: { analyseRoundEnabled: false } };
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

jest.mock('../../../service/DbService', () => ({
    getRoundScorecardService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    updateScorecardService: jest.fn(),
    deleteRoundService: jest.fn(),
    getHoleDeadlySinsService: jest.fn(),
    replaceHoleDeadlySinsService: jest.fn().mockResolvedValue(true),
    getHolesWithSinsForRoundService: jest.fn(),
    loadCourseNotesService: jest.fn().mockReturnValue({}),
    getAllRoundHistoryService: jest.fn(() => [{ Id: 42, TotalScore: 0, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: 'Test Course', Created_At: '' }]),
}));

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ roundId: '42' }),
    useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({ show: jest.fn() }),
}));

const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockGetHoleDeadlySinsService = getHoleDeadlySinsService as jest.Mock;
const mockGetHolesWithSinsForRoundService = getHolesWithSinsForRoundService as jest.Mock;
const mockUpdateScorecard = updateScorecardService as jest.Mock;

const parLayout: Record<number, number> = { 7: 3, 9: 5, 10: 3, 13: 5, 14: 3 };
const getHolePar = (hole: number): number => parLayout[hole] ?? 4;

// hole n → Id: 100 + (n-1), e.g. hole 7 → Id 106, hole 9 → Id 108
const holeScores = Array.from({ length: 18 }, (_, i) => ({
    Id: 100 + i,
    RoundId: 42,
    RoundPlayerId: 1,
    HoleNumber: i + 1,
    HolePar: getHolePar(i + 1),
    Score: getHolePar(i + 1),
}));

const singlePlayerData = {
    round: { Id: 42, TotalScore: 0, IsCompleted: 1, StartTime: '', EndTime: '', CourseName: 'Test Course', Created_At: '' },
    players: [{ Id: 1, RoundId: 42, PlayerName: 'You', IsUser: 1, SortOrder: 0 }],
    holeScores,
};

describe('Scorecard par scoring', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetMultiplayerScorecard.mockReturnValue(singlePlayerData);
        mockGetHolesWithSinsForRoundService.mockReturnValue(new Set());
        mockGetHoleDeadlySinsService.mockReturnValue(null);
        mockUpdateScorecard.mockResolvedValue(true);
    });

    describe('Par value display', () => {
        it('shouldDisplayParThreeForHoleSeven', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('hole-par-7')).toHaveTextContent('3');
        });

        it('shouldDisplayParThreeForHoleTen', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('hole-par-10')).toHaveTextContent('3');
        });

        it('shouldDisplayParThreeForHoleFourteen', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('hole-par-14')).toHaveTextContent('3');
        });

        it('shouldDisplayParFiveForHoleNine', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('hole-par-9')).toHaveTextContent('5');
        });

        it('shouldDisplayParFiveForHoleThirteen', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('hole-par-13')).toHaveTextContent('5');
        });

        it('shouldDisplayParFourForStandardHoles', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('hole-par-1')).toHaveTextContent('4');
            expect(getByTestId('hole-par-6')).toHaveTextContent('4');
            expect(getByTestId('hole-par-18')).toHaveTextContent('4');
        });

        it('shouldDisplayCorrectFrontNineParTotal', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('front9-par-total')).toHaveTextContent('36');
        });

        it('shouldDisplayCorrectBackNineParTotal', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            expect(getByTestId('back9-par-total')).toHaveTextContent('35');
        });
    });

    describe('Score input on par 3 holes', () => {
        it('shouldSaveIncrementedScoreOnParThreeHole', async () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-7-1'));
            fireEvent.press(getByTestId('score-editor-increment'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(42, [{ id: 106, score: 4 }], []);
            });
        });

        it('shouldSaveDecrementedScoreOnParThreeHole', async () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-7-1'));
            fireEvent.press(getByTestId('score-editor-decrement'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(42, [{ id: 106, score: 2 }], []);
            });
        });

        it('shouldShowBogeyRelativeScoreAfterScoringOverParOnParThreeHole', () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-7-1'));
            fireEvent.press(getByTestId('score-editor-increment'));

            expect(getByTestId('player-total-1')).toHaveTextContent('(+1)');
        });

        it('shouldShowBirdieRelativeScoreAfterScoringUnderParOnParThreeHole', () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-7-1'));
            fireEvent.press(getByTestId('score-editor-decrement'));

            expect(getByTestId('player-total-1')).toHaveTextContent('(-1)');
        });
    });

    describe('Score input on par 5 holes', () => {
        it('shouldSaveIncrementedScoreOnParFiveHole', async () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-9-1'));
            fireEvent.press(getByTestId('score-editor-increment'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(42, [{ id: 108, score: 6 }], []);
            });
        });

        it('shouldSaveDecrementedScoreOnParFiveHole', async () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-9-1'));
            fireEvent.press(getByTestId('score-editor-decrement'));
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(42, [{ id: 108, score: 4 }], []);
            });
        });

        it('shouldShowBirdieRelativeScoreAfterScoringUnderParOnParFiveHole', () => {
            const { getByTestId } = render(<ScorecardScreen />);

            fireEvent.press(getByTestId('edit-scorecard-button'));
            fireEvent.press(getByTestId('score-cell-9-1'));
            fireEvent.press(getByTestId('score-editor-decrement'));

            expect(getByTestId('player-total-1')).toHaveTextContent('(-1)');
        });
    });

    describe('Scoring bogeys on all par 3 and par 5 holes', () => {
        const enterBogeyOnAllSpecialHoles = (getByTestId: ReturnType<typeof render>['getByTestId']) => {
            fireEvent.press(getByTestId('edit-scorecard-button'));
            for (const hole of [7, 9, 10, 13, 14]) {
                fireEvent.press(getByTestId(`score-cell-${hole}-1`));
                fireEvent.press(getByTestId('score-editor-increment'));
            }
        };

        it('shouldShowGross76WhenBogeyOnAllPar3AndPar5Holes', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            enterBogeyOnAllSpecialHoles(getByTestId);
            expect(getByTestId('round-player-1-total')).toHaveTextContent('76');
        });

        it('shouldShowPlusFiveWhenBogeyOnAllPar3AndPar5Holes', () => {
            const { getByTestId } = render(<ScorecardScreen />);
            enterBogeyOnAllSpecialHoles(getByTestId);
            expect(getByTestId('player-total-1')).toHaveTextContent('(+5)');
        });

        it('shouldSaveAllBogeyChangesWhenBogeyOnAllPar3AndPar5Holes', async () => {
            const { getByTestId } = render(<ScorecardScreen />);
            enterBogeyOnAllSpecialHoles(getByTestId);
            fireEvent.press(getByTestId('save-scorecard-button'));
            fireEvent.press(getByTestId('confirm-save-button'));

            await waitFor(() => {
                expect(mockUpdateScorecard).toHaveBeenCalledWith(42, [
                    { id: 106, score: 4 },
                    { id: 108, score: 6 },
                    { id: 109, score: 4 },
                    { id: 112, score: 6 },
                    { id: 113, score: 4 },
                ], []);
            });
        });
    });
});
