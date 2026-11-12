import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeGolfSimplified from '../../components/HomeGolfSimplified';

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe('HomeGolfSimplified', () => {
    it('shouldShowTheGolfSimplifiedCardClosedByDefault', () => {
        const { getByText, queryByText } = render(<HomeGolfSimplified />);

        expect(getByText('Golf, simplified')).toBeTruthy();
        expect(queryByText('Enjoyment: golf is a game')).toBeNull();
    });

    it('shouldOpenToItsPointsWhenTapped', () => {
        const { getByTestId, getByText } = render(<HomeGolfSimplified />);

        fireEvent.press(getByTestId('golf-simplified-row'));

        expect(getByText('Enjoyment: golf is a game')).toBeTruthy();
    });
});
