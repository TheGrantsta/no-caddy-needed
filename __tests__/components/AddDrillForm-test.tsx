import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import AddDrillForm from '../../components/AddDrillForm';
import { insertDrillService } from '@/service/DbService';

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
    insertDrillService: jest.fn(),
}));

const mockShowSuccess = jest.fn();
jest.mock('@/hooks/useAppToast', () => ({
    useAppToast: () => ({
        showSuccess: mockShowSuccess,
        showError: jest.fn(),
        showResult: jest.fn(),
    }),
}));

const mockInsertDrillService = insertDrillService as jest.Mock;

const defaultProps = {
    category: 'putting',
    onSaved: jest.fn(),
    onCancel: jest.fn(),
};

const fillAllSteps = (getByTestId: (id: string) => any) => {
    const values = ['My Drill', '8/10', 'Improve accuracy', 'Place markers', 'Hit 10 balls'];
    for (let i = 0; i < 4; i++) {
        fireEvent.changeText(getByTestId('drill-wizard-input'), values[i]);
        fireEvent.press(getByTestId('drill-wizard-next'));
    }
    fireEvent.changeText(getByTestId('drill-wizard-input'), values[4]);
};

describe('AddDrillForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('showsFirstStepQuestionOnRender', () => {
        const { getByText } = render(<AddDrillForm {...defaultProps} />);
        expect(getByText('What do you want to call this test?')).toBeTruthy();
    });

    it('showsFiveProgressDots', () => {
        const { getAllByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getAllByTestId('drill-wizard-dot').length).toBe(5);
    });

    it('doesNotShowBackButtonOnFirstStep', () => {
        const { queryByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(queryByTestId('drill-wizard-back')).toBeNull();
    });

    it('showsCancelButtonOnFirstStep', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('drill-wizard-cancel')).toBeTruthy();
    });

    it('showsNextButtonLabel', () => {
        const { getByText } = render(<AddDrillForm {...defaultProps} />);
        expect(getByText('Next')).toBeTruthy();
    });

    it('callsOnCancelWhenCancelPressed', () => {
        const mockOnCancel = jest.fn();
        const { getByTestId } = render(<AddDrillForm {...defaultProps} onCancel={mockOnCancel} />);
        fireEvent.press(getByTestId('drill-wizard-cancel'));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('doesNotAdvanceWhenFieldEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.press(getByTestId('drill-wizard-next'));
        expect(getByText('What do you want to call this test?')).toBeTruthy();
    });

    it('disablesNextButtonWhenFieldIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.press(getByTestId('drill-wizard-next'));
        // Should still be on the same question since button was disabled
        expect(getByText('What do you want to call this test?')).toBeTruthy();
    });

    it('enablesNextButtonWhenFieldIsPopulated', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('drill-wizard-input'), 'My Drill');
        fireEvent.press(getByTestId('drill-wizard-next'));
        // Should advance to next question
        expect(getByText('What is the aim?')).toBeTruthy();
    });

    it('advancesToNextStepWhenNextPressed', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('drill-wizard-input'), 'My Drill');
        fireEvent.press(getByTestId('drill-wizard-next'));
        expect(getByText('What is the aim?')).toBeTruthy();
    });

    it('showsBackButtonFromSecondStep', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('drill-wizard-input'), 'My Drill');
        fireEvent.press(getByTestId('drill-wizard-next'));
        expect(getByTestId('drill-wizard-back')).toBeTruthy();
    });

    it('doesNotShowCancelButtonFromSecondStep', () => {
        const { getByTestId, queryByTestId } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('drill-wizard-input'), 'My Drill');
        fireEvent.press(getByTestId('drill-wizard-next'));
        expect(queryByTestId('drill-wizard-cancel')).toBeNull();
    });

    it('goesBackToPreviousStepOnBackPress', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('drill-wizard-input'), 'My Drill');
        fireEvent.press(getByTestId('drill-wizard-next'));
        fireEvent.press(getByTestId('drill-wizard-back'));
        expect(getByText('What do you want to call this test?')).toBeTruthy();
    });

    it('preservesEnteredValueWhenGoingBack', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('drill-wizard-input'), 'My Drill');
        fireEvent.press(getByTestId('drill-wizard-next'));
        fireEvent.press(getByTestId('drill-wizard-back'));
        expect(getByTestId('drill-wizard-input').props.value).toBe('My Drill');
    });

    it('showsSaveButtonOnLastStep', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        const values = ['My Drill', '8/10', 'Improve accuracy', 'Place markers'];
        for (const val of values) {
            fireEvent.changeText(getByTestId('drill-wizard-input'), val);
            fireEvent.press(getByTestId('drill-wizard-next'));
        }
        expect(getByText('Save')).toBeTruthy();
    });

    it('doesNotCallServiceWhenFieldEmpty', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.press(getByTestId('drill-wizard-next'));
        expect(mockInsertDrillService).not.toHaveBeenCalled();
    });

    it('callsInsertDrillServiceOnFinalSave', async () => {
        mockInsertDrillService.mockResolvedValue(true);
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('drill-wizard-next'));
        });
        expect(mockInsertDrillService).toHaveBeenCalledWith(
            'putting', 'My Drill', 'handyman', '8/10', 'Improve accuracy', 'Place markers', 'Hit 10 balls'
        );
    });

    it('showsDrillSavedToastOnSuccess', async () => {
        mockInsertDrillService.mockResolvedValue(true);
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('drill-wizard-next'));
        });
        expect(mockShowSuccess).toHaveBeenCalledWith('Test saved');
    });

    it('callsOnSavedAfterSuccessfulSave', async () => {
        mockInsertDrillService.mockResolvedValue(true);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddDrillForm {...defaultProps} onSaved={mockOnSaved} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('drill-wizard-next'));
        });
        expect(mockOnSaved).toHaveBeenCalledTimes(1);
    });

    it('showsSaveErrorWhenInsertFails', async () => {
        mockInsertDrillService.mockResolvedValue(false);
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('drill-wizard-next'));
        });
        expect(getByText('Failed to save drill')).toBeTruthy();
    });

    it('doesNotCallOnSavedWhenInsertFails', async () => {
        mockInsertDrillService.mockResolvedValue(false);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddDrillForm {...defaultProps} onSaved={mockOnSaved} />);
        fillAllSteps(getByTestId);
        await act(async () => {
            fireEvent.press(getByTestId('drill-wizard-next'));
        });
        expect(mockOnSaved).not.toHaveBeenCalled();
    });
});
