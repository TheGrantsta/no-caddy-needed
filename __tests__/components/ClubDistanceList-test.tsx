import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ClubDistanceList from '../../components/ClubDistanceList';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('ClubDistanceList component', () => {
    const mockDistances = [
        { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
        { Id: 2, Club: '3 Wood', CarryDistance: 230, TotalDistance: 245, SortOrder: 2 },
        { Id: 3, Club: '5 Iron', CarryDistance: 180, TotalDistance: 190, SortOrder: 3 },
    ];

    it('displays club names in inputs', () => {
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        expect(getByTestId('club-input-0').props.value).toBe('Driver');
        expect(getByTestId('club-input-1').props.value).toBe('3 Wood');
        expect(getByTestId('club-input-2').props.value).toBe('5 Iron');
    });

    it('displays carry distances in inputs', () => {
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        expect(getByTestId('distance-input-0').props.value).toBe('250');
        expect(getByTestId('distance-input-1').props.value).toBe('230');
        expect(getByTestId('distance-input-2').props.value).toBe('180');
    });

    it('displays table headers', () => {
        const { getByText } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        expect(getByText('Club')).toBeTruthy();
        expect(getByText('Distance')).toBeTruthy();
    });

    it('shows Save button', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} onSave={mockOnSave} />
        );

        expect(getByTestId('save-distances-button')).toBeTruthy();
    });

    it('shows Add club button', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={[]} onSave={mockOnSave} />
        );

        expect(getByTestId('add-club-button')).toBeTruthy();
    });

    it('adds a new row when Add club is pressed', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={[]} onSave={mockOnSave} />
        );

        fireEvent.press(getByTestId('add-club-button'));

        expect(getByTestId('club-input-0')).toBeTruthy();
        expect(getByTestId('distance-input-0')).toBeTruthy();
    });
});
