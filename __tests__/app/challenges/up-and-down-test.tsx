import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UpAndDownChallenge from '../../../app/challenges/up-and-down';

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: any) => children,
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
}));

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
        showError: jest.fn(),
    }),
}));

jest.mock('../../../service/DbService', () => ({
    insertDrillResultService: jest.fn(() => Promise.resolve(true)),
}));

describe('UpAndDownChallenge screen', () => {
    it('renders in-progress phase with shots picker', () => {
        const { getByText, getByTestId } = render(<UpAndDownChallenge />);

        expect(getByText(/Hole 1 of 9/)).toBeTruthy();
        expect(getByTestId('shots-count-display')).toBeTruthy();
        expect(getByTestId('decrease-shots-button')).toBeTruthy();
        expect(getByTestId('increase-shots-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });

    it('shows Previous and Next buttons', () => {
        const { getByTestId } = render(<UpAndDownChallenge />);

        expect(getByTestId('previous-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });

    it('shows complete view after 9 holes', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('auto-saves result when completing', async () => {
        const { getByTestId } = render(<UpAndDownChallenge />);
        const { insertDrillResultService } = require('../../../service/DbService');

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        // Wait for auto-save
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Up-and-Down Challenge');
    });

    it('allows navigating between holes', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('next-button'));
        expect(getByText(/Hole 2 of 9/)).toBeTruthy();

        fireEvent.press(getByTestId('previous-button'));
        expect(getByText(/Hole 1 of 9/)).toBeTruthy();
    });

    it('resets to hole 1 on play again', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText(/Hole 1 of 9/)).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });

    it('displays performance bands on completion', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText('PGA Pro')).toBeTruthy();
        expect(getByText('D1 College')).toBeTruthy();
        expect(getByText('Scratch')).toBeTruthy();
    });
});
