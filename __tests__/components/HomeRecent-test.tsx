import React from 'react';
import { render } from '@testing-library/react-native';
import HomeRecent from '../../components/HomeRecent';

jest.mock('expo-router', () => ({
    Link: ({ children, testID }: any) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
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

const items = [
    { title: 'Stats Flow Test Course', subtitle: 'Round · 9 holes · Today', icon: 'flag', href: '/perform', sortTime: 2 },
    { title: 'Short-putting ladder', subtitle: 'Practice · Score 15 · Today', icon: 'stairs', href: '/practice', sortTime: 1 },
];

describe('HomeRecent', () => {
    it('shouldShowEachRecentItemsTitleAndSubtitle', () => {
        const { getByText } = render(<HomeRecent items={items} />);

        expect(getByText('Stats Flow Test Course')).toBeTruthy();
        expect(getByText('Round · 9 holes · Today')).toBeTruthy();
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
});
