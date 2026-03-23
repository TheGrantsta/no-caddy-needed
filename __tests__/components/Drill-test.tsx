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

    it('renders the target', () => {
        const { getByText } = render(<Drill {...defaultProps} />);

        expect(getByText('Target:')).toBeTruthy();
        expect(getByText(/5 out of 10/)).toBeTruthy();
    });

    it('renders the Save button', () => {
        const { getByText } = render(<Drill {...defaultProps} />);

        expect(getByText('Save')).toBeTruthy();
    });

    it('renders toggle in Met state by default', () => {
        const { getByText } = render(<Drill {...defaultProps} />);

        expect(getByText('Met')).toBeTruthy();
    });

    it('shows checkmark when toggle is in Met state', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);

        expect(getByTestId('drill-met-toggle')).toHaveTextContent('✓');
    });

    it('shows circle when toggle is in Not Met state', () => {
        const { getByTestId } = render(<Drill {...defaultProps} />);

        fireEvent.press(getByTestId('drill-met-toggle'));

        expect(getByTestId('drill-met-toggle')).toHaveTextContent('○');
    });

    it('calls saveDrillResult with label and true when Save is pressed with Met (default)', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const saveButton = getByTestId('save-drill-result-button');
        fireEvent.press(saveButton);

        expect(mockSave).toHaveBeenCalledWith('Test Drill', true);
    });

    it('calls saveDrillResult when Save button is pressed', () => {
        const mockSave = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} saveDrillResult={mockSave} />);

        const saveButton = getByTestId('save-drill-result-button');
        fireEvent.press(saveButton);

        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith('Test Drill', expect.any(Boolean));
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
