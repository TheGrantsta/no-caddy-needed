import React from 'react';
import { render } from '@testing-library/react-native';
import WindIndicator from '../../components/WindIndicator';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('WindIndicator', () => {
    it('rendersNothingWhenDirectionNull', () => {
        const { queryByTestId } = render(<WindIndicator directionFrom={null} speedMph={null} heading={0} />);
        expect(queryByTestId('wind-indicator')).toBeNull();
    });

    it('rendersNothingWhenSpeedNull', () => {
        const { queryByTestId } = render(<WindIndicator directionFrom={100} speedMph={null} heading={0} />);
        expect(queryByTestId('wind-indicator')).toBeNull();
    });

    it('showsRoundedMph', () => {
        const { getByTestId } = render(<WindIndicator directionFrom={100} speedMph={10.6} heading={0} />);
        expect(getByTestId('wind-speed-text')).toHaveTextContent('11 mph');
    });

    it('appliesDownwindCompassRotationToArrow', () => {
        // wind FROM 0 → downwind 180; heading 0 → 180deg
        const { getByTestId } = render(<WindIndicator directionFrom={0} speedMph={5} heading={0} />);
        expect(getByTestId('wind-arrow').props.style).toEqual(
            expect.objectContaining({ transform: [{ rotate: '180deg' }] })
        );
    });

    it('reorientsArrowWithDeviceHeading', () => {
        // downwind 180; phone rotated 90 → 90deg
        const { getByTestId } = render(<WindIndicator directionFrom={0} speedMph={5} heading={90} />);
        expect(getByTestId('wind-arrow').props.style).toEqual(
            expect.objectContaining({ transform: [{ rotate: '90deg' }] })
        );
    });
});
