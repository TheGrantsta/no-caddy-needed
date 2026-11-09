import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SettingsSegmentedControl from '../../components/SettingsSegmentedControl';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const options = [
    { value: 'yards', label: 'Yards' },
    { value: 'metres', label: 'Metres' },
];

describe('SettingsSegmentedControl', () => {
    it('shouldShowEveryOptionLabel', () => {
        const { getByText } = render(
            <SettingsSegmentedControl options={options} value="yards" onChange={jest.fn()} testIDPrefix="units" />
        );

        expect(getByText('Yards')).toBeTruthy();
        expect(getByText('Metres')).toBeTruthy();
    });

    it('shouldHighlightOnlyTheSelectedOptionAsSelected', () => {
        const { getByTestId } = render(
            <SettingsSegmentedControl options={options} value="yards" onChange={jest.fn()} testIDPrefix="units" />
        );

        expect(getByTestId('units-yards')).toHaveStyle({ backgroundColor: '#fff' });
        expect(getByTestId('units-metres')).not.toHaveStyle({ backgroundColor: '#fff' });
        expect(getByTestId('units-yards')).toBeSelected();
    });

    it('shouldReportTheChosenValueWhenAnOptionIsPressed', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <SettingsSegmentedControl options={options} value="yards" onChange={onChange} testIDPrefix="units" />
        );

        fireEvent.press(getByTestId('units-metres'));

        expect(onChange).toHaveBeenCalledWith('metres');
    });
});
