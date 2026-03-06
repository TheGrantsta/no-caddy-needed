import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import AddGameForm from '../../components/AddGameForm';
import { insertGameService } from '@/service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('@/service/DbService', () => ({
    insertGameService: jest.fn(),
}));

const mockShowSuccess = jest.fn();
jest.mock('@/hooks/useAppToast', () => ({
    useAppToast: () => ({
        showSuccess: mockShowSuccess,
        showError: jest.fn(),
        showResult: jest.fn(),
    }),
}));

const mockInsertGameService = insertGameService as jest.Mock;

const defaultProps = {
    category: 'putting',
    onSaved: jest.fn(),
    onCancel: jest.fn(),
};

const fillForm = (getByTestId: (id: string) => any) => {
    fireEvent.changeText(getByTestId('add-game-header'), 'My Game');
    fireEvent.changeText(getByTestId('add-game-objective'), 'Improve accuracy');
    fireEvent.changeText(getByTestId('add-game-setup'), 'Place markers');
    fireEvent.changeText(getByTestId('add-game-how-to-play'), 'Hit 10 balls');
};

describe('AddGameForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rendersHeaderInput', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-header')).toBeTruthy();
    });

    it('rendersObjectiveInput', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-objective')).toBeTruthy();
    });

    it('rendersSetUpInput', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-setup')).toBeTruthy();
    });

    it('rendersHowToPlayInput', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-how-to-play')).toBeTruthy();
    });

    it('rendersSaveButton', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-save')).toBeTruthy();
    });

    it('rendersCancelButton', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-cancel')).toBeTruthy();
    });

    it('callsOnCancelWhenCancelPressed', () => {
        const mockOnCancel = jest.fn();
        const { getByTestId } = render(<AddGameForm {...defaultProps} onCancel={mockOnCancel} />);
        fireEvent.press(getByTestId('add-game-cancel'));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('objectiveInputIsMultiline', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-objective').props.multiline).toBe(true);
    });

    it('setupInputIsMultiline', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-setup').props.multiline).toBe(true);
    });

    it('howToPlayInputIsMultiline', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('add-game-how-to-play').props.multiline).toBe(true);
    });

    it('showsErrorWhenHeaderIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-game-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-game-setup'), 'Setup');
        fireEvent.changeText(getByTestId('add-game-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-game-save'));
        expect(getByText('Name is required')).toBeTruthy();
    });

    it('showsErrorWhenObjectiveIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-game-header'), 'My Game');
        fireEvent.changeText(getByTestId('add-game-setup'), 'Setup');
        fireEvent.changeText(getByTestId('add-game-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-game-save'));
        expect(getByText('Objective is required')).toBeTruthy();
    });

    it('showsErrorWhenSetUpIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-game-header'), 'My Game');
        fireEvent.changeText(getByTestId('add-game-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-game-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-game-save'));
        expect(getByText('Set up is required')).toBeTruthy();
    });

    it('showsErrorWhenHowToPlayIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-game-header'), 'My Game');
        fireEvent.changeText(getByTestId('add-game-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-game-setup'), 'Setup');
        fireEvent.press(getByTestId('add-game-save'));
        expect(getByText('How to play is required')).toBeTruthy();
    });

    it('doesNotCallServiceWhenFieldsAreEmpty', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        fireEvent.press(getByTestId('add-game-save'));
        expect(mockInsertGameService).not.toHaveBeenCalled();
    });

    it('callsInsertGameServiceWithAllFieldsOnSubmit', async () => {
        mockInsertGameService.mockResolvedValue(true);
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-game-save'));
        });

        expect(mockInsertGameService).toHaveBeenCalledWith(
            'putting', 'My Game', 'Improve accuracy', 'Place markers', 'Hit 10 balls'
        );
    });

    it('showsGameSavedToastOnSuccess', async () => {
        mockInsertGameService.mockResolvedValue(true);
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-game-save'));
        });

        expect(mockShowSuccess).toHaveBeenCalledWith('Game saved');
    });

    it('callsOnSavedAfterSuccessfulSubmit', async () => {
        mockInsertGameService.mockResolvedValue(true);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddGameForm {...defaultProps} onSaved={mockOnSaved} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-game-save'));
        });

        expect(mockOnSaved).toHaveBeenCalledTimes(1);
    });

    it('showsErrorWhenInsertFails', async () => {
        mockInsertGameService.mockResolvedValue(false);
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-game-save'));
        });

        expect(getByText('Failed to save game')).toBeTruthy();
    });

    it('doesNotCallOnSavedWhenInsertFails', async () => {
        mockInsertGameService.mockResolvedValue(false);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddGameForm {...defaultProps} onSaved={mockOnSaved} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-game-save'));
        });

        expect(mockOnSaved).not.toHaveBeenCalled();
    });
});
