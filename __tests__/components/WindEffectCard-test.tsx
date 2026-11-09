import React from 'react';
import { render } from '@testing-library/react-native';
import WindEffectCard from '../../components/WindEffectCard';
import type { WindEffect } from '../../service/WeatherService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return {
        MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
    };
});

const tailwindWithCrossWind: WindEffect = {
    alongComponentMph: 3,
    crossComponentMph: 5,
    playsLongerPercent: -1.5,
    category: 'tailwind',
    crossDirection: 'left',
};

describe('WindEffectCard', () => {
    it('shouldShowTheEffectSectionLabel', () => {
        const { getByText } = render(<WindEffectCard effect={tailwindWithCrossWind} />);

        expect(getByText('EFFECT ON YOUR SHOT')).toBeTruthy();
    });

    it('shouldShowTheHeadlineAndSubtitleDescribingTheWind', () => {
        const { getByText } = render(<WindEffectCard effect={tailwindWithCrossWind} />);

        expect(getByText('Plays shorter')).toBeTruthy();
        expect(getByText('Helping, left to right')).toBeTruthy();
    });

    it('shouldShowAnAirIconInABlueTile', () => {
        const { getByTestId, getByText } = render(<WindEffectCard effect={tailwindWithCrossWind} />);

        expect(getByText('air')).toBeTruthy();
        expect(getByTestId('wind-effect-icon')).toHaveStyle({ backgroundColor: '#1F6FB2' });
    });

    it('shouldListEachComponentWithItsSpeedBelowTheHeadline', () => {
        const { getByText } = render(<WindEffectCard effect={tailwindWithCrossWind} />);

        expect(getByText('Helping')).toBeTruthy();
        expect(getByText('3 mph')).toBeTruthy();
        expect(getByText('Left to right')).toBeTruthy();
        expect(getByText('5 mph')).toBeTruthy();
    });

    it('shouldShowNoRowsWhenThereIsNoWind', () => {
        const calm: WindEffect = { alongComponentMph: 0, crossComponentMph: 0, playsLongerPercent: 0, category: 'calm', crossDirection: null };
        const { queryByText, getByText } = render(<WindEffectCard effect={calm} />);

        expect(getByText('Plays about the same')).toBeTruthy();
        expect(queryByText('mph', { exact: false })).toBeNull();
    });
});
