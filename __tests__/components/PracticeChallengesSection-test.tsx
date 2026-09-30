import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import PracticeChallengesSection from '../../components/PracticeChallengesSection';

jest.mock('expo-router', () => ({
    Link: ({ children }: any) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

describe('PracticeChallengesSection', () => {
    it('renders Challenges header', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByText } = render(
            <PracticeChallengesSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        expect(getByText('Challenges')).toBeTruthy();
    });

    it('renders Putting Simulation challenge card', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByText } = render(
            <PracticeChallengesSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        expect(getByText('Putting Simulation')).toBeTruthy();
    });
});
