import React from 'react';
import { render } from '@testing-library/react-native';
import WindPopover from '../../components/WindPopover';
import { getWindEffect } from '../../service/WeatherService';
import { describeWindEffect } from '../../utils/windEffectDescription';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const description = describeWindEffect(getWindEffect(270, 6, 0));

describe('WindPopover', () => {
    it('shouldShowTheEffectHeadlineWorkedOutFromTheWind', () => {
        const { getByTestId } = render(<WindPopover directionFrom={270} speedMph={6} heading={0} />);

        expect(getByTestId('wind-popover-title')).toHaveTextContent(description.title);
    });

    it('shouldSummariseTheHelpingAndCrossComponentsWithTheirSpeeds', () => {
        const { getByTestId } = render(<WindPopover directionFrom={270} speedMph={6} heading={0} />);

        const expected = description.rows.map(row => `${row.label} ${row.value}`).join(' · ');
        expect(getByTestId('wind-popover-summary')).toHaveTextContent(expected);
    });

    it('shouldShowTheRoundedSpeedInTheDial', () => {
        const { getByTestId } = render(<WindPopover directionFrom={270} speedMph={5.6} heading={0} />);

        expect(getByTestId('wind-speed-value')).toHaveTextContent('6');
    });

    it('shouldNotOfferAnOpenWindLink', () => {
        const { queryByText, queryByTestId } = render(<WindPopover directionFrom={270} speedMph={6} heading={0} />);

        expect(queryByText('Open Wind')).toBeNull();
        expect(queryByTestId('wind-popover-open-wind')).toBeNull();
    });
});
