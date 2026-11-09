import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeQuickTools from '../../components/HomeQuickTools';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe('HomeQuickTools', () => {
    it('shouldShowWindTempoAndRandomTiles', () => {
        const { getByText } = render(<HomeQuickTools />);

        expect(getByText('Wind')).toBeTruthy();
        expect(getByText('Tempo')).toBeTruthy();
        expect(getByText('Random')).toBeTruthy();
    });

    it('shouldLinkEachTileToItsTool', () => {
        const { getByTestId } = render(<HomeQuickTools />);

        expect(getByTestId('home-tool-wind')).toBeTruthy();
        expect(getByTestId('home-tool-tempo')).toBeTruthy();
        expect(getByTestId('home-tool-random')).toBeTruthy();
    });

    it('shouldOpenEachToolWhenItsTileIsPressed', () => {
        const { getByTestId } = render(<HomeQuickTools />);

        fireEvent.press(getByTestId('home-tool-wind'));
        fireEvent.press(getByTestId('home-tool-tempo'));
        fireEvent.press(getByTestId('home-tool-random'));

        expect(mockPush).toHaveBeenNthCalledWith(1, '/tools/wind');
        expect(mockPush).toHaveBeenNthCalledWith(2, '/tools/tempo');
        expect(mockPush).toHaveBeenNthCalledWith(3, '/tools/random');
    });

    it('shouldGiveEveryToolTileTheSameSize', () => {
        const { getByTestId } = render(<HomeQuickTools />);

        for (const slug of ['wind', 'tempo', 'random']) {
            expect(getByTestId(`home-tool-${slug}`)).toHaveStyle({ flex: 1, height: 110 });
        }
    });
});
