import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import SettingsSection from '../../components/SettingsSection';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('SettingsSection', () => {
    it('shouldShowTheUppercaseTitleAboveItsCard', () => {
        const { getByText } = render(<SettingsSection title="GOLF"><Text>Row</Text></SettingsSection>);

        expect(getByText('GOLF')).toBeTruthy();
    });

    it('shouldRenderItsRowsInsideTheCard', () => {
        const { getByTestId, getByText } = render(<SettingsSection title="GOLF"><Text>Row</Text></SettingsSection>);

        expect(getByTestId('settings-section-card')).toBeTruthy();
        expect(getByText('Row')).toBeTruthy();
    });

    it('shouldShowTheFootnoteBelowTheCardWhenGiven', () => {
        const { getByText } = render(
            <SettingsSection title="UNITS" footnote="Applies to distances."><Text>Row</Text></SettingsSection>
        );

        expect(getByText('Applies to distances.')).toBeTruthy();
    });

    it('shouldOmitTheTitleAndFootnoteWhenNotGiven', () => {
        const { queryByText } = render(<SettingsSection><Text>Row</Text></SettingsSection>);

        expect(queryByText('GOLF')).toBeNull();
        expect(queryByText('Applies to distances.')).toBeNull();
    });

    it('shouldLeaveAGapBelowTheFootnoteBeforeTheNextElement', () => {
        const { getByText } = render(
            <SettingsSection title="UNITS" footnote="Applies to distances."><Text>Row</Text></SettingsSection>
        );

        expect(getByText('Applies to distances.')).toHaveStyle({ marginBottom: 24 });
    });
});
