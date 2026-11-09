import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { Animated } from 'react-native';
import PracticeChallengesSection from '../../components/PracticeChallengesSection';

jest.mock('expo-router', () => ({
    Link: ({ children, testID }: any) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return {
        MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
    };
});

describe('PracticeChallengesSection', () => {
    it('gives each challenge card a test ID named after its screen so E2E flows can open it', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByTestId } = render(
            <PracticeChallengesSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        expect(getByTestId('challenge-link-putting-simulation')).toBeTruthy();
        expect(getByTestId('challenge-link-up-and-down')).toBeTruthy();
        expect(getByTestId('challenge-link-short-putting-ladder')).toBeTruthy();
        expect(getByTestId('challenge-link-lag-putting')).toBeTruthy();
    });

    it('renders all four challenge cards', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByText } = render(
            <PracticeChallengesSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        expect(getByText('Putting sim')).toBeTruthy();
        expect(getByText('Up-and-down')).toBeTruthy();
        expect(getByText('Short putting')).toBeTruthy();
        expect(getByText('Lag putting')).toBeTruthy();
    });


    it('shows each challenge as a white card with a chevron', () => {
        const colours = require('../../assets/colours').default;
        const { StyleSheet } = require('react-native');
        const { getByTestId } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        const card = StyleSheet.flatten(getByTestId('challenge-card-putting-simulation').props.style);
        expect(card.backgroundColor).toBe(colours.backgroundLight);
        expect(card.borderRadius).toBeGreaterThanOrEqual(18);
        expect(getByTestId('challenge-chevron-putting-simulation')).toBeTruthy();
    });

    it('shows the practice principles under a Learn label', () => {
        const { getByText } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(getByText('Learn')).toBeTruthy();
        expect(getByText('Practice principles')).toBeTruthy();
    });

    it('hides the principles until the practice principles row is opened', () => {
        const { getByTestId, queryByText, getByText } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(queryByText('Purpose: practise with intent')).toBeNull();
        fireEvent.press(getByTestId('practice-principles-row'));
        expect(getByText('Purpose: practise with intent')).toBeTruthy();
    });

    it('makes every challenge card the same size, filling an equal half-width slot', () => {
        const { StyleSheet } = require('react-native');
        const { getByTestId } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        ['putting-simulation', 'up-and-down', 'short-putting-ladder', 'lag-putting'].forEach(slug => {
            const card = StyleSheet.flatten(getByTestId(`challenge-card-${slug}`).props.style);
            const slot = StyleSheet.flatten(getByTestId(`challenge-slot-${slug}`).props.style);
            expect(card.width).toBe('100%');
            expect(card.height).toBe(150);
            expect(slot.width).toBe('48%');
        });
    });

    it('uses chevrons that point down when closed and up when open', () => {
        const { getByText, getByTestId } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(getByText('keyboard-arrow-down')).toBeTruthy();
        fireEvent.press(getByTestId('practice-principles-row'));
        expect(getByText('keyboard-arrow-up')).toBeTruthy();
    });

    it('keeps only a small gap between the challenge cards and the Learn label', () => {
        const { StyleSheet } = require('react-native');
        const styles = require('../../assets/styles').default;

        expect(StyleSheet.flatten(styles.practiceCards.learnLabelWrap).marginTop).toBeLessThanOrEqual(12);
    });

    it('keeps the principles inside the heading card so they read as belonging to it', () => {
        const { getByTestId, getByText } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );
        fireEvent.press(getByTestId('practice-principles-row'));

        const card = getByTestId('practice-principles-card');
        expect(within(card).getByText('Purpose: practise with intent')).toBeTruthy();
        expect(within(card).getByTestId('practice-principles-row')).toBeTruthy();
        expect(getByText('Pressure: practise under stress')).toBeTruthy();
    });

    it('shows a chevron marker in front of each principle', () => {
        const { getByTestId, getAllByText } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );
        fireEvent.press(getByTestId('practice-principles-row'));

        const points = getByTestId('practice-principles-points');
        expect(within(points).getAllByText('chevron-right')).toHaveLength(4);
        expect(getAllByText('chevron-right').length).toBeGreaterThanOrEqual(4);
    });

    it('shouldIndentPrincipleListLessThanTheLearnLabelText', () => {
        const { getByTestId } = render(
            <PracticeChallengesSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );
        fireEvent.press(getByTestId('practice-principles-row'));

        expect(getByTestId('practice-principles-points')).toHaveStyle({ paddingLeft: 40 });
    });
});
