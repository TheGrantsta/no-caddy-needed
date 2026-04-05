import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { createStyles } from '../../assets/styles';
import { darkColours } from '../../assets/colours';
import { useStyles } from '../../hooks/useStyles';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('createStyles', () => {
    it('creates styles with dark colours', () => {
        const styles = createStyles(darkColours);

        expect(styles.scrollContainer.backgroundColor).toBe(darkColours.background);
    });

    it('default export uses dark colours', () => {
        const defaultStyles = require('../../assets/styles').default;

        expect(defaultStyles.scrollContainer.backgroundColor).toBe(darkColours.background);
    });

    it('titleText colour uses the provided colour parameter', () => {
        expect(createStyles(darkColours).titleText.color).toBe(darkColours.primary);
    });

    it('subtitleText colour uses the provided colour parameter', () => {
        expect(createStyles(darkColours).subtitleText.color).toBe(darkColours.text);
    });

    it('navCard background uses the provided colour parameter', () => {
        expect(createStyles(darkColours).navCard.backgroundColor).toBe(darkColours.primary);
    });

    it('iconCircle background uses the provided colour parameter', () => {
        expect(createStyles(darkColours).iconCircle.backgroundColor).toBe(darkColours.secondary);
    });
});

describe('useStyles', () => {
    const StyleConsumer = () => {
        const styles = useStyles();
        return <Text testID="bg">{String(styles.scrollContainer.backgroundColor)}</Text>;
    };

    it('returns styles based on dark colours', () => {
        const { getByTestId } = render(<StyleConsumer />);

        expect(getByTestId('bg').props.children).toBe(darkColours.background);
    });
});
