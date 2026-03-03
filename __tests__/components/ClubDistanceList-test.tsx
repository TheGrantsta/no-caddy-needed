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

    it('updatesClubNameWhenInputChanges', () => {
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        fireEvent.changeText(getByTestId('club-input-0'), '3 Iron');

        expect(getByTestId('club-input-0').props.value).toBe('3 Iron');
    });

    it('updatesDistanceValueWhenInputChanges', () => {
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        fireEvent.changeText(getByTestId('distance-input-0'), '260');

        expect(getByTestId('distance-input-0').props.value).toBe('260');
    });

    it('distanceInputUsesNumberPadKeyboard', () => {
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        expect(getByTestId('distance-input-0').props.keyboardType).toBe('number-pad');
    });

    it('callsOnSaveWithFormattedDataWhenSavePressed', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} onSave={mockOnSave} />
        );

        fireEvent.press(getByTestId('save-distances-button'));

        expect(mockOnSave).toHaveBeenCalledWith([
            { Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
            { Club: '3 Wood', CarryDistance: 230, TotalDistance: 245, SortOrder: 2 },
            { Club: '5 Iron', CarryDistance: 180, TotalDistance: 190, SortOrder: 3 },
        ]);
    });

    it('doesNotThrowWhenSavePressedWithoutOnSaveProp', () => {
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} />
        );

        expect(() => fireEvent.press(getByTestId('save-distances-button'))).not.toThrow();
    });

    it('filtersOutRowsWithEmptyClubOnSave', () => {
        const mockOnSave = jest.fn();
        const distancesWithBlank = [
            { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
            { Id: 2, Club: '', CarryDistance: 200, TotalDistance: 210, SortOrder: 2 },
        ];

        const { getByTestId } = render(
            <ClubDistanceList distances={distancesWithBlank} onSave={mockOnSave} />
        );
        fireEvent.press(getByTestId('save-distances-button'));

        const saved = mockOnSave.mock.calls[0][0];
        expect(saved).toHaveLength(1);
        expect(saved[0].Club).toBe('Driver');
    });

    it('filtersOutRowsWithEmptyDistanceOnSave', () => {
        const mockOnSave = jest.fn();
        const distancesWithBlank = [
            { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
            { Id: 2, Club: '3 Wood', CarryDistance: 0, TotalDistance: 0, SortOrder: 2 },
        ];

        const { getByTestId } = render(
            <ClubDistanceList distances={distancesWithBlank} onSave={mockOnSave} />
        );

        fireEvent.changeText(getByTestId('distance-input-1'), '');
        fireEvent.press(getByTestId('save-distances-button'));

        const saved = mockOnSave.mock.calls[0][0];
        expect(saved).toHaveLength(1);
        expect(saved[0].Club).toBe('Driver');
    });

    it('savesNonNumericDistanceAsZero', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} onSave={mockOnSave} />
        );

        fireEvent.changeText(getByTestId('distance-input-0'), 'abc');
        fireEvent.press(getByTestId('save-distances-button'));

        const saved = mockOnSave.mock.calls[0][0];
        expect(saved[0].CarryDistance).toBe(0);
    });

    it('assignsCorrectSortOrderOnSave', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} onSave={mockOnSave} />
        );

        fireEvent.press(getByTestId('save-distances-button'));

        const saved = mockOnSave.mock.calls[0][0];
        expect(saved[0].SortOrder).toBe(1);
        expect(saved[1].SortOrder).toBe(2);
        expect(saved[2].SortOrder).toBe(3);
    });

    it('hidesAddClubLabelWhenFourteenDistancesExist', () => {
        const fourteenClubs = Array.from({ length: 14 }, (_, i) => ({
            Id: i + 1, Club: `Club ${i + 1}`, CarryDistance: 100, TotalDistance: 110, SortOrder: i + 1,
        }));

        const { queryByText } = render(
            <ClubDistanceList distances={fourteenClubs} />
        );

        expect(queryByText('+ Add club')).toBeNull();
    });

    it('savesUpdatedClubNameAfterEditing', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} onSave={mockOnSave} />
        );

        fireEvent.changeText(getByTestId('club-input-0'), 'Big Stick');
        fireEvent.press(getByTestId('save-distances-button'));

        const saved = mockOnSave.mock.calls[0][0];
        expect(saved[0].Club).toBe('Big Stick');
    });

    it('trimmsWhitespaceFromClubNameOnSave', () => {
        const mockOnSave = jest.fn();
        const { getByTestId } = render(
            <ClubDistanceList distances={mockDistances} onSave={mockOnSave} />
        );

        fireEvent.changeText(getByTestId('club-input-0'), '  Driver  ');
        fireEvent.press(getByTestId('save-distances-button'));

        const saved = mockOnSave.mock.calls[0][0];
        expect(saved[0].Club).toBe('Driver');
    });
});
