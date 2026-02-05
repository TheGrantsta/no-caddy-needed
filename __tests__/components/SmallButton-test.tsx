import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SmallButton from '../../components/SmallButton';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('SmallButton component', () => {
    it('renders the label', () => {
        const { getByText } = render(
            <SmallButton testId="test-button" label="Click me" selected={false} />
        );

        expect(getByText('Click me')).toBeTruthy();
    });

    it('renders with the correct testId', () => {
        const { getByTestId } = render(
            <SmallButton testId="my-button" label="Test" selected={false} />
        );

        expect(getByTestId('my-button')).toBeTruthy();
    });

    it('renders in unselected state', () => {
        const { getByText } = render(
            <SmallButton testId="test-button" label="Unselected" selected={false} />
        );

        expect(getByText('Unselected')).toBeTruthy();
    });

    it('renders in selected state', () => {
        const { getByText } = render(
            <SmallButton testId="test-button" label="Selected" selected={true} />
        );

        expect(getByText('Selected')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
            <SmallButton testId="test-button" label="Press me" selected={false} onPress={mockOnPress} />
        );

        fireEvent.press(getByTestId('test-button'));

        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onPress is undefined', () => {
        const { getByTestId } = render(
            <SmallButton testId="test-button" label="No handler" selected={false} />
        );

        // Should not throw
        fireEvent.press(getByTestId('test-button'));
    });

    it('renders different labels correctly', () => {
        const labels = ['Start', 'Stop', 'Reset', 'Save'];

        labels.forEach(label => {
            const { getByText } = render(
                <SmallButton testId="test-button" label={label} selected={false} />
            );

            expect(getByText(label)).toBeTruthy();
        });
    });

    it('can toggle between selected states', () => {
        const { rerender, getByTestId } = render(
            <SmallButton testId="toggle-button" label="Toggle" selected={false} />
        );

        expect(getByTestId('toggle-button')).toBeTruthy();

        rerender(
            <SmallButton testId="toggle-button" label="Toggle" selected={true} />
        );

        expect(getByTestId('toggle-button')).toBeTruthy();
    });
});
