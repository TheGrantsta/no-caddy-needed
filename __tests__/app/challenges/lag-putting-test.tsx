import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LagPutting from '../../../app/challenges/lag-putting';

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

describe('LagPutting screen', () => {
    it('renders score picker with instructions', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        expect(getByText(/Lag Putting Challenge/)).toBeTruthy();
        expect(getByText(/Set up/)).toBeTruthy();
        expect(getByTestId('score-display')).toBeTruthy();
        expect(getByTestId('submit-button')).toBeTruthy();
    });

    it('shows task instructions', () => {
        const { getByText } = render(<LagPutting />);

        expect(getByText(/Place tee 1 in the ground/)).toBeTruthy();
        expect(getByText(/First putt must reach tee 2/)).toBeTruthy();
    });

    it('increments/decrements score (0-15)', () => {
        const { getByTestId, getByText, getAllByText } = render(<LagPutting />);

        fireEvent.press(getByTestId('increase-score-button'));
        expect(getAllByText('1')[0]).toBeTruthy();

        fireEvent.press(getByTestId('increase-score-button'));
        expect(getAllByText('2')[0]).toBeTruthy();

        fireEvent.press(getByTestId('decrease-score-button'));
        expect(getAllByText('1')[0]).toBeTruthy();
    });

    it('shows complete view after submit', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('submit-button'));

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('displays score on completion', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('submit-button'));

        expect(getByText(/Score: 3/)).toBeTruthy();
    });

    it('auto-saves result when submitting', async () => {
        const { getByTestId } = render(<LagPutting />);
        const { insertDrillResultService } = require('../../../service/DbService');

        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('submit-button'));

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Lag Putting');
    });

    it('resets to score 0 on play again', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('submit-button'));

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText(/Lag Putting Challenge/)).toBeTruthy();
        expect(getByText('0')).toBeTruthy();
    });

    it('displays performance levels on completion', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('increase-score-button'));
        fireEvent.press(getByTestId('submit-button'));

        expect(getByText('Beginner')).toBeTruthy();
        expect(getByText('Pro')).toBeTruthy();
    });
});
