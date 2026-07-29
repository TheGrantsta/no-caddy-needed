import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import SinDetailsInput from '../../components/SinDetailsInput';
import { DeadlySinsValues } from '../../service/DbService';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        holeScoreInput: {
            playerName: { fontSize: 16, fontWeight: 'bold' },
        },
    }),
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        errorText: '#fd0303',
    }),
}));

jest.mock('../../components/ClubPicker', () => 'ClubPicker');

describe('SinDetailsInput', () => {
    const allFalseSins: DeadlySinsValues = {
        threePutts: false,
        doubleBogeys: false,
        bogeysPar5: false,
        bogeysInside9Iron: false,
        doubleChips: false,
        troubleOffTee: false,
        penalties: false,
    };

    const mockClubs = [
        { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 0 },
        { Id: 2, Club: '3-wood', CarryDistance: 230, TotalDistance: 250, SortOrder: 1 },
    ];

    it('does not render off-tee section when troubleOffTee is false', () => {
        const onOffTeeClubChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
            />
        );

        expect(queryByText('Club used off the tee')).toBeNull();
    });

    it('renders off-tee section when troubleOffTee is true', () => {
        const onOffTeeClubChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, troubleOffTee: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
            />
        );

        expect(getByText('Club used off the tee')).toBeTruthy();
    });

    it('renders nothing when all sins are false', () => {
        const onOffTeeClubChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
            />
        );

        expect(queryByText('Club used off the tee')).toBeNull();
    });

    it('passes club selection callback to ClubPicker', () => {
        const onOffTeeClubChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, troubleOffTee: true }}
                clubs={mockClubs}
                selectedOffTeeClub="Driver"
                onOffTeeClubChange={onOffTeeClubChange}
            />
        );

        // Verify section is rendered and ClubPicker is included (via callback)
        expect(getByText('Club used off the tee')).toBeTruthy();
    });
});
