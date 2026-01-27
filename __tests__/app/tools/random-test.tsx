import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Random from '../../../app/tools/random';

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

jest.mock('../../../assets/random-number', () => ({
    getRandomNumber: jest.fn().mockReturnValue(50),
}));

describe('Random number generator page', () => {
    it('renders correctly with the header', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Random number generator')).toBeTruthy();
    });

    it('renders range input with default value', () => {
        const { getByDisplayValue } = render(<Random />);

        expect(getByDisplayValue('30-100')).toBeTruthy();
    });

    it('renders increment input with default value', () => {
        const { getByDisplayValue } = render(<Random />);

        expect(getByDisplayValue('10')).toBeTruthy();
    });

    it('renders the Run button', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Run')).toBeTruthy();
    });

    it('renders purpose section with chevrons', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Purpose')).toBeTruthy();
        expect(getByText('Randomise practice to mimic play')).toBeTruthy();
    });

    it('shows error when range is empty and Run is pressed', () => {
        const { getByDisplayValue, getByTestId, getByText } = render(<Random />);

        const rangeInput = getByDisplayValue('30-100');
        fireEvent.changeText(rangeInput, '');

        const runButton = getByTestId('save-button');
        fireEvent.press(runButton);

        expect(getByText('Range cannot be empty')).toBeTruthy();
    });

    it('shows error when increment is empty and Run is pressed', () => {
        const { getByDisplayValue, getByTestId, getByText } = render(<Random />);

        const incrementInput = getByDisplayValue('10');
        fireEvent.changeText(incrementInput, '');

        const runButton = getByTestId('save-button');
        fireEvent.press(runButton);

        expect(getByText('Increment cannot be empty')).toBeTruthy();
    });

    it('displays random number after pressing Run with valid inputs', () => {
        const { getByTestId, getByText } = render(<Random />);

        const runButton = getByTestId('save-button');
        fireEvent.press(runButton);

        expect(getByText('50')).toBeTruthy();
    });

    it('filters non-numeric characters from range input except hyphen', () => {
        const { getByDisplayValue } = render(<Random />);

        const rangeInput = getByDisplayValue('30-100');
        fireEvent.changeText(rangeInput, '20-abc50');

        expect(getByDisplayValue('20-50')).toBeTruthy();
    });

    it('filters non-numeric characters from increment input', () => {
        const { getByDisplayValue } = render(<Random />);

        const incrementInput = getByDisplayValue('10');
        fireEvent.changeText(incrementInput, '5abc');

        expect(getByDisplayValue('5')).toBeTruthy();
    });
});
