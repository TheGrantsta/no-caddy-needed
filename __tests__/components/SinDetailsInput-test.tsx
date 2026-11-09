import { render } from '@testing-library/react-native';
import React from 'react';
import SinDetailsInput from '../../components/SinDetailsInput';
import { DeadlySinsValues } from '../../service/DbService';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        errorText: '#fd0303',
    }),
}));

jest.mock('../../components/ClubPicker', () => 'ClubPicker');
jest.mock('../../components/PenaltyTypePicker', () => 'PenaltyTypePicker');
jest.mock('../../components/DoubleChipReasonPicker', () => 'DoubleChipReasonPicker');

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
        const onPenaltyTypeChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
            />
        );

        expect(queryByText('Club off the tee')).toBeNull();
    });

    it('renders off-tee section when troubleOffTee is true', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, troubleOffTee: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
            />
        );

        expect(getByText('Club off the tee')).toBeTruthy();
    });

    it('renders nothing when all sins are false', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
            />
        );

        expect(queryByText('Club off the tee')).toBeNull();
        expect(queryByText('Penalty type')).toBeNull();
    });

    it('does not render penalty type section when penalties is false', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
            />
        );

        expect(queryByText('Penalty type')).toBeNull();
    });

    it('renders penalty type section when penalties is true', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, penalties: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
            />
        );

        expect(getByText('Penalty type')).toBeTruthy();
    });

    it('renders both sections when both sins are marked', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, troubleOffTee: true, penalties: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
            />
        );

        expect(getByText('Club off the tee')).toBeTruthy();
        expect(getByText('Penalty type')).toBeTruthy();
    });

    it('does not render bogeys club section when bogeysInside9Iron is false', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
            />
        );

        expect(queryByText('Approach club')).toBeNull();
    });

    it('renders bogeys club section when bogeysInside9Iron is true', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, bogeysInside9Iron: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
            />
        );

        expect(getByText('Approach club')).toBeTruthy();
    });

    it('renders all three sections when all sins are marked', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, troubleOffTee: true, penalties: true, bogeysInside9Iron: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
            />
        );

        expect(getByText('Club off the tee')).toBeTruthy();
        expect(getByText('Penalty type')).toBeTruthy();
        expect(getByText('Approach club')).toBeTruthy();
    });

    it('does not render double chip reason section when doubleChips is false', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const onDoubleChipReasonChange = jest.fn();
        const { queryByText } = render(
            <SinDetailsInput
                sins={allFalseSins}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
                onDoubleChipReasonChange={onDoubleChipReasonChange}
            />
        );

        expect(queryByText('Double chip reason')).toBeNull();
    });

    it('renders double chip reason section when doubleChips is true', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const onDoubleChipReasonChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, doubleChips: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
                onDoubleChipReasonChange={onDoubleChipReasonChange}
            />
        );

        expect(getByText('Double chip reason')).toBeTruthy();
    });

    it('renders all four sections when all sins are marked', () => {
        const onOffTeeClubChange = jest.fn();
        const onPenaltyTypeChange = jest.fn();
        const onBogeysClubChange = jest.fn();
        const onDoubleChipReasonChange = jest.fn();
        const { getByText } = render(
            <SinDetailsInput
                sins={{ ...allFalseSins, troubleOffTee: true, penalties: true, bogeysInside9Iron: true, doubleChips: true }}
                clubs={mockClubs}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
                onDoubleChipReasonChange={onDoubleChipReasonChange}
            />
        );

        expect(getByText('Club off the tee')).toBeTruthy();
        expect(getByText('Penalty type')).toBeTruthy();
        expect(getByText('Approach club')).toBeTruthy();
        expect(getByText('Double chip reason')).toBeTruthy();
    });

    describe('single sin follow-up', () => {
        it('shouldRenderOnlyTheTroubleOffTeeClubPickerWhenOnlyIsTroubleOffTee', () => {
            const { UNSAFE_queryAllByType } = render(
                <SinDetailsInput
                    sins={{ ...allFalseSins, troubleOffTee: true, penalties: true }}
                    clubs={mockClubs}
                    only="troubleOffTee"
                    onOffTeeClubChange={jest.fn()}
                    onPenaltyTypeChange={jest.fn()}
                    onBogeysClubChange={jest.fn()}
                    onDoubleChipReasonChange={jest.fn()}
                />
            );

            expect(UNSAFE_queryAllByType('ClubPicker' as any)).toHaveLength(1);
            expect(UNSAFE_queryAllByType('PenaltyTypePicker' as any)).toHaveLength(0);
        });

        it('shouldRenderNothingWhenTheOnlySinIsNotMarked', () => {
            const { UNSAFE_queryAllByType } = render(
                <SinDetailsInput
                    sins={allFalseSins}
                    clubs={mockClubs}
                    only="troubleOffTee"
                    onOffTeeClubChange={jest.fn()}
                    onPenaltyTypeChange={jest.fn()}
                    onBogeysClubChange={jest.fn()}
                    onDoubleChipReasonChange={jest.fn()}
                />
            );

            expect(UNSAFE_queryAllByType('ClubPicker' as any)).toHaveLength(0);
        });
    });

    describe('follow-up row', () => {
        it('shouldShowTheSinLabelAndPickerInOneRowWhenOnlyIsSet', () => {
            const { getByTestId, getByText } = render(
                <SinDetailsInput
                    sins={{ ...allFalseSins, troubleOffTee: true }}
                    clubs={mockClubs}
                    only="troubleOffTee"
                    onOffTeeClubChange={jest.fn()}
                    onPenaltyTypeChange={jest.fn()}
                    onBogeysClubChange={jest.fn()}
                    onDoubleChipReasonChange={jest.fn()}
                />
            );

            expect(getByTestId('follow-up-row-troubleOffTee')).toBeTruthy();
            expect(getByText('Club off the tee')).toBeTruthy();
        });
    });
});
