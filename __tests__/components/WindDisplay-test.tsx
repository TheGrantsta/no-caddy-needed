import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WindDisplay from '../../components/WindDisplay';

import { useWindVoice } from '../../hooks/useWindVoice';
import { getWedgeChartService } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useWindVoice');
jest.mock('../../service/DbService');

const mockUseWindVoice = useWindVoice as jest.Mock;
const mockGetWedgeChartService = getWedgeChartService as jest.Mock;

describe('WindDisplay', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseWindVoice.mockReturnValue({
            isAvailable: false,
            isListening: false,
            adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
            toggleListening: jest.fn(),
            submitManualDistance: jest.fn(),
        });
        mockGetWedgeChartService.mockReturnValue({
            distanceNames: [],
            clubs: [],
        });
    });
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
            [{ "marginTop": 4 }, { "transform": [{ "rotate": "180deg" }] }]
        );
    });

    it('reorientsLargeArrowWithDeviceHeading', () => {
        // downwind 180; phone rotated 90 → 90deg
        const { getByTestId } = render(<WindDisplay directionFrom={0} speedMph={5} heading={90} />);

        expect(getByTestId('wind-arrow-large').props.style).toEqual(
            [{ "marginTop": 4 }, { "transform": [{ "rotate": "90deg" }] }]
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

    it('showsAboutTheSameWhenCalm', () => {
        const { getByTestId } = render(<WindDisplay directionFrom={0} speedMph={2} heading={0} />);
        expect(getByTestId('wind-effect-text')).toHaveTextContent(/about the same/i);
    });

    describe('compact mode (embedded in a page)', () => {
        it('showsTitleAndAimHintByDefault', () => {
            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={12} heading={0} />);
            expect(getByTestId('wind-display-title')).toBeTruthy();
            expect(getByTestId('wind-aim-hint')).toBeTruthy();
        });

        it('hidesTitleAndAimHintWhenCompact', () => {
            const { queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={12} heading={0} compact />);
            expect(queryByTestId('wind-display-title')).toBeNull();
            expect(queryByTestId('wind-aim-hint')).toBeNull();
        });

        it('dropsTheModalCardBorderWhenCompact', () => {
            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={12} heading={0} compact />);
            const container = getByTestId('wind-display-container');
            const flat = Array.isArray(container.props.style)
                ? Object.assign({}, ...container.props.style)
                : container.props.style;
            expect(flat.borderWidth).toBeFalsy();
        });

        it('keepsTheCardBorderWhenNotCompact', () => {
            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={12} heading={0} />);
            const container = getByTestId('wind-display-container');
            const flat = Array.isArray(container.props.style)
                ? Object.assign({}, ...container.props.style)
                : container.props.style;
            expect(flat.borderWidth).toBe(1);
        });
    });

    describe('voice distance adjuster', () => {
        it('does not render mic button when speech recognition is unavailable', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: false,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(queryByTestId('wind-voice-button')).toBeNull();
        });

        it('renders mic button when speech recognition is available', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByTestId('wind-voice-button')).toBeTruthy();
        });

        it('calls toggleListening when mic button is pressed', () => {
            const mockToggleListen = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: mockToggleListen,
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-voice-button'));
            expect(mockToggleListen).toHaveBeenCalled();
        });

        it('shows adjusted yards when value is not null and the estimated effect is hidden', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: 94,
                adjustedDisplayValue: 94,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId, queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByTestId('wind-adjusted-yards')).toHaveTextContent('Play it as 94 yards');
            expect(queryByTestId('wind-effect-text')).toBeNull();
        });

        it('does not show adjusted yards when value is null', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            const element = getByTestId('wind-adjusted-yards');
            // Element is rendered but with opacity 0 to reserve space
            expect(element.props.style[1].opacity).toBe(0);
        });

        it('shows Listening text when isListening is true', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: true,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId, queryAllByText } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByTestId('wind-voice-button')).toBeTruthy();
            expect(queryAllByText(/Listening/i).length).toBeGreaterThan(0);
        });

        it('shows Say the distance text when isListening is false', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId, queryAllByText } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByTestId('wind-voice-button')).toBeTruthy();
            expect(queryAllByText(/Say the distance/i).length).toBeGreaterThan(0);
        });
    });

    describe('club suggestions', () => {
        const mockWedgeChart = {
            distanceNames: ['54°', '58°'],
            clubs: [
                { club: '2', distances: [{ name: '54°', distance: 130 }, { name: '58°', distance: 110 }] },
                { club: '3', distances: [{ name: '54°', distance: 130 }, { name: '58°', distance: 110 }] },
                { club: '4', distances: [{ name: '54°', distance: 130 }, { name: '58°', distance: 110 }] },
                { club: '5', distances: [{ name: '54°', distance: 130 }, { name: '58°', distance: 110 }] },
                { club: '6', distances: [{ name: '54°', distance: 130 }, { name: '58°', distance: 110 }] },
            ],
        };

        beforeEach(() => {
            mockGetWedgeChartService.mockReturnValue(mockWedgeChart);
        });

        it('does not render suggested clubs when adjustedYards is null', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByText } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(queryByText('Club')).toBeNull();
        });

        it('displays single club for exact match', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: 135,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByText, queryAllByText } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByText('54°')).toBeTruthy();
            expect(queryAllByText('130').length).toBeGreaterThan(0);
        });

        it('displays single club when yardage matches', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: 110,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByText, queryAllByText } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByText('58°')).toBeTruthy();
            expect(queryAllByText('110').length).toBeGreaterThan(0);
        });

        it('hides suggestions when wedge chart is empty', () => {
            mockGetWedgeChartService.mockReturnValue({ distanceNames: [], clubs: [] });
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: 130,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByText } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(queryByText('Club')).toBeNull();
        });

        it('hides suggestions when no clubs match the yardage', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: 200,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(queryByTestId('wind-club-suggestions')).toBeNull();
        });

        it('does not render when disableVoice is true', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: 130,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByTestId } = render(
                <WindDisplay directionFrom={100} speedMph={10} heading={0} disableVoice />
            );
            expect(queryByTestId('wind-club-suggestions')).toBeNull();
        });
    });

    describe('manual distance entry', () => {
        it('does not render manual entry toggle when speech recognition is unavailable', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: false,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(queryByTestId('wind-manual-entry-toggle')).toBeNull();
        });

        it('renders manual entry toggle when speech recognition is available', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(getByTestId('wind-manual-entry-toggle')).toBeTruthy();
        });

        it('does not render manual entry toggle when disableVoice is true', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { queryByTestId } = render(
                <WindDisplay directionFrom={100} speedMph={10} heading={0} disableVoice />
            );
            expect(queryByTestId('wind-manual-entry-toggle')).toBeNull();
        });

        it('shows the manual input and submit button after pressing the toggle', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId, queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            expect(queryByTestId('wind-manual-entry-input')).toBeNull();
            expect(getByTestId('wind-voice-button')).toBeTruthy();

            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            expect(getByTestId('wind-manual-entry-input')).toBeTruthy();
            expect(getByTestId('wind-manual-entry-submit')).toBeTruthy();
            expect(queryByTestId('wind-voice-button')).toBeNull();
        });


        it('closes the manual input when the cancel button is pressed', () => {
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: jest.fn(),
            });

            const { getByTestId, queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            expect(getByTestId('wind-manual-entry-input')).toBeTruthy();

            fireEvent.press(getByTestId('wind-manual-entry-cancel'));
            expect(queryByTestId('wind-manual-entry-input')).toBeNull();
            expect(getByTestId('wind-voice-button')).toBeTruthy();
        });

        it('calls submitManualDistance with the parsed number when submit is pressed', () => {
            const mockSubmitManualDistance = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: mockSubmitManualDistance,
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            fireEvent.changeText(getByTestId('wind-manual-entry-input'), '97');
            fireEvent.press(getByTestId('wind-manual-entry-submit'));

            expect(mockSubmitManualDistance).toHaveBeenCalledWith(97);
        });

        it('does not call submitManualDistance and keeps the panel open when the input is empty', () => {
            const mockSubmitManualDistance = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: mockSubmitManualDistance,
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            fireEvent.press(getByTestId('wind-manual-entry-submit'));

            expect(mockSubmitManualDistance).not.toHaveBeenCalled();
            expect(getByTestId('wind-manual-entry-input')).toBeTruthy();
        });

        it('does not call submitManualDistance for non-numeric input', () => {
            const mockSubmitManualDistance = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: mockSubmitManualDistance,
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            fireEvent.changeText(getByTestId('wind-manual-entry-input'), 'abc');
            fireEvent.press(getByTestId('wind-manual-entry-submit'));

            expect(mockSubmitManualDistance).not.toHaveBeenCalled();
        });

        it('does not call submitManualDistance for zero', () => {
            const mockSubmitManualDistance = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: mockSubmitManualDistance,
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            fireEvent.changeText(getByTestId('wind-manual-entry-input'), '0');
            fireEvent.press(getByTestId('wind-manual-entry-submit'));

            expect(mockSubmitManualDistance).not.toHaveBeenCalled();
        });

        it('accepts decimal input and calls submitManualDistance with the decimal value', () => {
            const mockSubmitManualDistance = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: mockSubmitManualDistance,
            });

            const { getByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            fireEvent.changeText(getByTestId('wind-manual-entry-input'), '97.5');
            fireEvent.press(getByTestId('wind-manual-entry-submit'));

            expect(mockSubmitManualDistance).toHaveBeenCalledWith(97.5);
        });

        it('closes and clears the panel after a successful manual submission', () => {
            const mockSubmitManualDistance = jest.fn();
            mockUseWindVoice.mockReturnValue({
                isAvailable: true,
                isListening: false,
                adjustedYards: null,
                adjustedDisplayValue: null,
                distanceUnit: 'yards',
                toggleListening: jest.fn(),
                submitManualDistance: mockSubmitManualDistance,
            });

            const { getByTestId, queryByTestId } = render(<WindDisplay directionFrom={100} speedMph={10} heading={0} />);
            fireEvent.press(getByTestId('wind-manual-entry-toggle'));
            fireEvent.changeText(getByTestId('wind-manual-entry-input'), '97');
            fireEvent.press(getByTestId('wind-manual-entry-submit'));

            expect(queryByTestId('wind-manual-entry-input')).toBeNull();
            expect(getByTestId('wind-voice-button')).toBeTruthy();
        });
    });
});
