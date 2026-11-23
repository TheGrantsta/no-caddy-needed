import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PhaseStats from '../../components/PhaseStats';
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

const baseProps = {
    holeNumber: 3,
    holePar: 4,
    sins: allFalse,
    onSinsChange: jest.fn(),
    clubDistances: [],
    sinDetailsClubError: false,
    onOffTeeClubChange: jest.fn(),
    sinDetailsPenaltyError: false,
    onPenaltyTypeChange: jest.fn(),
    sinDetailsBogeysClubError: false,
    onBogeysClubChange: jest.fn(),
    sinDetailsDoubleChipReasonError: false,
    onDoubleChipReasonChange: jest.fn(),
};

describe('PhaseStats 3-putt lockout', () => {
    it('shouldPassThreePuttsLockThroughToTheSinsCard', () => {
        const onSinsChange = jest.fn();
        const { getByTestId } = render(
            <PhaseStats {...baseProps} onSinsChange={onSinsChange} threePuttsDisabled />
        );

        fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

        expect(onSinsChange).not.toHaveBeenCalledWith(expect.objectContaining({ threePutts: true }));
    });

    it('shouldLeaveThreePuttsAvailableWhenNotLocked', () => {
        const onSinsChange = jest.fn();
        const { getByTestId } = render(<PhaseStats {...baseProps} onSinsChange={onSinsChange} />);

        fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

        expect(onSinsChange).toHaveBeenLastCalledWith(expect.objectContaining({ threePutts: true }));
    });
});
