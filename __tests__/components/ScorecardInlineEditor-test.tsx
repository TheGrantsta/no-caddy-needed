import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScorecardInlineEditor from '../../components/ScorecardInlineEditor';

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

jest.mock('../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
        showError: jest.fn(),
    }),
}));

jest.mock('../../service/DbService', () => ({
    updateScorecardService: jest.fn().mockResolvedValue(true),
    replaceHoleDeadlySinsService: jest.fn().mockResolvedValue(true),
    replaceHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    deleteHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    insertPuttingStatsService: jest.fn().mockResolvedValue(true),
    getHoleDeadlySinsService: jest.fn().mockReturnValue(null),
    getHoleSinDetailsService: jest.fn().mockReturnValue(null),
    getPuttingStatsService: jest.fn().mockReturnValue(null),
    getClubDistancesService: jest.fn().mockReturnValue([]),
}));

const mockScorecardData = {
    round: { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
    players: [
        { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
    ],
    holeScores: [
        { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
        { Id: 2, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 4 },
    ],
};

describe('ScorecardInlineEditor', () => {
    const mockOnDone = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows scorecard grid with selectable scores', () => {
        const { getByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={mockOnDone}
                onCancel={mockOnCancel}
            />
        );

        expect(getByTestId('inline-editor-scorecard')).toBeTruthy();
        expect(getByTestId('score-cell-1-1')).toBeTruthy();
    });

    it('shows score editor when a score is selected', async () => {
        const { getByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={mockOnDone}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            expect(getByTestId('inline-editor-score-editor')).toBeTruthy();
        });
    });

    it('shows Save and Cancel buttons during editing', async () => {
        const { getByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={mockOnDone}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            expect(getByTestId('save-scorecard-button')).toBeTruthy();
            expect(getByTestId('cancel-edit-button')).toBeTruthy();
        });
    });

    it('calls onCancel when cancel button pressed', async () => {
        const { getByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={mockOnDone}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            expect(getByTestId('cancel-edit-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('cancel-edit-button'));

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('saves score changes and calls onDone when save button pressed', async () => {
        const { getByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={mockOnDone}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            expect(getByTestId('save-scorecard-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('save-scorecard-button'));

        await waitFor(() => {
            expect(getByTestId('confirm-save-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('confirm-save-button'));

        await waitFor(() => {
            expect(mockOnDone).toHaveBeenCalled();
        });
    });
});
