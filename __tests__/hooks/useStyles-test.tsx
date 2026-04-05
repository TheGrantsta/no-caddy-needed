import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { createStyles } from '../../assets/styles';
import { darkGreen } from '../../assets/colours';
import { useStyles } from '../../hooks/useStyles';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('createStyles', () => {
    it('creates styles with dark colours', () => {
        const styles = createStyles(darkGreen);

        expect(styles.scrollContainer.backgroundColor).toBe(darkGreen.background);
    });

    it('default export uses dark colours', () => {
        const defaultStyles = require('../../assets/styles').default;

        expect(defaultStyles.scrollContainer.backgroundColor).toBe(darkGreen.background);
    });

    it('titleText colour uses the provided colour parameter', () => {
        expect(createStyles(darkGreen).titleText.color).toBe(darkGreen.primary);
    });

    it('subtitleText colour uses the provided colour parameter', () => {
        expect(createStyles(darkGreen).subtitleText.color).toBe(darkGreen.text);
    });

    it('navCard background uses the provided colour parameter', () => {
        expect(createStyles(darkGreen).navCard.backgroundColor).toBe(darkGreen.primary);
    });

    it('iconCircle background uses the provided colour parameter', () => {
        expect(createStyles(darkGreen).iconCircle.backgroundColor).toBe(darkGreen.secondary);
    });
});

describe('useStyles', () => {
    const StyleConsumer = () => {
        const styles = useStyles();
        return <Text testID="bg">{String(styles.scrollContainer.backgroundColor)}</Text>;
    };

    it('returns styles based on dark colours', () => {
        const { getByTestId } = render(<StyleConsumer />);

        expect(getByTestId('bg').props.children).toBe(darkGreen.background);
    });
});
