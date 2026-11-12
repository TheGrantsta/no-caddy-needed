import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeHero from '../../components/HomeHero';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe('HomeHero', () => {
    it('shouldShowTheHeadlineAndSupportingLine', () => {
        const { getByText } = render(<HomeHero />);

        expect(getByText('Be your own best caddy')).toBeTruthy();
        expect(getByText('Golf is not a game of perfect, or having a perfect swing')).toBeTruthy();
    });

    it('shouldShowAStartARoundButtonLinkedToPlay', () => {
        const { getByTestId, getByText } = render(<HomeHero />);

        expect(getByText('Start a round')).toBeTruthy();
        expect(getByTestId('home-start-round')).toBeTruthy();
    });

    it('shouldOpenPlayWhenStartARoundIsPressed', () => {
        const { getByTestId } = render(<HomeHero />);

        fireEvent.press(getByTestId('home-start-round'));

        expect(mockPush).toHaveBeenCalledWith('/play');
    });

    it('shouldStretchTheButtonAcrossTheCard', () => {
        const { getByTestId } = render(<HomeHero />);

        expect(getByTestId('home-start-round')).toHaveStyle({ width: '100%' });
    });
});
