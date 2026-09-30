import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChallengeNavButtons from '../../components/ChallengeNavButtons';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        white: '#FFFFFF',
    }),
}));

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        navRow: { flexDirection: 'row' },
        playScreen: {
            previousHoleButton: { borderWidth: 2 },
            nextHoleButton: { backgroundColor: '#2D5A3D' },
        },
        buttonText: { fontSize: 16 },
    }),
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: ({ name, size, color, testID }: any) => null,
}));

describe('ChallengeNavButtons', () => {
    it('Previous press calls onPrevious', () => {
        const onPrevious = jest.fn();
        const { getByTestId } = render(
            <ChallengeNavButtons
                onPrevious={onPrevious}
                onNext={jest.fn()}
                previousDisabled={false}
                isLastStep={false}
            />
        );

        fireEvent.press(getByTestId('previous-button'));
        expect(onPrevious).toHaveBeenCalled();
    });

    it('Next press calls onNext', () => {
        const onNext = jest.fn();
        const { getByTestId } = render(
            <ChallengeNavButtons
                onPrevious={jest.fn()}
                onNext={onNext}
                previousDisabled={false}
                isLastStep={false}
            />
        );

        fireEvent.press(getByTestId('next-button'));
        expect(onNext).toHaveBeenCalled();
    });

    it('Previous does not call onPrevious when previousDisabled is true', () => {
        const onPrevious = jest.fn();
        const { getByTestId } = render(
            <ChallengeNavButtons
                onPrevious={onPrevious}
                onNext={jest.fn()}
                previousDisabled={true}
                isLastStep={false}
            />
        );

        fireEvent.press(getByTestId('previous-button'));
        expect(onPrevious).not.toHaveBeenCalled();
    });

    it('shows Next button when not at last step', () => {
        const { getByText } = render(
            <ChallengeNavButtons
                onPrevious={jest.fn()}
                onNext={jest.fn()}
                previousDisabled={false}
                isLastStep={false}
            />
        );

        expect(getByText('Next')).toBeTruthy();
    });

    it('shows Finish button when at last step', () => {
        const { getByText } = render(
            <ChallengeNavButtons
                onPrevious={jest.fn()}
                onNext={jest.fn()}
                previousDisabled={false}
                isLastStep={true}
            />
        );

        expect(getByText('Finish')).toBeTruthy();
    });

    it('respects custom previousTestID', () => {
        const { getByTestId } = render(
            <ChallengeNavButtons
                onPrevious={jest.fn()}
                onNext={jest.fn()}
                previousDisabled={false}
                isLastStep={false}
                previousTestID="custom-prev"
            />
        );

        expect(getByTestId('custom-prev')).toBeTruthy();
    });

    it('respects custom nextTestID', () => {
        const { getByTestId } = render(
            <ChallengeNavButtons
                onPrevious={jest.fn()}
                onNext={jest.fn()}
                previousDisabled={false}
                isLastStep={false}
                nextTestID="custom-next"
            />
        );

        expect(getByTestId('custom-next')).toBeTruthy();
    });
});
