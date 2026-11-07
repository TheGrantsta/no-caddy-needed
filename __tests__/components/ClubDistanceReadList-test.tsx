import React from 'react';
import { render } from '@testing-library/react-native';
import ClubDistanceReadList from '../../components/ClubDistanceReadList';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const distances = [
    { Id: 1, Club: 'Driver', CarryDistance: 230, TotalDistance: 250, SortOrder: 1 },
    { Id: 2, Club: '5 Iron', CarryDistance: 175, TotalDistance: 182, SortOrder: 2 },
];

describe('ClubDistanceReadList', () => {
    it('shouldShowClubColumnHeader', () => {
        const { getByText } = render(<ClubDistanceReadList distances={distances} metric="carry" units="yards" />);

        expect(getByText('Club')).toBeTruthy();
    });

    it('shouldShowCarryColumnHeaderWhenCarryMetricSelected', () => {
        const { getByText, queryByText } = render(<ClubDistanceReadList distances={distances} metric="carry" units="yards" />);

        expect(getByText('Carry')).toBeTruthy();
        expect(queryByText('Total')).toBeNull();
    });

    it('shouldShowTotalColumnHeaderWhenTotalMetricSelected', () => {
        const { getByText, queryByText } = render(<ClubDistanceReadList distances={distances} metric="total" units="yards" />);

        expect(getByText('Total')).toBeTruthy();
        expect(queryByText('Carry')).toBeNull();
    });

    it('shouldShowEachClubName', () => {
        const { getByText } = render(<ClubDistanceReadList distances={distances} metric="carry" units="yards" />);

        expect(getByText('Driver')).toBeTruthy();
        expect(getByText('5 Iron')).toBeTruthy();
    });

    it('shouldShowCarryYardagesWithUnitWhenCarryMetricSelected', () => {
        const { getByText } = render(<ClubDistanceReadList distances={distances} metric="carry" units="yards" />);

        expect(getByText('230 yd')).toBeTruthy();
        expect(getByText('175 yd')).toBeTruthy();
    });

    it('shouldShowTotalYardagesWhenTotalMetricSelected', () => {
        const { getByText, queryByText } = render(<ClubDistanceReadList distances={distances} metric="total" units="yards" />);

        expect(getByText('250 yd')).toBeTruthy();
        expect(getByText('182 yd')).toBeTruthy();
        expect(queryByText('230 yd')).toBeNull();
    });

    it('shouldShowMetresWhenMetresUnitSelected', () => {
        const { getByText } = render(<ClubDistanceReadList distances={[{ Id: 1, Club: 'Driver', CarryDistance: 100, TotalDistance: 100, SortOrder: 1 }]} metric="carry" units="metres" />);

        expect(getByText('91 m')).toBeTruthy();
    });

    it('shouldShowDashWhenTheSelectedDistanceIsNotRecorded', () => {
        const { getByText } = render(<ClubDistanceReadList distances={[{ Id: 1, Club: 'Wedge', CarryDistance: 90, TotalDistance: 0, SortOrder: 1 }]} metric="total" units="yards" />);

        expect(getByText('-')).toBeTruthy();
    });

    it('shouldRenderNoRowsWhenThereAreNoDistances', () => {
        const { queryByTestId } = render(<ClubDistanceReadList distances={[]} metric="carry" units="yards" />);

        expect(queryByTestId('read-club-row-0')).toBeNull();
    });

    it('shouldGiveEachRowAStableTestId', () => {
        const { getByTestId } = render(<ClubDistanceReadList distances={distances} metric="carry" units="yards" />);

        expect(getByTestId('read-club-row-0')).toBeTruthy();
        expect(getByTestId('read-club-row-1')).toBeTruthy();
    });
});
