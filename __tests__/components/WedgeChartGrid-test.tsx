import React from 'react';
import { render, screen } from '@testing-library/react-native';
import WedgeChartGrid from '@/components/WedgeChartGrid';
import { WedgeChartData } from '@/service/DbService';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        accent: '#00C851',
    }),
}));

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        wedgeChartGrid: {
            scrollContainer: {},
            container: {},
            headerRow: {},
            labelCell: {},
            labelText: {},
            clubHeaderCell: {},
            clubHeaderText: {},
            dataRow: {},
            swingTypeCell: {},
            swingTypeText: {},
            dataCell: {},
            highlightedCell: {},
            dataText: {},
            highlightedText: {},
        },
    }),
}));

describe('WedgeChartGrid', () => {
    const mockData: WedgeChartData = {
        clubs: [
            {
                club: '54°',
                distances: [
                    { name: 'Full', distance: 41 },
                    { name: 'Three-quarter', distance: 54 },
                    { name: 'Half', distance: 63 },
                ],
            },
            {
                club: '58°',
                distances: [
                    { name: 'Full', distance: 33 },
                    { name: 'Three-quarter', distance: 39 },
                    { name: 'Half', distance: 47 },
                ],
            },
        ],
        distanceNames: ['Full', 'Three-quarter', 'Half'],
    };

    it('should not render the Club label', () => {
        const suggestedClubs = [
            { club: '54°', name: 'Full', distance: 41 },
            { club: '58°', name: 'Three-quarter', distance: 39 },
        ];

        const { UNSAFE_getAllByType } = render(
            <WedgeChartGrid data={mockData} suggestedClubs={suggestedClubs} />,
        );
        const textElements = UNSAFE_getAllByType(require('react-native').Text);
        const clubLabelText = textElements
            .map((el: any) => el.props.children)
            .find((text: any) => text === 'Club');
        expect(clubLabelText).toBeUndefined();
    });

    it('should show all columns even if only some have matching suggestions', () => {
        const dataWithMultipleDistances: WedgeChartData = {
            clubs: [
                {
                    club: '58°',
                    distances: [
                        { name: 'Full', distance: 33 },
                        { name: 'Three-quarter', distance: 39 },
                        { name: 'Half', distance: 47 },
                    ],
                },
            ],
            distanceNames: ['Full', 'Three-quarter', 'Half'],
        };

        // Only Three-quarter column matches
        const suggestedClubs = [
            { club: '58°', name: 'Three-quarter', distance: 39 },
        ];

        const { UNSAFE_getAllByType, queryByText } = render(
            <WedgeChartGrid data={dataWithMultipleDistances} suggestedClubs={suggestedClubs} />,
        );

        // All columns should be visible
        expect(queryByText('Full')).toBeTruthy();
        expect(queryByText('Three-quarter')).toBeTruthy();
        expect(queryByText('Half')).toBeTruthy();
    });

    it('should show all rows even if only some have matching suggestions', () => {
        const dataWithMultipleClubs: WedgeChartData = {
            clubs: [
                {
                    club: '54°',
                    distances: [
                        { name: 'Full', distance: 41 },
                        { name: 'Three-quarter', distance: 54 },
                        { name: 'Half', distance: 63 },
                    ],
                },
                {
                    club: '58°',
                    distances: [
                        { name: 'Full', distance: 33 },
                        { name: 'Three-quarter', distance: 39 },
                        { name: 'Half', distance: 47 },
                    ],
                },
            ],
            distanceNames: ['Full', 'Three-quarter', 'Half'],
        };

        // Only 58° Three-quarter matches
        const suggestedClubs = [
            { club: '58°', name: 'Three-quarter', distance: 39 },
        ];

        const { queryByText } = render(
            <WedgeChartGrid data={dataWithMultipleClubs} suggestedClubs={suggestedClubs} />,
        );

        // Both rows should be visible
        expect(queryByText('54°')).toBeTruthy();
        expect(queryByText('58°')).toBeTruthy();
    });

    it('should render all clubs and distances when they have data', () => {
        const suggestedClubs = [
            { club: '54°', name: 'Full', distance: 41 },
            { club: '54°', name: 'Three-quarter', distance: 54 },
            { club: '54°', name: 'Half', distance: 63 },
            { club: '58°', name: 'Full', distance: 33 },
            { club: '58°', name: 'Three-quarter', distance: 39 },
            { club: '58°', name: 'Half', distance: 47 },
        ];

        const { UNSAFE_getAllByType } = render(
            <WedgeChartGrid data={mockData} suggestedClubs={suggestedClubs} />,
        );

        const textElements = UNSAFE_getAllByType(
            require('react-native').Text,
        );
        const allText = textElements.map((el: any) => el.props.children).join('');

        expect(allText).toContain('54°');
        expect(allText).toContain('58°');
        expect(allText).toContain('Full');
    });
});
