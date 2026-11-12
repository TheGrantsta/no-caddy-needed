import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import PracticeToolsSection from '../../components/PracticeToolsSection';

jest.mock('expo-router', () => ({
    Link: ({ children, testID }: any) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return {
        MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
    };
});

const renderTools = () =>
    render(<PracticeToolsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />);

describe('PracticeToolsSection', () => {
    it('shouldGiveEachToolCardATestIdNamedAfterItsScreen', () => {
        const { getByTestId } = renderTools();

        expect(getByTestId('tool-link-tempo')).toBeTruthy();
        expect(getByTestId('tool-link-random')).toBeTruthy();
        expect(getByTestId('tool-link-reminders')).toBeTruthy();
        expect(getByTestId('tool-link-wind')).toBeTruthy();
    });

    it('shouldShowEachToolsIconAndLabelInsideItsCard', () => {
        const { getByTestId, getByText } = renderTools();

        expect(getByTestId('tool-card-tempo')).toBeTruthy();
        expect(getByText('music-note')).toBeTruthy();
        expect(getByText('Tempo')).toBeTruthy();
        expect(getByText('Wind')).toBeTruthy();
    });

    it('shouldShowAChevronOnEachToolCard', () => {
        const { getByTestId } = renderTools();

        expect(getByTestId('tool-chevron-tempo')).toBeTruthy();
        expect(getByTestId('tool-chevron-wind')).toBeTruthy();
    });

    it('shouldSizeEachCardLikeTheChallengeCards', () => {
        const { getByTestId } = renderTools();

        expect(getByTestId('tool-slot-tempo')).toHaveStyle({ width: '48%' });
        expect(getByTestId('tool-card-tempo')).toHaveStyle({ height: 150, borderRadius: 18 });
    });

    it('shouldNotShowAHeadingAboveTheToolCards', () => {
        const { queryByText } = renderTools();

        expect(queryByText('Practice tools')).toBeNull();
    });

    it('shouldShowADiceIconForTheRandomTool', () => {
        const { getByTestId, queryByText } = renderTools();

        expect(getByTestId('tool-card-random')).toBeTruthy();
        expect(queryByText('shuffle-on')).toBeNull();
        expect(queryByText('casino')).toBeTruthy();
    });
});
