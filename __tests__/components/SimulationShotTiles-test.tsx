import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SimulationShotTiles from '../../components/SimulationShotTiles';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const options = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' },
];

describe('SimulationShotTiles', () => {
    it('shouldShowTheSectionLabelAndEveryOptionLabel', () => {
        const { getByText } = render(
            <SimulationShotTiles sectionLabel="PUTTS TAKEN" options={options} selected={1} onSelect={jest.fn()} testIDPrefix="putts-option" />
        );

        expect(getByText('PUTTS TAKEN')).toBeTruthy();
        expect(getByText('1')).toBeTruthy();
        expect(getByText('4+')).toBeTruthy();
    });

    it('shouldHighlightOnlyTheSelectedOption', () => {
        const { getByTestId } = render(
            <SimulationShotTiles sectionLabel="PUTTS TAKEN" options={options} selected={3} onSelect={jest.fn()} testIDPrefix="putts-option" />
        );

        expect(getByTestId('putts-option-3')).toHaveStyle({ backgroundColor: '#2D5A3D' });
        expect(getByTestId('putts-option-1')).toHaveStyle({ backgroundColor: '#fff' });
    });

    it('shouldCallOnSelectWithTheOptionValueWhenPressed', () => {
        const onSelect = jest.fn();
        const { getByTestId } = render(
            <SimulationShotTiles sectionLabel="PUTTS TAKEN" options={options} selected={1} onSelect={onSelect} testIDPrefix="putts-option" />
        );

        fireEvent.press(getByTestId('putts-option-4'));

        expect(onSelect).toHaveBeenCalledWith(4);
    });
});
