import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PuttDistancePicker from '../../components/PuttDistancePicker';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('PuttDistancePicker', () => {
    it('shouldShowZeroWhenNoDistanceChosen', () => {
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );

        expect(getByTestId('first-putt-input')).toHaveTextContent('0');
    });

    it('shouldShowTheChosenDistance', () => {
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="20" maxDistance={300} onChange={jest.fn()} />
        );

        expect(getByTestId('first-putt-input')).toHaveTextContent('20');
    });

    it('shouldOpenAListOfDistancesWhenPressed', () => {
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );

        expect(queryByTestId('first-putt-input-option-20')).toBeNull();
        fireEvent.press(getByTestId('first-putt-input'));
        expect(getByTestId('first-putt-input-option-20')).toBeTruthy();
    });

    it('shouldShowTheDistancesInlineInsteadOfInAModal', () => {
        const { Modal } = require('react-native');
        const { getByTestId, UNSAFE_queryAllByType } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        expect(getByTestId('first-putt-input-option-1')).toBeTruthy();
        expect(UNSAFE_queryAllByType(Modal)).toHaveLength(0);
    });

    it('shouldOfferEveryDistanceUpToTheMaximum', () => {
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        expect(getByTestId('first-putt-input-option-1')).toBeTruthy();
        expect(queryByTestId('first-putt-input-option-0')).toBeNull();
        expect(getByTestId('first-putt-input-option-300')).toBeTruthy();
        expect(queryByTestId('first-putt-input-option-301')).toBeNull();
    });

    it('shouldReportTheChosenDistanceAsText', () => {
        const onChange = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={onChange} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        fireEvent.press(getByTestId('first-putt-input-option-20'));

        expect(onChange).toHaveBeenCalledWith('20');
        expect(queryByTestId('first-putt-input-option-20')).toBeNull();
    });

    it('shouldClearTheDistanceWhenClearChosen', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="20" maxDistance={300} onChange={onChange} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        fireEvent.press(getByTestId('first-putt-input-option-clear'));

        expect(onChange).toHaveBeenCalledWith('');
    });

    it('shouldOutlineTheBoxInRedWhenThereIsAnError', () => {
        const colours = require('../../assets/colours').default;
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} hasError />
        );

        expect(getByTestId('first-putt-input')).toHaveStyle({ borderColor: colours.red });
    });
});
