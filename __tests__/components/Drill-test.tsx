import React from 'react';
import { StyleSheet } from 'react-native';
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
        isActive: true,
        onToggleActive: jest.fn(),
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

    it('renders Active label when isActive is true', () => {
        const { getByText } = render(<Drill {...defaultProps} isActive={true} />);

        expect(getByText('Active:')).toBeTruthy();
    });

    it('rendersActiveToggleSwitch', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={true} />);

        expect(getByTestId('drill-active-toggle')).toBeTruthy();
    });

    it('activeToggleReflectsIsActiveProp', () => {
        const { getByText } = render(<Drill {...defaultProps} isActive={false} />);

        expect(getByText('Inactive:')).toBeTruthy();
    });

    it('callsOnToggleActiveWhenSwitchValueChanges', () => {
        const mockToggle = jest.fn();
        const { getByTestId } = render(<Drill {...defaultProps} isActive={true} onToggleActive={mockToggle} />);

        fireEvent.press(getByTestId('drill-active-toggle'));

        expect(mockToggle).toHaveBeenCalledWith(false);
    });

    it('saveButtonAppearsDisabledWhenInactive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={false} />);

        const saveButton = getByTestId('save-drill-result-button');
        const flatStyle = StyleSheet.flatten(saveButton.props.style);
        expect(flatStyle.opacity).toBe(0.4);
    });

    it('metToggleAppearsDisabledWhenInactive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={false} />);

        const metToggle = getByTestId('drill-met-toggle');
        const flatStyle = StyleSheet.flatten(metToggle.props.style);
        expect(flatStyle.opacity).toBe(0.4);
    });

    it('saveButtonAppearsEnabledWhenActive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={true} />);

        const saveButton = getByTestId('save-drill-result-button');
        const flatStyle = StyleSheet.flatten(saveButton.props.style);
        expect(flatStyle.opacity).not.toBe(0.4);
    });

    it('saveButtonIsDisabledWhenDrillIsInactive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={false} />);

        expect(getByTestId('save-drill-result-button').props.accessibilityState?.disabled).toBe(true);
    });

    it('metToggleIsDisabledWhenDrillIsInactive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={false} />);

        expect(getByTestId('drill-met-toggle').props.accessibilityState?.disabled).toBe(true);
    });

    it('saveButtonIsEnabledWhenDrillIsActive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={true} />);

        expect(getByTestId('save-drill-result-button').props.accessibilityState?.disabled).toBeFalsy();
    });

    it('metToggleIsEnabledWhenDrillIsActive', () => {
        const { getByTestId } = render(<Drill {...defaultProps} isActive={true} />);

        expect(getByTestId('drill-met-toggle').props.accessibilityState?.disabled).toBeFalsy();
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
