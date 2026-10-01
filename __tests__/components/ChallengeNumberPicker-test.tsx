import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChallengeNumberPicker from '../../components/ChallengeNumberPicker';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        tertiary: '#8CBBA4',
    }),
}));

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        navRow: { flexDirection: 'row' },
        headerText: { fontSize: 24, fontWeight: '600' },
    }),
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: ({ _name, _size, _color, _testID }: any) => null,
}));

describe('ChallengeNumberPicker', () => {
    it('renders value via displayTestID', () => {
        const { getByTestId } = render(
            <ChallengeNumberPicker
                value={3}
                onChange={jest.fn()}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
            />
        );

        expect(getByTestId('display')).toBeTruthy();
    });

    it('decrease button calls onChange with value - 1', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <ChallengeNumberPicker
                value={3}
                onChange={onChange}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
            />
        );

        fireEvent.press(getByTestId('decrease'));
        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('increase button calls onChange with value + 1', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <ChallengeNumberPicker
                value={3}
                onChange={onChange}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
            />
        );

        fireEvent.press(getByTestId('increase'));
        expect(onChange).toHaveBeenCalledWith(4);
    });

    it('decrease button does not call onChange when at min', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <ChallengeNumberPicker
                value={1}
                onChange={onChange}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
            />
        );

        fireEvent.press(getByTestId('decrease'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('increase button does not call onChange when at max', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <ChallengeNumberPicker
                value={5}
                onChange={onChange}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
            />
        );

        fireEvent.press(getByTestId('increase'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('formatValue is applied to displayed text when provided', () => {
        const { getByText } = render(
            <ChallengeNumberPicker
                value={2}
                onChange={jest.fn()}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
                formatValue={(v) => `${v} shot${v !== 1 ? 's' : ''}`}
            />
        );

        expect(getByText('2 shots')).toBeTruthy();
    });

    it('default formatting is bare number when formatValue is omitted', () => {
        const { getByText } = render(
            <ChallengeNumberPicker
                value={3}
                onChange={jest.fn()}
                min={1}
                max={5}
                decreaseTestID="decrease"
                increaseTestID="increase"
                displayTestID="display"
            />
        );

        expect(getByText('3')).toBeTruthy();
    });
});
