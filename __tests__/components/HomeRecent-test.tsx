import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeRecent from '../../components/HomeRecent';

const mockNavigate = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ navigate: mockNavigate, push: mockPush, back: jest.fn() }),
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

const items = [
    { title: 'Stats Flow Test Course', subtitle: '9 holes · Today', icon: 'flag', href: '/perform', roundId: 7, sortTime: 2 },
    { title: 'Short-putting ladder', subtitle: 'Practice · Score 15 · Today', icon: 'stairs', href: '/practice', sortTime: 1 },
];

describe('HomeRecent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldShowEachRecentItemsTitleAndSubtitle', () => {
        const { getByText } = render(<HomeRecent items={items} />);

        expect(getByText('Stats Flow Test Course')).toBeTruthy();
        expect(getByText('9 holes · Today')).toBeTruthy();
        expect(getByText('Short-putting ladder')).toBeTruthy();
        expect(getByText('Practice · Score 15 · Today')).toBeTruthy();
    });

    it('shouldShowAnIconForEachItem', () => {
        const { getByText } = render(<HomeRecent items={items} />);

        expect(getByText('flag')).toBeTruthy();
        expect(getByText('stairs')).toBeTruthy();
    });

    it('shouldLinkEachRowToItsSection', () => {
        const { getByTestId } = render(<HomeRecent items={items} />);

        expect(getByTestId('home-recent-row-0')).toBeTruthy();
        expect(getByTestId('home-recent-row-1')).toBeTruthy();
    });

    it('shouldShowAMessageWhenThereIsNothingRecent', () => {
        const { getByText, queryByTestId } = render(<HomeRecent items={[]} />);

        expect(getByText('Nothing recent yet')).toBeTruthy();
        expect(queryByTestId('home-recent-row-0')).toBeNull();
    });

    it('shouldOpenARoundOnTheRoundListWithItsScorecardOnTop', () => {
        const { getByTestId } = render(<HomeRecent items={items} />);

        fireEvent.press(getByTestId('home-recent-row-0'));

        expect(mockNavigate).toHaveBeenCalledWith('/perform');
        expect(mockPush).toHaveBeenCalledWith({ pathname: '/play/scorecard', params: { roundId: '7' } });
    });
});
