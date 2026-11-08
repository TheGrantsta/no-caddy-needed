import React from 'react';
import { render } from '@testing-library/react-native';
import WedgeChartReadList from '../../components/WedgeChartReadList';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const data = {
    distanceNames: ['½', '¾', 'Full'],
    clubs: [
        {
            club: 'PW',
            distances: [
                { name: '½', distance: 75 },
                { name: '¾', distance: 100 },
                { name: 'Full', distance: 120 },
            ],
        },
        {
            club: 'GW',
            distances: [
                { name: '½', distance: 65 },
                { name: '¾', distance: 88 },
                { name: 'Full', distance: 105 },
            ],
        },
    ],
};

describe('WedgeChartReadList', () => {
    it('shouldShowAWedgeHeaderAndEachDistanceNameAsColumnHeaders', () => {
        const { getByText } = render(<WedgeChartReadList data={data} units="yards" />);

        expect(getByText('Club')).toBeTruthy();
        expect(getByText('½')).toBeTruthy();
        expect(getByText('¾')).toBeTruthy();
        expect(getByText('Full')).toBeTruthy();
    });

    it('shouldShowEachClubNameInItsOwnRow', () => {
        const { getByTestId, getByText } = render(<WedgeChartReadList data={data} units="yards" />);

        expect(getByTestId('wedge-read-row-0')).toBeTruthy();
        expect(getByTestId('wedge-read-row-1')).toBeTruthy();
        expect(getByText('PW')).toBeTruthy();
        expect(getByText('GW')).toBeTruthy();
    });

    it('shouldShowTheCarryValueForEachClubAndDistance', () => {
        const { getByText } = render(<WedgeChartReadList data={data} units="yards" />);

        expect(getByText('75')).toBeTruthy();
        expect(getByText('100')).toBeTruthy();
        expect(getByText('120')).toBeTruthy();
        expect(getByText('65')).toBeTruthy();
    });

    it('shouldShowDashWhereAValueIsNotRecorded', () => {
        const sparse = {
            distanceNames: ['Full'],
            clubs: [{ club: 'SW', distances: [{ name: 'Full', distance: 0 }] }],
        };
        const { getByText } = render(<WedgeChartReadList data={sparse} units="yards" />);

        expect(getByText('-')).toBeTruthy();
    });

    it('shouldShowMetresWhenMetresUnitSelected', () => {
        const single = {
            distanceNames: ['Full'],
            clubs: [{ club: 'PW', distances: [{ name: 'Full', distance: 100 }] }],
        };
        const { getByText } = render(<WedgeChartReadList data={single} units="metres" />);

        expect(getByText('91')).toBeTruthy();
    });

    it('shouldRenderNoRowsWhenThereAreNoClubs', () => {
        const { queryByTestId } = render(<WedgeChartReadList data={{ distanceNames: [], clubs: [] }} units="yards" />);

        expect(queryByTestId('wedge-read-row-0')).toBeNull();
    });
});
