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

const fillAllSteps = (getByTestId: (id: string) => any) => {
    const values = ['My Game', 'Improve accuracy', 'Place markers', 'Hit 10 balls'];
    for (let i = 0; i < 3; i++) {
        fireEvent.changeText(getByTestId('game-wizard-input'), values[i]);
        fireEvent.press(getByTestId('game-wizard-next'));
    }
    fireEvent.changeText(getByTestId('game-wizard-input'), values[3]);
};

describe('AddGameForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('showsFirstStepQuestionOnRender', () => {
        const { getByText } = render(<AddGameForm {...defaultProps} />);
        expect(getByText('What do you want to call this game?')).toBeTruthy();
    });

    it('showsFourProgressDots', () => {
        const { getAllByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getAllByTestId('game-wizard-dot').length).toBe(4);
    });

    it('doesNotShowBackButtonOnFirstStep', () => {
        const { queryByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(queryByTestId('game-wizard-back')).toBeNull();
    });

    it('showsCancelButtonOnFirstStep', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        expect(getByTestId('game-wizard-cancel')).toBeTruthy();
    });

    it('showsNextButtonLabel', () => {
        const { getByText } = render(<AddGameForm {...defaultProps} />);
        expect(getByText('Next')).toBeTruthy();
    });

    it('callsOnCancelWhenCancelPressed', () => {
        const mockOnCancel = jest.fn();
        const { getByTestId } = render(<AddGameForm {...defaultProps} onCancel={mockOnCancel} />);
        fireEvent.press(getByTestId('game-wizard-cancel'));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('doesNotAdvanceWhenFieldEmpty', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.press(getByTestId('game-wizard-next'));
        expect(getByText('What do you want to call this game?')).toBeTruthy();
    });

    it('showsErrorWhenNextPressedWithEmptyField', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.press(getByTestId('game-wizard-next'));
        expect(getByText('This field is required')).toBeTruthy();
    });

    it('clearsErrorWhenFieldChanged', () => {
        const { getByTestId, queryByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.press(getByTestId('game-wizard-next'));
        fireEvent.changeText(getByTestId('game-wizard-input'), 'My Game');
        expect(queryByText('This field is required')).toBeNull();
    });

    it('advancesToNextStepWhenNextPressed', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('game-wizard-input'), 'My Game');
        fireEvent.press(getByTestId('game-wizard-next'));
        expect(getByText('What is the objective?')).toBeTruthy();
    });

    it('showsBackButtonFromSecondStep', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('game-wizard-input'), 'My Game');
        fireEvent.press(getByTestId('game-wizard-next'));
        expect(getByTestId('game-wizard-back')).toBeTruthy();
    });

    it('doesNotShowCancelButtonFromSecondStep', () => {
        const { getByTestId, queryByTestId } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('game-wizard-input'), 'My Game');
        fireEvent.press(getByTestId('game-wizard-next'));
        expect(queryByTestId('game-wizard-cancel')).toBeNull();
    });

    it('goesBackToPreviousStepOnBackPress', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('game-wizard-input'), 'My Game');
        fireEvent.press(getByTestId('game-wizard-next'));
        fireEvent.press(getByTestId('game-wizard-back'));
        expect(getByText('What do you want to call this game?')).toBeTruthy();
    });

    it('preservesEnteredValueWhenGoingBack', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('game-wizard-input'), 'My Game');
        fireEvent.press(getByTestId('game-wizard-next'));
        fireEvent.press(getByTestId('game-wizard-back'));
        expect(getByTestId('game-wizard-input').props.value).toBe('My Game');
    });

    it('showsSaveButtonOnLastStep', () => {
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        const values = ['My Game', 'Improve accuracy', 'Place markers'];
        for (const val of values) {
            fireEvent.changeText(getByTestId('game-wizard-input'), val);
            fireEvent.press(getByTestId('game-wizard-next'));
        }
        expect(getByText('Save')).toBeTruthy();
    });

    it('doesNotCallServiceWhenFieldEmpty', () => {
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        fireEvent.press(getByTestId('game-wizard-next'));
        expect(mockInsertGameService).not.toHaveBeenCalled();
    });

    it('callsInsertGameServiceOnFinalSave', async () => {
        mockInsertGameService.mockResolvedValue(true);
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('game-wizard-next'));
        });
        expect(mockInsertGameService).toHaveBeenCalledWith(
            'putting', 'My Game', 'Improve accuracy', 'Place markers', 'Hit 10 balls'
        );
    });

    it('showsGameSavedToastOnSuccess', async () => {
        mockInsertGameService.mockResolvedValue(true);
        const { getByTestId } = render(<AddGameForm {...defaultProps} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('game-wizard-next'));
        });
        expect(mockShowSuccess).toHaveBeenCalledWith('Game saved');
    });

    it('callsOnSavedAfterSuccessfulSave', async () => {
        mockInsertGameService.mockResolvedValue(true);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddGameForm {...defaultProps} onSaved={mockOnSaved} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('game-wizard-next'));
        });
        expect(mockOnSaved).toHaveBeenCalledTimes(1);
    });

    it('showsSaveErrorWhenInsertFails', async () => {
        mockInsertGameService.mockResolvedValue(false);
        const { getByTestId, getByText } = render(<AddGameForm {...defaultProps} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('game-wizard-next'));
        });
        expect(getByText('Failed to save game')).toBeTruthy();
    });

    it('doesNotCallOnSavedWhenInsertFails', async () => {
        mockInsertGameService.mockResolvedValue(false);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddGameForm {...defaultProps} onSaved={mockOnSaved} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('game-wizard-next'));
        });
        expect(mockOnSaved).not.toHaveBeenCalled();
    });
});
