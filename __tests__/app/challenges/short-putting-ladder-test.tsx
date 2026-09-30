import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ShortPuttingLadder from '../../../app/challenges/short-putting-ladder';

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

describe('ShortPuttingLadder screen', () => {
    it('renders in-progress phase with current level', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        expect(getByText(/Level 1 of 7/)).toBeTruthy();
        expect(getByText(/Distance/)).toBeTruthy();
        expect(getByText(/4 ft/)).toBeTruthy();
        expect(getByTestId('result-display')).toBeTruthy();
    });

    it('shows attempts picker (1-10)', () => {
        const { getByTestId, getByText } = render(<ShortPuttingLadder />);

        expect(getByTestId('decrease-result-button')).toBeTruthy();
        expect(getByTestId('increase-result-button')).toBeTruthy();
        expect(getByText('1 attempt')).toBeTruthy();
    });

    it('increments/decrements attempts (1-10)', () => {
        const { getByTestId, getByText } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('increase-result-button'));
        expect(getByText('2 attempts')).toBeTruthy();

        fireEvent.press(getByTestId('increase-result-button'));
        expect(getByText('3 attempts')).toBeTruthy();

        fireEvent.press(getByTestId('decrease-result-button'));
        expect(getByText('2 attempts')).toBeTruthy();
    });

    it('navigates to next level with Next button', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('next-button'));

        expect(getByText(/Level 2 of 7/)).toBeTruthy();
        expect(getByText(/5 ft/)).toBeTruthy();
    });

    it('shows Finish button on last level', () => {
        const { getByTestId, getByText } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 6; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText('Finish')).toBeTruthy();
    });

    it('shows complete view after finish', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('displays total attempts and levels on completion', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText(/total attempts/)).toBeTruthy();
        expect(getByText(/levels/)).toBeTruthy();
    });

    it('auto-saves result when finishing', async () => {
        const { getByTestId } = render(<ShortPuttingLadder />);
        const { insertDrillResultService } = require('../../../service/DbService');

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Short-Putting Ladder');
    });

    it('resets to level 4 on play again', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText(/Level 1 of 7/)).toBeTruthy();
        expect(getByText(/4 ft/)).toBeTruthy();
    });

    it('displays performance bands on completion', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText('Pro')).toBeTruthy();
        expect(getByText('15 Handicap')).toBeTruthy();
    });
});
