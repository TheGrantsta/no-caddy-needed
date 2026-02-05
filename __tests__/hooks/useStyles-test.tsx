import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { createStyles } from '../../assets/stlyes';
import { darkColours, lightColours } from '../../assets/colours';
import { useStyles } from '../../hooks/useStyles';
import { AppThemeProvider } from '../../context/ThemeContext';
import { getSettingsService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn(() => ({ theme: 'dark', notificationsEnabled: true })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;

describe('createStyles', () => {
    it('creates styles with dark colours', () => {
        const styles = createStyles(darkColours);

        expect(styles.scrollContainer.backgroundColor).toBe(darkColours.background);
    });

    it('creates styles with light colours', () => {
        const styles = createStyles(lightColours);

        expect(styles.scrollContainer.backgroundColor).toBe(lightColours.background);
    });

    it('default export uses dark colours', () => {
        const defaultStyles = require('../../assets/stlyes').default;

        expect(defaultStyles.scrollContainer.backgroundColor).toBe(darkColours.background);
    });
});

describe('useStyles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true });
    });

    const StyleConsumer = () => {
        const styles = useStyles();
        return <Text testID="bg">{String(styles.scrollContainer.backgroundColor)}</Text>;
    };

    it('returns styles based on current theme colours', () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <StyleConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('bg').props.children).toBe(darkColours.background);
    });

    it('returns light styles when theme is light', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true });

        const { getByTestId } = render(
            <AppThemeProvider>
                <StyleConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('bg').props.children).toBe(lightColours.background);
    });
});
