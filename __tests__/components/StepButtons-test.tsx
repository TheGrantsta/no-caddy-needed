import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NextStepButton, PreviousStepButton } from '../../components/StepButtons';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const colours = require('../../assets/colours').default;

describe('PreviousStepButton', () => {
    it('shouldShowItsLabelAsAPlainBoldPrimaryLabelWithNoFill', () => {
        const { getByTestId, getByText } = render(<PreviousStepButton label="Hole 9" testID="prev" onPress={jest.fn()} />);

        expect(getByTestId('prev')).toHaveStyle({ backgroundColor: 'transparent' });
        expect(getByText('Hole 9')).toHaveStyle({ color: colours.primary, fontWeight: 'bold' });
    });

    it('shouldCallOnPressWhenTapped', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(<PreviousStepButton label="Hole 9" testID="prev" onPress={onPress} />);

        fireEvent.press(getByTestId('prev'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});

describe('NextStepButton', () => {
    it('shouldShowAGreenPillWithAWhiteLabelAndIcon', () => {
        const { getByTestId, getByText, UNSAFE_getByProps } = render(
            <NextStepButton label="Hole 11" icon="chevron-right" testID="next" onPress={jest.fn()} />
        );

        expect(getByTestId('next')).toHaveStyle({ backgroundColor: colours.primary, borderRadius: 999 });
        expect(getByText('Hole 11')).toHaveStyle({ color: colours.white });
        expect(UNSAFE_getByProps({ name: 'chevron-right' })).toBeTruthy();
    });

    it('shouldCallOnPressWhenTapped', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(<NextStepButton label="Finish" icon="sports-score" testID="next" onPress={onPress} />);

        fireEvent.press(getByTestId('next'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
