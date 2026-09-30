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
    it('renders intro phase with start button', () => {
        const { getByText, getByTestId } = render(<PuttingSimulation />);

        expect(getByText('PGA Putting Simulation')).toBeTruthy();
        expect(getByText(/How to play/)).toBeTruthy();
        expect(getByTestId('start-button')).toBeTruthy();
    });

    it('transitions to in-progress on start button press', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('start-button'));

        expect(getByText(/Hole 1 of 18/)).toBeTruthy();
        expect(getByTestId('made-button')).toBeTruthy();
        expect(getByTestId('missed-button')).toBeTruthy();
    });

    it('shows complete view after 18 putts', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('start-button'));

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('made-button'));
        }

        expect(getByText(/Round complete/)).toBeTruthy();
        expect(getByTestId('save-button')).toBeTruthy();
        expect(getByTestId('try-again-button')).toBeTruthy();
    });

    it('calls insertDrillResultService on save', async () => {
        const { getByTestId } = render(<PuttingSimulation />);
        const { insertDrillResultService } = require('../../../service/DbService');

        fireEvent.press(getByTestId('start-button'));

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('made-button'));
        }

        fireEvent.press(getByTestId('save-button'));

        // Wait for async call
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name, passed] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('PGA Putting Simulation');
        expect(typeof passed).toBe('boolean');
    });

    it('resets to intro on try again', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('start-button'));

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('made-button'));
        }

        fireEvent.press(getByTestId('try-again-button'));

        expect(getByText('PGA Putting Simulation')).toBeTruthy();
        expect(getByText(/How to play/)).toBeTruthy();
    });
});
