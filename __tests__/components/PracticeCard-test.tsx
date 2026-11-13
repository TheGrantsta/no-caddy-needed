import React from 'react';
import { render } from '@testing-library/react-native';
import PracticeCard from '../../components/PracticeCard';

jest.mock('expo-router', () => ({
    Link: ({ children, testID, href }: any) => {
        const { View } = require('react-native');
        return <View testID={testID} accessibilityHint={href}>{children}</View>;
    },
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

const lagPutting = { slug: 'lag-putting', label: 'Lag putting', icon: 'trending-up', href: '/challenges/lag-putting', group: 'Challenges' as const };

describe('PracticeCard', () => {
    it('shouldShowTheLabelAndTheIconOfTheOption', () => {
        const { getByText } = render(<PracticeCard option={lagPutting} testIDPrefix="challenge" />);

        expect(getByText('Lag putting')).toBeTruthy();
        expect(getByText('trending-up')).toBeTruthy();
    });

    it('shouldLinkToTheRouteOfTheOption', () => {
        const { getByTestId } = render(<PracticeCard option={lagPutting} testIDPrefix="challenge" />);

        expect(getByTestId('challenge-link-lag-putting').props.accessibilityHint).toBe('/challenges/lag-putting');
    });

    it('shouldUseTheGivenPrefixForItsTestIds', () => {
        const { getByTestId } = render(<PracticeCard option={lagPutting} testIDPrefix="tool" />);

        expect(getByTestId('tool-slot-lag-putting')).toBeTruthy();
        expect(getByTestId('tool-card-lag-putting')).toBeTruthy();
        expect(getByTestId('tool-chevron-lag-putting')).toBeTruthy();
    });
});
