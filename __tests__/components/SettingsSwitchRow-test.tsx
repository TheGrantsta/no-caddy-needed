import React from 'react';
import { Switch } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import SettingsSwitchRow from '../../components/SettingsSwitchRow';

describe('SettingsSwitchRow', () => {
    it('shouldShowTheLabelBesideASwitch', () => {
        const { getByText, getByTestId } = render(
            <SettingsSwitchRow label="Sounds" value={true} onValueChange={jest.fn()} testID="sounds-switch" />
        );

        expect(getByText('Sounds')).toBeTruthy();
        expect(getByTestId('sounds-switch')).toBeTruthy();
    });

    it('shouldShowTheSwitchOnWhenTheValueIsTrue', () => {
        const { getByTestId } = render(
            <SettingsSwitchRow label="Sounds" value={true} onValueChange={jest.fn()} testID="sounds-switch" />
        );

        expect(getByTestId('sounds-switch').props.value).toBe(true);
    });

    it('shouldShowTheSwitchOffWhenTheValueIsFalse', () => {
        const { getByTestId } = render(
            <SettingsSwitchRow label="Sounds" value={false} onValueChange={jest.fn()} testID="sounds-switch" />
        );

        expect(getByTestId('sounds-switch').props.value).toBe(false);
    });

    it('shouldReportTheNewValueWhenTheSwitchIsChanged', () => {
        const onValueChange = jest.fn();
        const { getByTestId } = render(
            <SettingsSwitchRow label="Sounds" value={true} onValueChange={onValueChange} testID="sounds-switch" />
        );

        fireEvent(getByTestId('sounds-switch'), 'valueChange', false);

        expect(onValueChange).toHaveBeenCalledWith(false);
    });

    it('shouldShowTheOffTrackInTheTertiaryColourSoItContrastsWithTheCard', () => {
        const colours = require('../../assets/colours').default;
        const { UNSAFE_getByType } = render(<SettingsSwitchRow label="Sounds" value={false} onValueChange={jest.fn()} testID="sounds-switch" />);

        expect(UNSAFE_getByType(Switch).props.trackColor.false).toBe(colours.tertiary);
    });
});
