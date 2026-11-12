import React from 'react';
import { Switch } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import AppSwitch from '../../components/AppSwitch';

describe('AppSwitch', () => {
    it('shouldShowAnOffTrackInTheTertiaryColourAndAnOnTrackInPrimary', () => {
        const colours = require('../../assets/colours').default;
        const { UNSAFE_getByType } = render(<AppSwitch value={false} onValueChange={jest.fn()} />);

        expect(UNSAFE_getByType(Switch).props.trackColor).toEqual({ false: colours.tertiary, true: colours.primary });
    });

    it('shouldPassTheValueAndChangeHandlerThrough', () => {
        const onValueChange = jest.fn();
        const { getByTestId } = render(<AppSwitch testID="toggle" value={false} onValueChange={onValueChange} />);

        fireEvent(getByTestId('toggle'), 'valueChange', true);

        expect(onValueChange).toHaveBeenCalledWith(true);
    });
});
