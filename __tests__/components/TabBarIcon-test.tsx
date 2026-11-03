import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import TabBarIcon from '../../components/TabBarIcon';
import colours from '../../assets/colours';

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: ({ name, color, size }: any) => {
        const { Text: RNText } = require('react-native');
        return <RNText>{`Icon: ${name} Color: ${color} Size: ${size}`}</RNText>;
    },
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('TabBarIcon', () => {
    it('shouldShowAnIndicatorBarInTheTabColourForTheFocusedTab', () => {
        const { getByTestId } = render(<TabBarIcon name="home" color={colours.primary} focused />);

        expect(getByTestId('tab-icon-indicator').props.style.backgroundColor).toBe(colours.primary);
    });

    it('shouldHaveNoIndicatorBarForAnUnfocusedTab', () => {
        const { getByTestId } = render(<TabBarIcon name="home" color={colours.tabInactive} focused={false} />);

        expect(getByTestId('tab-icon-indicator').props.style.backgroundColor).toBe('transparent');
    });

    it('shouldRenderTheIconAtTheTabSizeAndTheGivenColour', () => {
        const { getByText } = render(<TabBarIcon name="sports-golf" color={colours.primary} focused />);

        expect(getByText(`Icon: sports-golf Color: ${colours.primary} Size: 32`)).toBeTruthy();
    });

    it('shouldRenderChildrenWithTheIconSoTheBadgeMovesWithIt', () => {
        const { getByTestId } = render(
            <TabBarIcon name="loop" color={colours.primary} focused>
                <Text testID="practice-overdue-badge">badge</Text>
            </TabBarIcon>
        );

        expect(getByTestId('practice-overdue-badge')).toBeTruthy();
    });
});
