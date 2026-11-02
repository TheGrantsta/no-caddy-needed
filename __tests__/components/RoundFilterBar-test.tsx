import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RoundFilterBar from '../../components/RoundFilterBar';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('RoundFilterBar component', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('count segments', () => {
        it('shouldRenderThreeConnectedCountSegments', () => {
            const { getByTestId, getByText } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[]} />
            );

            expect(getByTestId('count-segments')).toBeTruthy();
            expect(getByText('Last 1')).toBeTruthy();
            expect(getByText('Last 10')).toBeTruthy();
            expect(getByText('All')).toBeTruthy();
        });

        it('shouldKeepEachCountLabelOnOneLine', () => {
            const { getByText } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[]} />
            );

            expect(getByText('Last 1').props.numberOfLines).toBe(1);
            expect(getByText('Last 10').props.numberOfLines).toBe(1);
        });

        it('shouldMarkOnlyTheSelectedCountAsSelected', () => {
            const { getByTestId } = render(
                <RoundFilterBar value={10} onChange={mockOnChange} years={[]} />
            );

            expect(getByTestId('filter-button-10').props.accessibilityState).toEqual({ selected: true });
            expect(getByTestId('filter-button-1').props.accessibilityState).toEqual({ selected: false });
            expect(getByTestId('filter-button-all').props.accessibilityState).toEqual({ selected: false });
        });

        it('shouldCallOnChangeWithTheChosenCount', () => {
            const { getByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[]} />
            );

            fireEvent.press(getByTestId('filter-button-1'));
            expect(mockOnChange).toHaveBeenLastCalledWith(1);

            fireEvent.press(getByTestId('filter-button-10'));
            expect(mockOnChange).toHaveBeenLastCalledWith(10);

            fireEvent.press(getByTestId('filter-button-all'));
            expect(mockOnChange).toHaveBeenLastCalledWith('all');
        });
    });

    describe('compact single row', () => {
        it('shouldNotRenderAShowLabelToSaveRoomOnTheRow', () => {
            const { queryByText, queryByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026]} />
            );

            expect(queryByText('Show')).toBeNull();
            expect(queryByTestId('filter-label')).toBeNull();
        });

        it('shouldPlaceCountSegmentsAndYearButtonInTheSameRow', () => {
            const { getByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026]} />
            );

            const row = getByTestId('filter-row');
            expect(row.findAll((n: any) => n.props.testID === 'count-segments').length).toBeGreaterThan(0);
            expect(row.findAll((n: any) => n.props.testID === 'year-menu-button').length).toBeGreaterThan(0);
        });

        it('shouldNotWrapTheRowOntoASecondLine', () => {
            const { getByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026]} />
            );

            const style = [getByTestId('filter-row').props.style].flat(Infinity)
                .reduce((acc: any, st: any) => ({ ...acc, ...st }), {});
            expect(style.flexWrap).toBeUndefined();
        });
    });

    describe('year menu', () => {
        it('shouldOmitTheYearMenuWhenThereAreNoYears', () => {
            const { queryByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[]} />
            );

            expect(queryByTestId('year-menu-button')).toBeNull();
        });

        it('shouldShowAYearMenuButtonLabelledYearWhenACountIsSelected', () => {
            const { getByTestId, getByText } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026, 2025]} />
            );

            expect(getByTestId('year-menu-button')).toBeTruthy();
            expect(getByText('Year ▾')).toBeTruthy();
        });

        it('shouldShowTheSelectedYearOnTheMenuButton', () => {
            const { getByText, getByTestId } = render(
                <RoundFilterBar value={{ year: 2025 }} onChange={mockOnChange} years={[2026, 2025]} />
            );

            expect(getByText('2025 ▾')).toBeTruthy();
            expect(getByTestId('year-menu-button').props.accessibilityState).toEqual({ selected: true, expanded: false });
        });

        it('shouldNotShowYearOptionsUntilTheMenuIsOpened', () => {
            const { queryByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026, 2025]} />
            );

            expect(queryByTestId('year-menu-list')).toBeNull();
            expect(queryByTestId('filter-button-2026')).toBeNull();
        });

        it('shouldListEveryYearWhenTheMenuIsOpened', () => {
            const { getByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026, 2025, 2024, 2023, 2022, 2021, 2020]} />
            );

            fireEvent.press(getByTestId('year-menu-button'));

            expect(getByTestId('year-menu-list')).toBeTruthy();
            expect(getByTestId('filter-button-2020')).toBeTruthy();
            expect(getByTestId('year-menu-button').props.accessibilityState).toEqual({ selected: false, expanded: true });
        });

        it('shouldCallOnChangeWithTheYearAndCloseTheMenuWhenAYearIsPicked', () => {
            const { getByTestId, queryByTestId } = render(
                <RoundFilterBar value="all" onChange={mockOnChange} years={[2026, 2025]} />
            );

            fireEvent.press(getByTestId('year-menu-button'));
            fireEvent.press(getByTestId('filter-button-2025'));

            expect(mockOnChange).toHaveBeenLastCalledWith({ year: 2025 });
            expect(queryByTestId('year-menu-list')).toBeNull();
        });

        it('shouldMarkTheSelectedYearInTheOpenList', () => {
            const { getByTestId } = render(
                <RoundFilterBar value={{ year: 2025 }} onChange={mockOnChange} years={[2026, 2025]} />
            );

            fireEvent.press(getByTestId('year-menu-button'));

            expect(getByTestId('filter-button-2025').props.accessibilityState).toEqual({ selected: true });
            expect(getByTestId('filter-button-2026').props.accessibilityState).toEqual({ selected: false });
        });

        it('shouldDeselectCountSegmentsWhenAYearIsSelected', () => {
            const { getByTestId } = render(
                <RoundFilterBar value={{ year: 2025 }} onChange={mockOnChange} years={[2026, 2025]} />
            );

            expect(getByTestId('filter-button-all').props.accessibilityState).toEqual({ selected: false });
        });
    });
});
