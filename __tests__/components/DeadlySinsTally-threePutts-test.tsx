import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DeadlySinsTally from '../../components/DeadlySinsTally';
import { DeadlySinsValues } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const allFalse: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

const THREE_PUTTS_TOGGLE = '7deadly-sins-toggle-three-putts';
const THREE_PUTTS_INDICATOR = '7deadly-sins-indicator-three-putts';

describe('DeadlySinsTally 3-putt lockout after a chip-in', () => {
    it('shouldLetThePlayerMark3PuttsWhenNotDisabled', () => {
        const onValuesChange = jest.fn();
        const { getByTestId } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} onValuesChange={onValuesChange} />
        );

        fireEvent.press(getByTestId(THREE_PUTTS_TOGGLE));

        expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ threePutts: true }));
    });

    it('shouldIgnoreTapsOn3PuttsWhenDisabled', () => {
        const onValuesChange = jest.fn();
        const { getByTestId } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} onValuesChange={onValuesChange} threePuttsDisabled />
        );

        fireEvent.press(getByTestId(THREE_PUTTS_TOGGLE));

        expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('shouldShow3PuttsAsUnmarkedWhenDisabled', () => {
        const { getByTestId } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} threePuttsDisabled />
        );

        expect(getByTestId(THREE_PUTTS_INDICATOR).props.value).toBe(false);
    });

    it('shouldClearAnAlreadyMarked3PuttWhenItBecomesDisabled', () => {
        const onValuesChange = jest.fn();
        render(
            <DeadlySinsTally
                roundControlled
                initialValues={{ ...allFalse, threePutts: true }}
                onValuesChange={onValuesChange}
                threePuttsDisabled
            />
        );

        expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ threePutts: false }));
    });

    it('shouldExplainWhyThe3PuttRowIsLockedWhenDisabled', () => {
        const { getByText } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} threePuttsDisabled />
        );

        expect(getByText('Not possible after a chip-in')).toBeTruthy();
    });

    it('shouldNotShowTheChipInExplanationWhen3PuttsEnabled', () => {
        const { queryByText } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} />
        );

        expect(queryByText('Not possible after a chip-in')).toBeNull();
    });
});
