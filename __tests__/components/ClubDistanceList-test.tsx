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
        expect(getByText('Carry (yd)')).toBeTruthy();
    });

    it('shouldShowMetresInCarryHeadingWhenMetresSelected', () => {
        const { getByText, queryByText } = render(
            <ClubDistanceList distances={mockDistances} units="metres" />
        );

        expect(getByText('Carry (m)')).toBeTruthy();
        expect(queryByText('Carry (yd)')).toBeNull();
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

    describe('edit layout matches the read-only list', () => {
        const colours = require('../../assets/colours').default;

        it('shouldRenderRowsInsideAWhiteRoundedCard', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);
            const { StyleSheet } = require('react-native');

            const cardStyle = StyleSheet.flatten(getByTestId('edit-distances-card').props.style);

            expect(cardStyle.backgroundColor).toBe(colours.backgroundLight);
            expect(cardStyle.borderRadius).toBeGreaterThanOrEqual(14);
        });

        it('shouldShowUppercaseClubAndCarryColumnHeaders', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} units="yards" />);
            const { StyleSheet } = require('react-native');

            expect(getByTestId('edit-header-club')).toHaveTextContent('Club');
            expect(getByTestId('edit-header-carry')).toHaveTextContent('Carry (yd)');
            expect(StyleSheet.flatten(getByTestId('edit-header-carry').props.style).textTransform).toBe('uppercase');
        });

        it('shouldRightAlignDistanceInputsLikeTheReadOnlyList', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);
            const { StyleSheet } = require('react-native');

            expect(StyleSheet.flatten(getByTestId('distance-input-0').props.style).textAlign).toBe('right');
        });

        it('shouldShowHairlineDividerBetweenRows', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);
            const { StyleSheet } = require('react-native');

            expect(StyleSheet.flatten(getByTestId('edit-row-1').props.style).borderTopWidth).toBeGreaterThan(0);
            expect(StyleSheet.flatten(getByTestId('edit-row-0').props.style).borderTopWidth ?? 0).toBe(0);
        });
    });

    describe('carry and total distances', () => {
        it('shouldShowTotalColumnHeaderAlongsideCarry', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} units="yards" />);

            expect(getByTestId('edit-header-carry')).toHaveTextContent('Carry (yd)');
            expect(getByTestId('edit-header-total')).toHaveTextContent('Total (yd)');
        });

        it('shouldShowTotalInputPrefilledForEachClub', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);

            expect(getByTestId('total-input-0').props.value).toBe('270');
            expect(getByTestId('total-input-1').props.value).toBe('245');
        });

        it('shouldSaveEditedTotalDistanceForEachClub', () => {
            const onSave = jest.fn();
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} onSave={onSave} />);

            fireEvent.changeText(getByTestId('total-input-0'), '260');
            fireEvent.press(getByTestId('save-distances-button'));

            expect(onSave.mock.calls[0][0][0]).toEqual(
                expect.objectContaining({ Club: 'Driver', CarryDistance: 250, TotalDistance: 260 })
            );
        });

        it('shouldSaveZeroTotalDistanceWhenTotalLeftBlank', () => {
            const onSave = jest.fn();
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} onSave={onSave} />);

            fireEvent.changeText(getByTestId('total-input-1'), '');
            fireEvent.press(getByTestId('save-distances-button'));

            expect(onSave.mock.calls[0][0][1]).toEqual(
                expect.objectContaining({ Club: '3 Wood', TotalDistance: 0 })
            );
        });

        it('shouldShowBlankTotalInputForNewClubRow', () => {
            const { getByTestId } = render(<ClubDistanceList distances={[]} />);

            fireEvent.press(getByTestId('add-club-button'));

            expect(getByTestId('total-input-0').props.value).toBe('');
        });
    });

    describe('total and carry columns behave the same', () => {
        const { StyleSheet } = require('react-native');

        it('shouldAcceptMultiDigitTotalEntryLikeCarry', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);

            fireEvent.changeText(getByTestId('total-input-1'), '2');
            fireEvent.changeText(getByTestId('total-input-1'), '25');
            fireEvent.changeText(getByTestId('total-input-1'), '250');

            expect(getByTestId('total-input-1').props.value).toBe('250');
        });

        it('shouldGiveTotalInputTheSameWidthAsCarryInput', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);

            const carry = StyleSheet.flatten(getByTestId('distance-input-0').props.style);
            const total = StyleSheet.flatten(getByTestId('total-input-0').props.style);

            expect(total.width).toBe(carry.width);
            expect(total.flex ?? 0).toBe(carry.flex ?? 0);
        });

        it('shouldAlignEachColumnHeaderWithItsValues', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} />);

            ['carry', 'total'].forEach(column => {
                const header = StyleSheet.flatten(getByTestId(`edit-header-${column}`).props.style);
                const value = StyleSheet.flatten(getByTestId(`${column === 'carry' ? 'distance' : 'total'}-input-0`).props.style);
                expect(header.width).toBe(value.width);
                expect(header.flex ?? 0).toBe(value.flex ?? 0);
            });
        });
    });

    describe('column width', () => {
        const { StyleSheet } = require('react-native');

        it('shouldGiveCarryAndTotalColumnsEnoughWidthForHeadersOnOneLine', () => {
            const { getByTestId } = render(<ClubDistanceList distances={mockDistances} units="yards" />);

            expect(StyleSheet.flatten(getByTestId('edit-header-carry').props.style).width).toBeGreaterThanOrEqual(120);
            expect(StyleSheet.flatten(getByTestId('edit-header-total').props.style).width).toBeGreaterThanOrEqual(120);
        });
    });
});
