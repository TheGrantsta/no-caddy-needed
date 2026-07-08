import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Drill from '../../components/Drill';

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

describe('Drill component', () => {
    const defaultProps = {
        label: 'Test Drill',
        iconName: 'golf-course' as const,
        target: '5 out of 10',
        objective: 'Test objective',
        setUp: 'Test setup',
        howToPlay: 'Test how to play',
        saveDrillResult: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the drill label', () => {
        const { getByText } = render(<Drill {...defaultProps} />);

        expect(getByText('Test Drill')).toBeTruthy();
    });

    it('renders the target as placeholder', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);

        const scoreInput = getByTestId('test-score-input');
        expect(scoreInput.props.placeholder).toBe('Aim: 5 out of 10');
    });

    it('renders the Save button', () => {
        const { getByText } = render(<Drill {...defaultProps} />);

        expect(getByText('Save')).toBeTruthy();
    });

    it('renders score input', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);

        expect(getByTestId('test-score-input')).toBeTruthy();
    });

    it('disablesSaveButtonWhenScoreIsEmpty', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const saveButton = getByTestId('save-drill-result-button');
        fireEvent.press(saveButton);

        expect(mockSave).not.toHaveBeenCalled();
    });

    it('disablesSaveButtonWhenScoreIsZero', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const scoreInput = getByTestId('test-score-input');
        const saveButton = getByTestId('save-drill-result-button');

        fireEvent.changeText(scoreInput, '0');
        fireEvent.press(saveButton);

        expect(mockSave).not.toHaveBeenCalled();
    });

    it('enablesSaveButtonWhenScoreIsValid', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const scoreInput = getByTestId('test-score-input');
        const saveButton = getByTestId('save-drill-result-button');

        fireEvent.changeText(scoreInput, '5');
        fireEvent.press(saveButton);

        expect(mockSave).toHaveBeenCalledWith('Test Drill', 5);
    });

    it('doesNotCallSaveDrillResultWhenScoreIsEmpty', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const saveButton = getByTestId('save-drill-result-button');
        fireEvent.press(saveButton);

        expect(mockSave).not.toHaveBeenCalled();
    });

    it('onlyAllowsNumericCharactersInScoreInput', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const scoreInput = getByTestId('test-score-input');

        // Try to enter non-numeric characters
        fireEvent.changeText(scoreInput, '9a');
        expect(scoreInput.props.value).toBe('9');

        fireEvent.changeText(scoreInput, 'a9');
        expect(scoreInput.props.value).toBe('9');

        fireEvent.changeText(scoreInput, '5@3');
        expect(scoreInput.props.value).toBe('53');

        fireEvent.changeText(scoreInput, 'abc');
        expect(scoreInput.props.value).toBe('');
    });

    it('calls saveDrillResult with entered score when Save button is pressed', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const scoreInput = getByTestId('test-score-input');
        const saveButton = getByTestId('save-drill-result-button');

        fireEvent.changeText(scoreInput, '7');
        fireEvent.press(saveButton);

        expect(mockSave).toHaveBeenCalledWith('Test Drill', expect.any(Number));
    });

    it('renders Instructions component with correct props', () => {
        const { getByText } = render(<Drill {...defaultProps} />);

        expect(getByText('Objective:')).toBeTruthy();
        expect(getByText(/Test objective/)).toBeTruthy();
        expect(getByText('Setup:')).toBeTruthy();
        expect(getByText(/Test setup/)).toBeTruthy();
        expect(getByText('How to play:')).toBeTruthy();
        expect(getByText(/Test how to play/)).toBeTruthy();
    });

    it('rendersDeleteButton', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);
        expect(getByTestId('delete-drill-button')).toBeTruthy();
    });

    it('doesNotCallOnDeleteWhenDeleteButtonFirstPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('showsConfirmationButtonsAfterDeletePressed', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        expect(getByTestId('confirm-drill-delete')).toBeTruthy();
        expect(getByTestId('cancel-drill-delete')).toBeTruthy();
    });

    it('hidesDeleteButtonAfterDeletePressed', () => {
        const { getByTestId, queryByTestId } = render(<Drill {...defaultProps} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        expect(queryByTestId('delete-drill-button')).toBeNull();
    });

    it('callsOnDeleteWhenConfirmPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        fireEvent.press(getByTestId('confirm-drill-delete'));
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('doesNotCallOnDeleteWhenCancelPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        fireEvent.press(getByTestId('cancel-drill-delete'));
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('hidesConfirmationButtonsAfterCancelPressed', () => {
        const { getByTestId, queryByTestId } = render(<Drill {...defaultProps} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        fireEvent.press(getByTestId('cancel-drill-delete'));
        expect(queryByTestId('confirm-drill-delete')).toBeNull();
        expect(queryByTestId('cancel-drill-delete')).toBeNull();
    });

    it('showsDeleteButtonAfterCancelPressed', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        fireEvent.press(getByTestId('cancel-drill-delete'));
        expect(getByTestId('delete-drill-button')).toBeTruthy();
    });

    it('showsDeleteButtonAfterConfirmPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        fireEvent.press(getByTestId('confirm-drill-delete'));
        expect(getByTestId('delete-drill-button')).toBeTruthy();
    });

    it('doesNotThrowIfOnDeleteNotProvided', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);
        fireEvent.press(getByTestId('delete-drill-button'));
        expect(() => fireEvent.press(getByTestId('confirm-drill-delete'))).not.toThrow();
    });
});
