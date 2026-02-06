import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingOverlay from '../../components/OnboardingOverlay';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('OnboardingOverlay', () => {
    const mockOnDismiss = jest.fn();
    const defaultProps = {
        visible: true,
        onDismiss: mockOnDismiss,
        title: 'Welcome',
        steps: [
            { text: 'Step 1 description' },
            { text: 'Step 2 description' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when not visible', () => {
        const { queryByTestId } = render(
            <OnboardingOverlay {...defaultProps} visible={false} />
        );

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('renders overlay when visible', () => {
        const { getByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('renders title', () => {
        const { getByText } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        expect(getByText('Welcome')).toBeTruthy();
    });

    it('renders first step initially', () => {
        const { getByText } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        expect(getByText('Step 1 description')).toBeTruthy();
    });

    it('shows Next button on first step', () => {
        const { getByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        expect(getByTestId('next-button')).toBeTruthy();
    });

    it('advances to next step when Next is pressed', () => {
        const { getByTestId, getByText } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        fireEvent.press(getByTestId('next-button'));

        expect(getByText('Step 2 description')).toBeTruthy();
    });

    it('shows Done button on last step', () => {
        const { getByTestId, getByText } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        fireEvent.press(getByTestId('next-button'));

        expect(getByText('Done')).toBeTruthy();
    });

    it('calls onDismiss when Done is pressed on last step', () => {
        const { getByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        fireEvent.press(getByTestId('next-button'));
        fireEvent.press(getByTestId('done-button'));

        expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('shows Skip button when not on last step', () => {
        const { getByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        expect(getByTestId('skip-button')).toBeTruthy();
    });

    it('calls onDismiss when Skip is pressed', () => {
        const { getByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        fireEvent.press(getByTestId('skip-button'));

        expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('renders step indicators', () => {
        const { getAllByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        const indicators = getAllByTestId(/step-indicator-/);
        expect(indicators).toHaveLength(2);
    });

    it('shows Back button on second step', () => {
        const { getByTestId } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        fireEvent.press(getByTestId('next-button'));

        expect(getByTestId('back-button')).toBeTruthy();
    });

    it('goes back to previous step when Back is pressed', () => {
        const { getByTestId, getByText } = render(
            <OnboardingOverlay {...defaultProps} />
        );

        fireEvent.press(getByTestId('next-button'));
        fireEvent.press(getByTestId('back-button'));

        expect(getByText('Step 1 description')).toBeTruthy();
    });

    it('renders single step without navigation', () => {
        const { getByText, getByTestId, queryByTestId } = render(
            <OnboardingOverlay
                visible={true}
                onDismiss={mockOnDismiss}
                title="Single Step"
                steps={[{ text: 'Only step' }]}
            />
        );

        expect(getByText('Only step')).toBeTruthy();
        expect(getByTestId('done-button')).toBeTruthy();
        expect(queryByTestId('next-button')).toBeNull();
        expect(queryByTestId('skip-button')).toBeNull();
    });
});
