import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SimulationAppBar from '../../components/SimulationAppBar';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('SimulationAppBar', () => {
    it('shouldShowTheTitleAndAnEndButton', () => {
        const { getByText, getByTestId } = render(<SimulationAppBar title="Putting sim" onEnd={jest.fn()} />);

        expect(getByText('Putting sim')).toBeTruthy();
        expect(getByTestId('simulation-end-button')).toBeTruthy();
    });

    it('shouldCallOnEndWhenEndIsPressed', () => {
        const onEnd = jest.fn();
        const { getByTestId } = render(<SimulationAppBar title="Putting sim" onEnd={onEnd} />);

        fireEvent.press(getByTestId('simulation-end-button'));

        expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it('shouldShowTheCurrentHoleAndTotalWhenHoleProgressIsGiven', () => {
        const { getByText, getByTestId } = render(
            <SimulationAppBar title="Up-and-down" onEnd={jest.fn()} hole={{ current: 3, total: 9 }} />
        );

        expect(getByText('Hole 3')).toBeTruthy();
        expect(getByText('of 9')).toBeTruthy();
        expect(getByTestId('simulation-progress-fill')).toHaveStyle({ width: `${(3 / 9) * 100}%` });
    });

    it('shouldOmitTheHoleRowWhenNoHoleProgressIsGiven', () => {
        const { queryByText, queryByTestId } = render(<SimulationAppBar title="Putting sim" onEnd={jest.fn()} />);

        expect(queryByText(/^Hole /)).toBeNull();
        expect(queryByTestId('simulation-progress-fill')).toBeNull();
    });
});
