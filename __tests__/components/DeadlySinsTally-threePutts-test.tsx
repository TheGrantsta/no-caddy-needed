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
const AUTO_ROW = '7deadly-sins-auto-row-three-putts';

describe('DeadlySinsTally 3-putts set by the putt count', () => {
    it('shouldShowAStandardThreePuttsToggleWhenNotSetByThePuttCount', () => {
        const { getByTestId } = render(<DeadlySinsTally roundControlled initialValues={allFalse} />);

        expect(getByTestId(THREE_PUTTS_TOGGLE)).toBeTruthy();
    });

    it('shouldHideThreePuttsBelowThreeSetByThePuttCount', () => {
        const { queryByTestId } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} threePuttsFromPuttCount />
        );

        expect(queryByTestId(THREE_PUTTS_TOGGLE)).toBeNull();
        expect(queryByTestId(AUTO_ROW)).toBeNull();
    });

    it('shouldShowAnAutoThreePuttsRowWhenThePuttCountIsThree', () => {
        const { getByTestId, getByText } = render(
            <DeadlySinsTally roundControlled initialValues={{ ...allFalse, threePutts: true }} threePuttsFromPuttCount />
        );

        expect(getByTestId(AUTO_ROW)).toBeTruthy();
        expect(getByText('Auto: 3 or more putts')).toBeTruthy();
        expect(getByTestId('7deadly-sins-auto-three-putts').props.value).toBe(true);
    });

    it('shouldNotLetThePlayerChangeTheAutoThreePuttsRow', () => {
        const onValuesChange = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <DeadlySinsTally roundControlled initialValues={{ ...allFalse, threePutts: true }} threePuttsFromPuttCount onValuesChange={onValuesChange} />
        );

        fireEvent.press(getByTestId(AUTO_ROW));

        expect(onValuesChange).not.toHaveBeenCalled();
        expect(queryByTestId(THREE_PUTTS_TOGGLE)).toBeNull();
    });

    it('shouldAppearWhenThePuttCountBecomesThree', () => {
        const { queryByTestId, getByTestId, rerender } = render(
            <DeadlySinsTally roundControlled initialValues={allFalse} threePuttsFromPuttCount />
        );
        expect(queryByTestId(AUTO_ROW)).toBeNull();

        rerender(<DeadlySinsTally roundControlled initialValues={{ ...allFalse, threePutts: true }} threePuttsFromPuttCount />);

        expect(getByTestId(AUTO_ROW)).toBeTruthy();
    });

    it('shouldDisappearWhenThePuttCountGoesBelowThree', () => {
        const { queryByTestId, rerender } = render(
            <DeadlySinsTally roundControlled initialValues={{ ...allFalse, threePutts: true }} threePuttsFromPuttCount />
        );

        rerender(<DeadlySinsTally roundControlled initialValues={allFalse} threePuttsFromPuttCount />);

        expect(queryByTestId(AUTO_ROW)).toBeNull();
    });
});
