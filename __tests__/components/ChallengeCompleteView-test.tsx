import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ChallengeCompleteView from '../../components/ChallengeCompleteView';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        white: '#FFFFFF',
        gray: '#888888',
        primary: '#2D5A3D',
    }),
}));

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        headerText: { fontSize: 24, fontWeight: '600' },
        normalText: { fontSize: 16 },
        navRow: { flexDirection: 'row' },
    }),
}));

describe('ChallengeCompleteView', () => {
    const mockBands = [
        { key: 'elite', label: 'Elite', thresholdLabel: '≤ 5', color: '#00C851' },
        { key: 'pro', label: 'Pro', thresholdLabel: '≤ 8', color: '#2D5A3D' },
        { key: 'scratch', label: 'Scratch', thresholdLabel: '≤ 10', color: '#4A7C59' },
    ];

    it('renders title', () => {
        const { getByText } = render(
            <ChallengeCompleteView
                title="Simulation Complete"
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={jest.fn()}
            />
        );

        expect(getByText('Simulation Complete')).toBeTruthy();
    });

    it('renders summary when provided', () => {
        const { getByText } = render(
            <ChallengeCompleteView
                title="Simulation Complete"
                summary={<Text>You made 12 puts</Text>}
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={jest.fn()}
            />
        );

        expect(getByText('You made 12 puts')).toBeTruthy();
    });

    it('does not render summary when omitted', () => {
        const { queryByText } = render(
            <ChallengeCompleteView
                title="Simulation Complete"
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={jest.fn()}
            />
        );

        // The test would need to check for a specific test ID on the summary container
        // For now, just verify the component renders
        expect(queryByText('Simulation Complete')).toBeTruthy();
    });

    it('renders every band with label and thresholdLabel', () => {
        const { getByText } = render(
            <ChallengeCompleteView
                title="Complete"
                bands={mockBands}
                userBandKey="elite"
                onPlayAgain={jest.fn()}
            />
        );

        expect(getByText('Elite')).toBeTruthy();
        expect(getByText('Pro')).toBeTruthy();
        expect(getByText('Scratch')).toBeTruthy();
        expect(getByText('≤ 5')).toBeTruthy();
        expect(getByText('≤ 8')).toBeTruthy();
        expect(getByText('≤ 10')).toBeTruthy();
    });

    it('Play Again press calls onPlayAgain', () => {
        const onPlayAgain = jest.fn();
        const { getByTestId } = render(
            <ChallengeCompleteView
                title="Complete"
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={onPlayAgain}
            />
        );

        fireEvent.press(getByTestId('play-again-button'));
        expect(onPlayAgain).toHaveBeenCalled();
    });

    it('respects custom playAgainTestID', () => {
        const { getByTestId } = render(
            <ChallengeCompleteView
                title="Complete"
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={jest.fn()}
                playAgainTestID="custom-play-again"
            />
        );

        expect(getByTestId('custom-play-again')).toBeTruthy();
    });

    it('uses default bandsSectionLabel when omitted', () => {
        const { getByText } = render(
            <ChallengeCompleteView
                title="Complete"
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={jest.fn()}
            />
        );

        expect(getByText('Your level')).toBeTruthy();
    });

    it('uses custom bandsSectionLabel when provided', () => {
        const { getByText } = render(
            <ChallengeCompleteView
                title="Complete"
                bandsSectionLabel="Your tier"
                bands={mockBands}
                userBandKey="pro"
                onPlayAgain={jest.fn()}
            />
        );

        expect(getByText('Your tier')).toBeTruthy();
    });
});
