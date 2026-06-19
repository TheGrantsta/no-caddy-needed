import React from 'react';
import { render } from '@testing-library/react-native';
import WindDisplay from '../../components/WindDisplay';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('WindDisplay', () => {
    it('rendersNothingWhenDirectionNull', () => {
        const { queryByTestId } = render(<WindDisplay directionFrom={null} speedMph={null} heading={0} />);
        expect(queryByTestId('wind-arrow-large')).toBeNull();
    });

    it('rendersNothingWhenSpeedNull', () => {
        const { queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={null} heading={0} />);
        expect(queryByTestId('wind-arrow-large')).toBeNull();
    });

    it('showsRoundedMph', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10.6} heading={0} />);
        expect(getByTestId('wind-speed-text-large')).toHaveTextContent('11 mph');
    });

    it('showsTargetMarker', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={12} heading={0} />);
        expect(getByTestId('wind-target-marker')).toBeTruthy();
    });

    it('appliesDownwindCompassRotationToLargeArrow', () => {
        // wind FROM 0 → downwind 180; heading 0 → 180deg
        const { getByTestId } = render(<WindDisplay directionFrom={0} speedMph={5} heading={0} />);
        expect(getByTestId('wind-arrow-large').props.style).toEqual(
            expect.objectContaining({ transform: [{ rotate: '180deg' }] })
        );
    });

    it('reorientsLargeArrowWithDeviceHeading', () => {
        // downwind 180; phone rotated 90 → 90deg
        const { getByTestId } = render(<WindDisplay directionFrom={0} speedMph={5} heading={90} />);
        expect(getByTestId('wind-arrow-large').props.style).toEqual(
            expect.objectContaining({ transform: [{ rotate: '90deg' }] })
        );
    });

    it('showsPlaysLongerForAHeadwind', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={0} speedMph={10} heading={0} />);
        expect(getByTestId('wind-effect-text')).toHaveTextContent(/longer/i);
    });

    it('showsPlaysShorterForATailwind', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={180} speedMph={10} heading={0} />);
        expect(getByTestId('wind-effect-text')).toHaveTextContent(/shorter/i);
    });

    it('showsCrosswindSideForACrosswind', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={90} speedMph={10} heading={0} />);
        expect(getByTestId('wind-cross-text')).toHaveTextContent(/right/i);
    });

    it('showsAboutTheSameWhenCalm', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={0} speedMph={2} heading={0} />);
        expect(getByTestId('wind-effect-text')).toHaveTextContent(/about the same/i);
    });
});
