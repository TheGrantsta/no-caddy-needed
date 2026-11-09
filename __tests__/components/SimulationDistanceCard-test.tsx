import React from 'react';
import { render } from '@testing-library/react-native';
import SimulationDistanceCard from '../../components/SimulationDistanceCard';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('SimulationDistanceCard', () => {
    it('shouldShowTheLabelDistanceAndUnit', () => {
        const { getByText, getByTestId } = render(<SimulationDistanceCard label="PUTT FROM" distance={40} unit="ft" />);

        expect(getByText('PUTT FROM')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toBe('40');
        expect(getByText('ft')).toBeTruthy();
    });

    it('shouldShowTheDistanceAsTextSoZeroIsShown', () => {
        const { getByTestId } = render(<SimulationDistanceCard label="DISTANCE" distance={0} unit="yd" />);

        expect(getByTestId('simulation-distance-value').props.children).toBe('0');
    });
});
