import React from 'react';
import { render } from '@testing-library/react-native';
import PhaseSinDetails from '../../components/PhaseSinDetails';
import { DeadlySinsValues, ClubDistance } from '../../service/DbService';

jest.mock('../../hooks/useStyles', () => ({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: any) => children,
}));

const mockClubs: ClubDistance[] = [
    { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 260, SortOrder: 1 },
    { Id: 2, Club: '5 Iron', CarryDistance: 180, TotalDistance: 190, SortOrder: 2 },
];

describe('PhaseSinDetails', () => {
    it('renders club picker when troubleOffTee is true', () => {
        const sins: DeadlySinsValues = { troubleOffTee: true, penalties: false, bogeysInside9Iron: false, doubleChips: false, threePutts: false, doubleBogeys: false, bogeysPar5: false };
        const { getByText } = render(
            <PhaseSinDetails
                holeNumber={1}
                clubDistances={mockClubs}
                deadlySinsValues={sins}
                selectedOffTeeClub={undefined}
                sinDetailsClubError={false}
                selectedPenaltyType={undefined}
                sinDetailsPenaltyError={false}
                selectedBogeysClub={undefined}
                sinDetailsBogeysClubError={false}
                selectedDoubleChipReason={undefined}
                sinDetailsDoubleChipReasonError={false}
                onOffTeeClubChange={jest.fn()}
                onPenaltyTypeChange={jest.fn()}
                onBogeysClubChange={jest.fn()}
                onDoubleChipReasonChange={jest.fn()}
            />
        );
        expect(getByText('Club used off the tee')).toBeTruthy();
    });

    it('shows empty state when no clubs available', () => {
        const sins: DeadlySinsValues = { troubleOffTee: true, penalties: false, bogeysInside9Iron: false, doubleChips: false, threePutts: false, doubleBogeys: false, bogeysPar5: false };
        const { getByText } = render(
            <PhaseSinDetails
                holeNumber={1}
                clubDistances={[]}
                deadlySinsValues={sins}
                selectedOffTeeClub={undefined}
                sinDetailsClubError={false}
                selectedPenaltyType={undefined}
                sinDetailsPenaltyError={false}
                selectedBogeysClub={undefined}
                sinDetailsBogeysClubError={false}
                selectedDoubleChipReason={undefined}
                sinDetailsDoubleChipReasonError={false}
                onOffTeeClubChange={jest.fn()}
                onPenaltyTypeChange={jest.fn()}
                onBogeysClubChange={jest.fn()}
                onDoubleChipReasonChange={jest.fn()}
            />
        );
        expect(getByText(/Add clubs in Distances/)).toBeTruthy();
    });

    it('renders penalty picker when penalties is true', () => {
        const sins: DeadlySinsValues = { troubleOffTee: false, penalties: true, bogeysInside9Iron: false, doubleChips: false, threePutts: false, doubleBogeys: false, bogeysPar5: false };
        const { getByText } = render(
            <PhaseSinDetails
                holeNumber={1}
                clubDistances={mockClubs}
                deadlySinsValues={sins}
                selectedOffTeeClub={undefined}
                sinDetailsClubError={false}
                selectedPenaltyType={undefined}
                sinDetailsPenaltyError={false}
                selectedBogeysClub={undefined}
                sinDetailsBogeysClubError={false}
                selectedDoubleChipReason={undefined}
                sinDetailsDoubleChipReasonError={false}
                onOffTeeClubChange={jest.fn()}
                onPenaltyTypeChange={jest.fn()}
                onBogeysClubChange={jest.fn()}
                onDoubleChipReasonChange={jest.fn()}
            />
        );
        expect(getByText('Penalty type')).toBeTruthy();
    });

    it('renders bogeys club picker when bogeysInside9Iron is true', () => {
        const sins: DeadlySinsValues = { troubleOffTee: false, penalties: false, bogeysInside9Iron: true, doubleChips: false, threePutts: false, doubleBogeys: false, bogeysPar5: false };
        const { getByText } = render(
            <PhaseSinDetails
                holeNumber={1}
                clubDistances={mockClubs}
                deadlySinsValues={sins}
                selectedOffTeeClub={undefined}
                sinDetailsClubError={false}
                selectedPenaltyType={undefined}
                sinDetailsPenaltyError={false}
                selectedBogeysClub={undefined}
                sinDetailsBogeysClubError={false}
                selectedDoubleChipReason={undefined}
                sinDetailsDoubleChipReasonError={false}
                onOffTeeClubChange={jest.fn()}
                onPenaltyTypeChange={jest.fn()}
                onBogeysClubChange={jest.fn()}
                onDoubleChipReasonChange={jest.fn()}
            />
        );
        expect(getByText('Approach club')).toBeTruthy();
    });

    it('renders double chip reason picker when doubleChips is true', () => {
        const sins: DeadlySinsValues = { troubleOffTee: false, penalties: false, bogeysInside9Iron: false, doubleChips: true, threePutts: false, doubleBogeys: false, bogeysPar5: false };
        const { getByText } = render(
            <PhaseSinDetails
                holeNumber={1}
                clubDistances={mockClubs}
                deadlySinsValues={sins}
                selectedOffTeeClub={undefined}
                sinDetailsClubError={false}
                selectedPenaltyType={undefined}
                sinDetailsPenaltyError={false}
                selectedBogeysClub={undefined}
                sinDetailsBogeysClubError={false}
                selectedDoubleChipReason={undefined}
                sinDetailsDoubleChipReasonError={false}
                onOffTeeClubChange={jest.fn()}
                onPenaltyTypeChange={jest.fn()}
                onBogeysClubChange={jest.fn()}
                onDoubleChipReasonChange={jest.fn()}
            />
        );
        expect(getByText('Double chip reason')).toBeTruthy();
    });

    it('shows error when sinDetailsClubError is true', () => {
        const sins: DeadlySinsValues = { troubleOffTee: true, penalties: false, bogeysInside9Iron: false, doubleChips: false, threePutts: false, doubleBogeys: false, bogeysPar5: false };
        const { queryAllByText } = render(
            <PhaseSinDetails
                holeNumber={1}
                clubDistances={mockClubs}
                deadlySinsValues={sins}
                selectedOffTeeClub={undefined}
                sinDetailsClubError={true}
                selectedPenaltyType={undefined}
                sinDetailsPenaltyError={false}
                selectedBogeysClub={undefined}
                sinDetailsBogeysClubError={false}
                selectedDoubleChipReason={undefined}
                sinDetailsDoubleChipReasonError={false}
                onOffTeeClubChange={jest.fn()}
                onPenaltyTypeChange={jest.fn()}
                onBogeysClubChange={jest.fn()}
                onDoubleChipReasonChange={jest.fn()}
            />
        );
        expect(queryAllByText('Required').length).toBeGreaterThan(0);
    });
});
