import React from 'react';
import { render } from '@testing-library/react-native';
import WindDial from '../../components/WindDial';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return {
        MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
    };
});

describe('WindDial', () => {
    it('shouldShowTheTargetLabelAboveTheDial', () => {
        const { getByText } = render(<WindDial rotation={0} speedMph={6} />);

        expect(getByText('TARGET')).toBeTruthy();
    });

    it('shouldShowTheRoundedSpeedWithItsUnitInTheCentre', () => {
        const { getByTestId } = render(<WindDial rotation={0} speedMph={5.6} />);

        expect(getByTestId('wind-speed-value').props.children).toBe(6);
        expect(getByTestId('wind-speed-unit').props.children).toBe('mph');
    });

    it('shouldRotateTheWindArrowToTheGivenAngle', () => {
        const { getByTestId } = render(<WindDial rotation={45} speedMph={6} />);

        expect(getByTestId('wind-arrow-large')).toHaveStyle({ transform: [{ rotate: '45deg' }] });
    });

    it('shouldDrawTheTargetMarkerAtTheTop', () => {
        const { getByTestId } = render(<WindDial rotation={0} speedMph={6} />);

        expect(getByTestId('wind-dial-target')).toBeTruthy();
    });

    it('shouldDrawSevenTickMarksAroundTheDialBesideTheTargetAtTheTop', () => {
        const { getAllByTestId } = render(<WindDial rotation={0} speedMph={6} />);

        expect(getAllByTestId(/^wind-dial-tick-/)).toHaveLength(7);
    });
});
