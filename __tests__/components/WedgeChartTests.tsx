import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import WedgeChart from '../../components/WedgeChart';
import type { WedgeChartData } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('WedgeChart component', () => {
    const emptyData: WedgeChartData = { distanceNames: [], clubs: [] };

    const populatedData: WedgeChartData = {
        distanceNames: ['1/2', '3/4', 'Full'],
        clubs: [
            { club: 'PW', distances: [{ name: '1/2', distance: 90 }, { name: '3/4', distance: 110 }, { name: 'Full', distance: 130 }] },
            { club: 'SW', distances: [{ name: '1/2', distance: 50 }, { name: '3/4', distance: 70 }, { name: 'Full', distance: 90 }] },
        ],
    };

    it('renders table header with Club label', () => {
        const { getByText } = render(<WedgeChart data={emptyData} />);

        expect(getByText('Club')).toBeTruthy();
    });

    it('renders distance name inputs when data has distance names', () => {
        const { getByTestId } = render(<WedgeChart data={populatedData} />);

        expect(getByTestId('distance-name-input-0').props.value).toBe('1/2');
        expect(getByTestId('distance-name-input-1').props.value).toBe('3/4');
        expect(getByTestId('distance-name-input-2').props.value).toBe('Full');
    });

    it('renders club names in inputs', () => {
        const { getByTestId } = render(<WedgeChart data={populatedData} />);

        expect(getByTestId('wedge-club-input-0').props.value).toBe('PW');
        expect(getByTestId('wedge-club-input-1').props.value).toBe('SW');
    });

    it('renders distance values in inputs', () => {
        const { getByTestId } = render(<WedgeChart data={populatedData} />);

        expect(getByTestId('wedge-distance-input-0-0').props.value).toBe('90');
        expect(getByTestId('wedge-distance-input-0-2').props.value).toBe('130');
        expect(getByTestId('wedge-distance-input-1-0').props.value).toBe('50');
    });

    it('shows add club button when fewer than 4 clubs', () => {
        const { getByTestId } = render(<WedgeChart data={emptyData} />);

        expect(getByTestId('add-wedge-club-button')).toBeTruthy();
    });

    it('hides add club button when 4 clubs exist', () => {
        const fourClubs: WedgeChartData = {
            distanceNames: ['Full'],
            clubs: [
                { club: 'PW', distances: [{ name: 'Full', distance: 130 }] },
                { club: 'GW', distances: [{ name: 'Full', distance: 110 }] },
                { club: 'SW', distances: [{ name: 'Full', distance: 90 }] },
                { club: 'LW', distances: [{ name: 'Full', distance: 70 }] },
            ],
        };

        const { queryByTestId } = render(<WedgeChart data={fourClubs} />);

        expect(queryByTestId('add-wedge-club-button')).toBeNull();
    });

    it('shows add distance button when fewer than 6 distances', () => {
        const { getByTestId } = render(<WedgeChart data={emptyData} />);

        expect(getByTestId('add-wedge-distance-button')).toBeTruthy();
    });

    it('hides add distance button when 6 distances exist', () => {
        const sixDistances: WedgeChartData = {
            distanceNames: ['1', '2', '3', '4', '5', '6'],
            clubs: [],
        };

        const { queryByTestId } = render(<WedgeChart data={sixDistances} />);

        expect(queryByTestId('add-wedge-distance-button')).toBeNull();
    });

    it('adds a new club row when add club is pressed', () => {
        const dataWithOneDistance: WedgeChartData = {
            distanceNames: ['Full'],
            clubs: [],
        };

        const { getByTestId } = render(<WedgeChart data={dataWithOneDistance} />);

        fireEvent.press(getByTestId('add-wedge-club-button'));

        expect(getByTestId('wedge-club-input-0')).toBeTruthy();
        expect(getByTestId('wedge-distance-input-0-0')).toBeTruthy();
    });

    it('adds a new distance column when add distance is pressed', () => {
        const dataWithOneClub: WedgeChartData = {
            distanceNames: ['Full'],
            clubs: [{ club: 'PW', distances: [{ name: 'Full', distance: 130 }] }],
        };

        const { getByTestId } = render(<WedgeChart data={dataWithOneClub} />);

        fireEvent.press(getByTestId('add-wedge-distance-button'));

        expect(getByTestId('distance-name-input-1')).toBeTruthy();
        expect(getByTestId('wedge-distance-input-0-1')).toBeTruthy();
    });

    it('shows save button', () => {
        const { getByTestId } = render(<WedgeChart data={emptyData} />);

        expect(getByTestId('save-wedge-chart-button')).toBeTruthy();
    });

    it('calls onSave with chart data when save is pressed', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(<WedgeChart data={populatedData} onSave={mockOnSave} />);

        fireEvent.press(getByTestId('save-wedge-chart-button'));

        expect(mockOnSave).toHaveBeenCalledWith(populatedData);
    });
});
