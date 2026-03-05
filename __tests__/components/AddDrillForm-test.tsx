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

const fillForm = (getByTestId: (id: string) => any) => {
    fireEvent.changeText(getByTestId('add-drill-label'), 'My Drill');
    fireEvent.changeText(getByTestId('add-drill-target'), '8/10');
    fireEvent.changeText(getByTestId('add-drill-objective'), 'Improve accuracy');
    fireEvent.changeText(getByTestId('add-drill-setup'), 'Place markers');
    fireEvent.changeText(getByTestId('add-drill-how-to-play'), 'Hit 10 balls');
};

describe('AddDrillForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rendersLabelInput', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-label')).toBeTruthy();
    });

    it('rendersNameLabelText', () => {
        const { getByText } = render(<AddDrillForm {...defaultProps} />);
        expect(getByText('Name')).toBeTruthy();
    });

    it('rendersTargetInput', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-target')).toBeTruthy();
    });

    it('rendersObjectiveInput', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-objective')).toBeTruthy();
    });

    it('rendersSetUpInput', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-setup')).toBeTruthy();
    });

    it('rendersHowToPlayInput', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-how-to-play')).toBeTruthy();
    });

    it('rendersSaveButton', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-save')).toBeTruthy();
    });

    it('rendersCancelButton', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-cancel')).toBeTruthy();
    });

    it('callsOnCancelWhenCancelPressed', () => {
        const mockOnCancel = jest.fn();
        const { getByTestId } = render(<AddDrillForm {...defaultProps} onCancel={mockOnCancel} />);
        fireEvent.press(getByTestId('add-drill-cancel'));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('objectiveInputIsMultiline', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-objective').props.multiline).toBe(true);
    });

    it('setupInputIsMultiline', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-setup').props.multiline).toBe(true);
    });

    it('howToPlayInputIsMultiline', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-how-to-play').props.multiline).toBe(true);
    });

    it('objectiveHasCharacterLimit', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-objective').props.maxLength).toBeTruthy();
    });

    it('setupHasCharacterLimit', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-setup').props.maxLength).toBeTruthy();
    });

    it('howToPlayHasCharacterLimit', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        expect(getByTestId('add-drill-how-to-play').props.maxLength).toBeTruthy();
    });

    it('showsErrorWhenLabelIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-drill-target'), '8/10');
        fireEvent.changeText(getByTestId('add-drill-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-drill-setup'), 'Setup');
        fireEvent.changeText(getByTestId('add-drill-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-drill-save'));
        expect(getByText('Name is required')).toBeTruthy();
    });

    it('showsErrorWhenTargetIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-drill-label'), 'My Drill');
        fireEvent.changeText(getByTestId('add-drill-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-drill-setup'), 'Setup');
        fireEvent.changeText(getByTestId('add-drill-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-drill-save'));
        expect(getByText('Target is required')).toBeTruthy();
    });

    it('showsErrorWhenObjectiveIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-drill-label'), 'My Drill');
        fireEvent.changeText(getByTestId('add-drill-target'), '8/10');
        fireEvent.changeText(getByTestId('add-drill-setup'), 'Setup');
        fireEvent.changeText(getByTestId('add-drill-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-drill-save'));
        expect(getByText('Objective is required')).toBeTruthy();
    });

    it('showsErrorWhenSetUpIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-drill-label'), 'My Drill');
        fireEvent.changeText(getByTestId('add-drill-target'), '8/10');
        fireEvent.changeText(getByTestId('add-drill-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-drill-how-to-play'), 'Play');
        fireEvent.press(getByTestId('add-drill-save'));
        expect(getByText('Set up is required')).toBeTruthy();
    });

    it('showsErrorWhenHowToPlayIsEmpty', () => {
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.changeText(getByTestId('add-drill-label'), 'My Drill');
        fireEvent.changeText(getByTestId('add-drill-target'), '8/10');
        fireEvent.changeText(getByTestId('add-drill-objective'), 'Obj');
        fireEvent.changeText(getByTestId('add-drill-setup'), 'Setup');
        fireEvent.press(getByTestId('add-drill-save'));
        expect(getByText('How to play is required')).toBeTruthy();
    });

    it('doesNotCallServiceWhenFieldsAreEmpty', () => {
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);
        fireEvent.press(getByTestId('add-drill-save'));
        expect(mockInsertDrillService).not.toHaveBeenCalled();
    });

    it('callsInsertDrillServiceWithAllFieldsOnSubmit', async () => {
        mockInsertDrillService.mockResolvedValue(true);
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-drill-save'));
        });

        expect(mockInsertDrillService).toHaveBeenCalledWith(
            'putting', 'My Drill', 'sports-golf', '8/10', 'Improve accuracy', 'Place markers', 'Hit 10 balls'
        );
    });

    it('showsDrillSavedToastOnSuccess', async () => {
        mockInsertDrillService.mockResolvedValue(true);
        const { getByTestId } = render(<AddDrillForm {...defaultProps} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-drill-save'));
        });

        expect(mockShowSuccess).toHaveBeenCalledWith('Drill saved');
    });

    it('callsOnSavedAfterSuccessfulSubmit', async () => {
        mockInsertDrillService.mockResolvedValue(true);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddDrillForm {...defaultProps} onSaved={mockOnSaved} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-drill-save'));
        });

        expect(mockOnSaved).toHaveBeenCalledTimes(1);
    });

    it('showsErrorWhenInsertFails', async () => {
        mockInsertDrillService.mockResolvedValue(false);
        const { getByTestId, getByText } = render(<AddDrillForm {...defaultProps} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-drill-save'));
        });

        expect(getByText('Failed to save drill')).toBeTruthy();
    });

    it('doesNotCallOnSavedWhenInsertFails', async () => {
        mockInsertDrillService.mockResolvedValue(false);
        const mockOnSaved = jest.fn();
        const { getByTestId } = render(<AddDrillForm {...defaultProps} onSaved={mockOnSaved} />);

        fillForm(getByTestId);

        await act(async () => {
            fireEvent.press(getByTestId('add-drill-save'));
        });

        expect(mockOnSaved).not.toHaveBeenCalled();
    });
});
