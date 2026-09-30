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
    it('renders putt 1 with reach Tee 2 instruction', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        expect(getByText(/Putt 1 of/)).toBeTruthy();
        expect(getByTestId('in-window-button')).toBeTruthy();
        expect(getByTestId('short-button')).toBeTruthy();
    });

    it('advances to putt 2 on successful putt 1', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('in-window-button'));

        expect(getByText(/Putt 2 of/)).toBeTruthy();
        expect(getByTestId('past-tee3-button')).toBeTruthy();
    });

    it('shows complete view after drill ends', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('in-window-button'));
        fireEvent.press(getByTestId('short-button'));

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('displays score on completion', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('in-window-button')); // putt 1
        fireEvent.press(getByTestId('in-window-button')); // putt 2
        fireEvent.press(getByTestId('in-window-button')); // putt 3
        fireEvent.press(getByTestId('short-button'));     // putt 4 - ends

        expect(getByText(/Score: 3/)).toBeTruthy();
    });

    it('auto-saves result when completing', async () => {
        const { getByTestId } = render(<LagPutting />);
        const { insertDrillResultService } = require('../../../service/DbService');

        fireEvent.press(getByTestId('in-window-button'));
        fireEvent.press(getByTestId('short-button'));

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Lag Putting');
    });

    it('resets to putt 1 on play again', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('in-window-button'));
        fireEvent.press(getByTestId('short-button'));

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText(/Putt 1 of/)).toBeTruthy();
    });

    it('displays performance levels on completion', () => {
        const { getByText, getByTestId } = render(<LagPutting />);

        fireEvent.press(getByTestId('in-window-button'));
        fireEvent.press(getByTestId('short-button'));

        expect(getByText('Beginner')).toBeTruthy();
        expect(getByText('Pro')).toBeTruthy();
    });
});
