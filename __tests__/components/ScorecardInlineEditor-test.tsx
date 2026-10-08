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
    getHolesWithSinsForRoundService: jest.fn().mockReturnValue(new Set()),
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

    it('shows select score prompt before a score is chosen', () => {
        const { getByText } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        expect(getByText('Select the score to be amended')).toBeTruthy();
    });

    it('hides select score prompt once a score is chosen', async () => {
        const { getByTestId, queryByText } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            expect(queryByText('Select the score to be amended')).toBeNull();
        });
    });

    it('never shows edit button or delete round link', () => {
        const { queryByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        expect(queryByTestId('edit-scorecard-button')).toBeNull();
        expect(queryByTestId('delete-round-button')).toBeNull();
    });

    it('calls getHolesWithSinsForRoundService on mount', () => {
        const { getHolesWithSinsForRoundService } = require('../../service/DbService');

        render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        expect(getHolesWithSinsForRoundService).toHaveBeenCalledWith(1);
    });

    it('does not load sins for non-user player', async () => {
        const { getByTestId, queryByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        // Select non-user player (Alice)
        fireEvent.press(getByTestId('score-cell-1-2'));

        await waitFor(() => {
            // Sin edit panel should not appear for non-user player
            expect(queryByTestId('sin-edit-panel')).toBeNull();
        });
    });

    it('allows adding sins on hole with none by defaulting to INITIAL_SINS', async () => {
        const { getByTestId, queryByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        // Select user player score on hole with no sins
        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            // Sin panel should exist with defaulted values even though getHoleDeadlySinsService returns null
            expect(queryByTestId('sin-edit-panel')).toBeTruthy();
        });
    });

    it('hides par change buttons in post-round editor', async () => {
        const { getByTestId, queryByTestId } = render(
            <ScorecardInlineEditor
                roundId={1}
                scorecardData={mockScorecardData}
                onDone={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        fireEvent.press(getByTestId('score-cell-1-1'));

        await waitFor(() => {
            // Par change buttons should not exist in inline editor
            expect(queryByTestId('score-editor-par-3')).toBeNull();
            expect(queryByTestId('score-editor-par-4')).toBeNull();
            expect(queryByTestId('score-editor-par-5')).toBeNull();
        });
    });
});
