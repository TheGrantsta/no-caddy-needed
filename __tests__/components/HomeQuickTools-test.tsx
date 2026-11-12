import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeQuickTools from '../../components/HomeQuickTools';
import { getSettingsService } from '../../service/DbService';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn(),
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

const mockGetSettings = getSettingsService as jest.Mock;

describe('HomeQuickTools', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettings.mockReturnValue({ quickTools: ['wind', 'tempo', 'random'] });
    });

    it('shouldShowTheDefaultWindTempoAndRandomTiles', () => {
        const { getByText } = render(<HomeQuickTools />);

        expect(getByText('Wind')).toBeTruthy();
        expect(getByText('Tempo')).toBeTruthy();
        expect(getByText('Random')).toBeTruthy();
    });

    it('shouldShowTheSavedQuickToolsInTheSavedOrder', () => {
        mockGetSettings.mockReturnValue({ quickTools: ['tempo', 'lag-putting', 'reminders'] });
        const { getAllByTestId } = render(<HomeQuickTools />);

        const tileIds = getAllByTestId(/^home-tool-/).map(tile => tile.props.testID);
        expect(tileIds).toEqual(['home-tool-tempo', 'home-tool-lag-putting', 'home-tool-reminders']);
    });

    it('shouldShowAChallengeTileWhenAChallengeIsSaved', () => {
        mockGetSettings.mockReturnValue({ quickTools: ['tempo', 'lag-putting', 'reminders'] });
        const { getByText, queryByText } = render(<HomeQuickTools />);

        expect(getByText('Lag putting')).toBeTruthy();
        expect(queryByText('Wind')).toBeNull();
    });

    it('shouldOpenEachToolAtItsRouteWhenItsTileIsPressed', () => {
        const { getByTestId } = render(<HomeQuickTools />);

        fireEvent.press(getByTestId('home-tool-wind'));
        fireEvent.press(getByTestId('home-tool-tempo'));
        fireEvent.press(getByTestId('home-tool-random'));

        expect(mockPush).toHaveBeenNthCalledWith(1, '/tools/wind');
        expect(mockPush).toHaveBeenNthCalledWith(2, '/tools/tempo');
        expect(mockPush).toHaveBeenNthCalledWith(3, '/tools/random');
    });

    it('shouldOpenAChallengeAtItsRouteWhenItsTileIsPressed', () => {
        mockGetSettings.mockReturnValue({ quickTools: ['tempo', 'lag-putting', 'reminders'] });
        const { getByTestId } = render(<HomeQuickTools />);

        fireEvent.press(getByTestId('home-tool-lag-putting'));

        expect(mockPush).toHaveBeenCalledWith('/challenges/lag-putting');
    });

    it('shouldShowEachTileLabelAtTheSmallTextSize', () => {
        const { getByText } = render(<HomeQuickTools />);

        expect(getByText('Wind')).toHaveStyle({ fontSize: require('../../assets/font-sizes').default.smallText });
    });

    it('shouldShowEachToolIconOnTheSameTintedTileAsThePracticeCards', () => {
        const colours = require('../../assets/colours').default;
        const { getByTestId } = render(<HomeQuickTools />);

        expect(getByTestId('quick-tool-icon-wind')).toHaveStyle({ width: 48, height: 48, borderRadius: 12, backgroundColor: colours.primary + '1F' });
    });

    it('shouldGiveEveryToolTileTheSameSize', () => {
        const { getAllByTestId } = render(<HomeQuickTools />);

        for (const tile of getAllByTestId(/^home-tool-/)) {
            expect(tile).toHaveStyle({ flex: 1, height: 110 });
        }
    });
});
