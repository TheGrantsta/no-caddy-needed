import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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
        expect(getByTestId('wind-speed-text')).toHaveTextContent('11 m/h');
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

    it('showsExpandAffordanceWhenWindPresent', () => {
        const { getByTestId } = render(<WindIndicator directionFrom={100} speedMph={12} heading={0} />);
        expect(getByTestId('wind-expand-hint')).toBeTruthy();
    });

    describe('expand / collapse overlay', () => {
        it('expandsOnSingleTap', () => {
            const { getByTestId } = render(
                <WindIndicator directionFrom={100} speedMph={10.6} heading={0} />
            );

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-overlay-backdrop')).toBeTruthy();
            expect(getByTestId('wind-speed-text-large')).toHaveTextContent('11 m/h');
        });

        it('expandedArrowUsesSameDownwindRotation', () => {
            const { getByTestId } = render(
                <WindIndicator directionFrom={0} speedMph={5} heading={0} />
            );

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-arrow-large').props.style).toEqual(
                expect.objectContaining({ transform: [{ rotate: '180deg' }] })
            );
        });

        it('collapsesWhenOverlayTapped', () => {
            const { getByTestId, queryByTestId } = render(
                <WindIndicator directionFrom={100} speedMph={12} heading={0} />
            );

            fireEvent.press(getByTestId('wind-indicator'));
            expect(getByTestId('wind-overlay-backdrop')).toBeTruthy();

            fireEvent.press(getByTestId('wind-overlay-backdrop'));

            expect(queryByTestId('wind-overlay-backdrop')).toBeNull();
            expect(getByTestId('wind-indicator')).toBeTruthy();
        });
    });

    describe('target reference', () => {
        it('showsTargetMarkerOnlyWhenOverlayOpen', () => {
            const { getByTestId, queryByTestId } = render(
                <WindIndicator directionFrom={100} speedMph={12} heading={0} />
            );

            expect(queryByTestId('wind-target-marker')).toBeNull();

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-target-marker')).toBeTruthy();
        });
    });

    describe('distance effect in overlay', () => {
        it('showsPlaysLongerForAHeadwind', () => {
            // wind FROM 0 (north), facing north → straight into the wind
            const { getByTestId } = render(<WindIndicator directionFrom={0} speedMph={10} heading={0} />);

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-effect-text')).toHaveTextContent(/longer/i);
        });

        it('showsPlaysShorterForATailwind', () => {
            // wind FROM 180 (south), facing north → straight downwind
            const { getByTestId } = render(<WindIndicator directionFrom={180} speedMph={10} heading={0} />);

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-effect-text')).toHaveTextContent(/shorter/i);
        });

        it('showsCrosswindSideForACrosswind', () => {
            // wind FROM 90 (east), facing north → from the right
            const { getByTestId } = render(<WindIndicator directionFrom={90} speedMph={10} heading={0} />);

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-cross-text')).toHaveTextContent(/right/i);
        });

        it('showsMinimalEffectWhenCalm', () => {
            const { getByTestId } = render(<WindIndicator directionFrom={0} speedMph={2} heading={0} />);

            fireEvent.press(getByTestId('wind-indicator'));

            expect(getByTestId('wind-effect-text')).toHaveTextContent(/minimal/i);
        });
    });
});
