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
    useStyles: () => require('../../assets/stlyes').default,
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
});
