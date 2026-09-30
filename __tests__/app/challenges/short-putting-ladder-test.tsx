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

        expect(getByText(/Distance/)).toBeTruthy();
        expect(getByText(/4 ft/)).toBeTruthy();
        expect(getByTestId('make-button')).toBeTruthy();
        expect(getByTestId('miss-button')).toBeTruthy();
        expect(getByTestId('finish-button')).toBeTruthy();
    });

    it('advances level on make', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('make-button'));

        expect(getByText(/5 ft/)).toBeTruthy();
    });

    it('stays at level on miss', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('miss-button'));

        expect(getByText(/5 ft/)).toBeTruthy();
    });

    it('shows complete view after finish', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('finish-button'));

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('displays level reached and attempts on completion', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('finish-button'));

        expect(getByText('7 ft')).toBeTruthy();
        expect(getByText(/3 attempt/)).toBeTruthy();
    });

    it('auto-saves result when finishing', async () => {
        const { getByTestId } = render(<ShortPuttingLadder />);
        const { insertDrillResultService } = require('../../../service/DbService');

        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('finish-button'));

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Short-Putting Ladder');
    });

    it('resets to level 4 on play again', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('finish-button'));

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText(/Distance/)).toBeTruthy();
        expect(getByText(/4 ft/)).toBeTruthy();
    });

    it('displays performance bands on completion', () => {
        const { getByText, getByTestId } = render(<ShortPuttingLadder />);

        fireEvent.press(getByTestId('make-button'));
        fireEvent.press(getByTestId('finish-button'));

        expect(getByText('Pro')).toBeTruthy();
        expect(getByText('15 Handicap')).toBeTruthy();
    });
});
