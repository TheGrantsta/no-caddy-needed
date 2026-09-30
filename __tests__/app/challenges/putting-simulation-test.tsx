import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PuttingSimulation from '../../../app/challenges/putting-simulation';

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

describe('PuttingSimulation screen', () => {
    it('renders in-progress phase with number picker', () => {
        const { getByText, getByTestId } = render(<PuttingSimulation />);

        expect(getByText(/Hole 1 of 18/)).toBeTruthy();
        expect(getByTestId('putt-count-display')).toBeTruthy();
        expect(getByTestId('decrease-putts-button')).toBeTruthy();
        expect(getByTestId('increase-putts-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });

    it('shows Previous and Next buttons', () => {
        const { getByTestId } = render(<PuttingSimulation />);

        expect(getByTestId('previous-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });

    it('shows complete view after 18 holes', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        expect(getByText(/Round complete/)).toBeTruthy();
        expect(getByTestId('save-button')).toBeTruthy();
        expect(getByTestId('try-again-button')).toBeTruthy();
    });

    it('calls insertDrillResultService on save', async () => {
        const { getByTestId } = render(<PuttingSimulation />);
        const { insertDrillResultService } = require('../../../service/DbService');

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        fireEvent.press(getByTestId('save-button'));

        // Wait for async call
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name, passed] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Putting Simulation');
        expect(typeof passed).toBe('boolean');
    });

    it('allows navigating between holes', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('next-button'));
        expect(getByText(/Hole 2 of 18/)).toBeTruthy();

        fireEvent.press(getByTestId('previous-button'));
        expect(getByText(/Hole 1 of 18/)).toBeTruthy();
    });

    it('resets to hole 1 on try again', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-button'));
        }

        fireEvent.press(getByTestId('try-again-button'));

        expect(getByText(/Hole 1 of 18/)).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });
});
