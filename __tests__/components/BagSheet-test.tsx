import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import BagSheet from '../../components/BagSheet';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const clubs = [
    { Id: 1, Club: '6 Iron', CarryDistance: 165, TotalDistance: 175, SortOrder: 1 },
    { Id: 2, Club: 'Pitching Wedge', CarryDistance: 120, TotalDistance: 128, SortOrder: 2 },
];

const wedges = {
    distanceNames: ['Full'],
    clubs: [{ club: 'GW', distances: [{ name: 'Full', distance: 105 }] }],
};

const renderSheet = (overrides: Partial<React.ComponentProps<typeof BagSheet>> = {}) => {
    const props = {
        visible: true,
        onClose: jest.fn(),
        clubDistances: clubs,
        wedgeChart: wedges,
        units: 'yards' as const,
        ...overrides,
    };
    return { props, ...render(<BagSheet {...props} />) };
};

describe('BagSheet', () => {
    it('shouldShowTheYardagesTitle', () => {
        const { getByText } = renderSheet();

        expect(getByText('Yardages')).toBeTruthy();
    });

    it('shouldOfferDistancesAndWedgesTabs', () => {
        const { getByTestId } = renderSheet();

        expect(getByTestId('bag-sheet-tab-distances')).toBeTruthy();
        expect(getByTestId('bag-sheet-tab-wedges')).toBeTruthy();
    });

    it('shouldShowEachClubsCarryInYardsOnTheDistancesTab', () => {
        const { getByText, queryByText } = renderSheet();

        expect(getByText('6 Iron')).toBeTruthy();
        expect(getByText('165 yd')).toBeTruthy();
        expect(getByText('Pitching Wedge')).toBeTruthy();
        expect(getByText('120 yd')).toBeTruthy();
        expect(queryByText('175 yd')).toBeNull();
    });

    it('shouldPutTheDistancesInAScrollableList', () => {
        const { getByTestId } = renderSheet();

        expect(getByTestId('bag-sheet-distances')).toBeTruthy();
        expect(getByTestId('bag-sheet-distances').props.style).toEqual(expect.objectContaining({ maxHeight: expect.any(Number) }));
    });

    it('shouldShowTheWedgesWhenTheWedgesTabIsPressed', () => {
        const { getByTestId, getByText, queryByText } = renderSheet();

        fireEvent.press(getByTestId('bag-sheet-tab-wedges'));

        expect(getByText('GW')).toBeTruthy();
        expect(queryByText('6 Iron')).toBeNull();
    });

    it('shouldShowTheCarryNoteUnderTheList', () => {
        const { getByText } = renderSheet();

        expect(getByText('Carry, yards.')).toBeTruthy();
    });

    it('shouldCloseWhenTheCloseButtonIsPressed', () => {
        const { getByTestId, props } = renderSheet();

        fireEvent.press(getByTestId('bag-sheet-close-button'));

        expect(props.onClose).toHaveBeenCalled();
    });

    it('shouldNotShowWhenNotVisible', () => {
        const { queryByText } = renderSheet({ visible: false });

        expect(queryByText('Yardages')).toBeNull();
    });

    it('shouldAlignEachWedgeMeasurementInAFixedRightAlignedColumn', () => {
        const { StyleSheet } = require('react-native');
        const data = {
            distanceNames: ['Waist', 'Rib'],
            clubs: [
                { club: '54', distances: [{ name: 'Waist', distance: 55 }, { name: 'Rib', distance: 0 }] },
                { club: '58', distances: [{ name: 'Waist', distance: 0 }, { name: 'Rib', distance: 65 }] },
            ],
        };
        const { getByTestId } = renderSheet({ wedgeChart: data as any });
        fireEvent.press(getByTestId('bag-sheet-tab-wedges'));

        const firstWaist = StyleSheet.flatten(getByTestId('wedge-cell-54-Waist').props.style);
        const secondWaist = StyleSheet.flatten(getByTestId('wedge-cell-58-Waist').props.style);
        expect(firstWaist.width).toBeGreaterThan(0);
        expect(secondWaist.width).toBe(firstWaist.width);
        expect(firstWaist.alignItems).toBe('flex-end');
        expect(getByTestId('wedge-value-54-Waist')).toHaveTextContent('55');
        expect(getByTestId('wedge-value-58-Rib')).toHaveTextContent('65');
    });
});
