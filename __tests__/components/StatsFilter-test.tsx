import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import StatsFilter from '../../components/StatsFilter';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name, testID }: { name: string; testID?: string }) => <Text testID={testID}>{name}</Text> };
});

const rounds = [{ Year: 2026 }, { Year: 2026 }, { Year: 2026 }, { Year: 2025 }, { Year: 2025 }, { Year: 2025 }, { Year: 2025 }];

const renderFilter = (overrides: object = {}) => {
    const onChange = jest.fn();
    const utils = render(
        <StatsFilter value="all" onChange={onChange} rounds={rounds} {...overrides} />
    );
    return { ...utils, onChange };
};

describe('StatsFilter', () => {
    it('shouldShowTheCurrentFilterNameOnThePill', () => {
        const { getByTestId, getByText } = renderFilter();

        expect(getByTestId('stats-filter-button')).toBeTruthy();
        expect(getByText('All rounds')).toBeTruthy();
    });

    it('shouldNotShowABasedOnRoundCountNextToTheFilter', () => {
        const { queryByText } = renderFilter();

        expect(queryByText(/Based on/)).toBeNull();
    });

    it('shouldOpenAMenuWithRoundsAndYearSectionsWhenThePillIsPressed', () => {
        const { getByTestId, getByText, queryByTestId } = renderFilter();
        expect(queryByTestId('stats-filter-menu')).toBeNull();

        fireEvent.press(getByTestId('stats-filter-button'));

        expect(getByTestId('stats-filter-menu')).toBeTruthy();
        expect(getByText('Rounds')).toBeTruthy();
        expect(getByText('Year')).toBeTruthy();
        expect(getByText('Last round')).toBeTruthy();
        expect(getByText('Last 10 rounds')).toBeTruthy();
    });

    it('shouldShowEachYearWithTheNumberOfRoundsPlayedThatYear', () => {
        const { getByTestId, getByText } = renderFilter();

        fireEvent.press(getByTestId('stats-filter-button'));

        expect(getByText('All years')).toBeTruthy();
        expect(getByText('2026')).toBeTruthy();
        expect(getByText('3')).toBeTruthy();
        expect(getByText('2025')).toBeTruthy();
        expect(getByText('4')).toBeTruthy();
    });

    it('shouldTickTheSelectedRoundsOption', () => {
        const { getByTestId, queryByTestId } = renderFilter({ value: 'all' });

        fireEvent.press(getByTestId('stats-filter-button'));

        expect(getByTestId('stats-filter-check-all')).toBeTruthy();
        expect(queryByTestId('stats-filter-check-1')).toBeNull();
    });

    it('shouldTickTheSelectedYearOption', () => {
        const { getByTestId } = renderFilter({ value: { year: 2025 } });

        fireEvent.press(getByTestId('stats-filter-button'));

        expect(getByTestId('stats-filter-check-2025')).toBeTruthy();
    });

    it('shouldChooseLastRoundAndCloseTheMenu', () => {
        const { getByTestId, onChange, queryByTestId } = renderFilter();

        fireEvent.press(getByTestId('stats-filter-button'));
        fireEvent.press(getByTestId('stats-filter-option-1'));

        expect(onChange).toHaveBeenCalledWith(1);
        expect(queryByTestId('stats-filter-menu')).toBeNull();
    });

    it('shouldChooseAYearFilterFromTheYearList', () => {
        const { getByTestId, onChange } = renderFilter();

        fireEvent.press(getByTestId('stats-filter-button'));
        fireEvent.press(getByTestId('stats-filter-option-2025'));

        expect(onChange).toHaveBeenCalledWith({ year: 2025 });
    });

    it('shouldReturnToAllWhenAllYearsIsChosen', () => {
        const { getByTestId, onChange } = renderFilter({ value: { year: 2025 } });

        fireEvent.press(getByTestId('stats-filter-button'));
        fireEvent.press(getByTestId('stats-filter-option-all-years'));

        expect(onChange).toHaveBeenCalledWith('all');
    });
});
