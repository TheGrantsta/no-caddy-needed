import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HoleNavigationControls from '../../components/HoleNavigationControls';

const baseProps = {
    currentHole: 5,
    isLastHole: false,
    skipStatsFlow: false,
    onPreviousHole: jest.fn(() => Promise.resolve()),
    onNextHole: jest.fn(() => Promise.resolve()),
    onEndRound: jest.fn(),
};

describe('HoleNavigationControls', () => {
    it('shouldShowPreviousHoleButtonOnScorePhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="score" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldShowPreviousHoleButtonOnStatsPhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="stats" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldShowPreviousHoleButtonOnSinDetailsPhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="sinDetails" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldShowPreviousHoleButtonOnPuttingPhase', () => {
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="putting" />);

        expect(getByTestId('previous-hole-button')).toBeTruthy();
    });

    it('shouldCallOnPreviousHoleWhenPreviousPressedOnPuttingPhase', () => {
        const onPreviousHole = jest.fn(() => Promise.resolve());
        const { getByTestId } = render(<HoleNavigationControls {...baseProps} holePhase="putting" onPreviousHole={onPreviousHole} />);

        fireEvent.press(getByTestId('previous-hole-button'));

        expect(onPreviousHole).toHaveBeenCalledTimes(1);
    });

    it('shouldHidePreviousHoleButtonOnFirstHole', () => {
        const { queryByTestId } = render(<HoleNavigationControls {...baseProps} currentHole={1} holePhase="putting" />);

        expect(queryByTestId('previous-hole-button')).toBeNull();
    });

    describe('wind overlay button', () => {
        const windProps = { wind: { directionFrom: 270, speedMph: 10 }, heading: 0 } as object;

        it('shouldShowAWindButtonInTheHoleBarWhenWindIsKnown', () => {
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} {...windProps} />);

            expect(getByTestId('wind-overlay-button')).toBeTruthy();
            expect(getByTestId('next-hole-button')).toBeTruthy();
        });

        it('shouldPlaceTheWindButtonInTheCentreSlotBetweenPreviousAndNext', () => {
            const { getByTestId, queryByTestId } = render(<HoleNavigationControls {...baseProps} {...windProps} />);

            expect(getByTestId('hole-nav-centre')).toBeTruthy();
            expect(getByTestId('hole-nav-centre').findByProps({ testID: 'wind-overlay-button' })).toBeTruthy();
            expect(getByTestId('hole-nav-left').findByProps({ testID: 'previous-hole-button' })).toBeTruthy();
            expect(getByTestId('hole-nav-right').findByProps({ testID: 'next-hole-button' })).toBeTruthy();
            expect(queryByTestId('hole-nav-right')?.findAllByProps({ testID: 'wind-overlay-button' }).length ?? 0).toBe(0);
        });

        it('shouldHideTheWindButtonWhenThereIsNoWind', () => {
            const { queryByTestId, getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            expect(queryByTestId('wind-overlay-button')).toBeNull();
            expect(getByTestId('next-hole-button')).toBeTruthy();
        });

        it('shouldOpenTheWindOverlayAboveTheBarWhenTheButtonIsPressed', () => {
            const { getByTestId, queryByTestId } = render(<HoleNavigationControls {...baseProps} {...windProps} />);
            expect(queryByTestId('wind-popover')).toBeNull();

            fireEvent.press(getByTestId('wind-overlay-button'));

            expect(getByTestId('wind-popover')).toBeTruthy();
            expect(getByTestId('wind-popover-title')).toBeTruthy();
        });

        it('shouldCloseTheWindOverlayWhenTheButtonIsPressedAgain', () => {
            const { getByTestId, queryByTestId } = render(<HoleNavigationControls {...baseProps} {...windProps} />);

            fireEvent.press(getByTestId('wind-overlay-button'));
            fireEvent.press(getByTestId('wind-overlay-button'));

            expect(queryByTestId('wind-popover')).toBeNull();
        });

        it('shouldCloseTheWindOverlayWhenTheBackdropIsPressed', () => {
            const { getByTestId, queryByTestId } = render(<HoleNavigationControls {...baseProps} {...windProps} />);

            fireEvent.press(getByTestId('wind-overlay-button'));
            fireEvent.press(getByTestId('wind-overlay-backdrop'));

            expect(queryByTestId('wind-popover')).toBeNull();
        });

        it('shouldKeepTheNextHoleButtonWorkingWhileTheOverlayIsOpen', () => {
            const onNextHole = jest.fn(() => Promise.resolve());
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} {...windProps} onNextHole={onNextHole} />);

            fireEvent.press(getByTestId('wind-overlay-button'));
            fireEvent.press(getByTestId('next-hole-button'));

            expect(onNextHole).toHaveBeenCalledTimes(1);
        });
    });

    describe('hole number labels', () => {
        it('shouldLabelPreviousWithOnlyThePreviousHoleNumber', () => {
            const { getByText } = render(<HoleNavigationControls {...baseProps} currentHole={5} />);

            expect(getByText('Hole 4')).toBeTruthy();
        });

        it('shouldLabelNextWithOnlyTheNextHoleNumber', () => {
            const { getByText } = render(<HoleNavigationControls {...baseProps} currentHole={5} />);

            expect(getByText('Hole 6')).toBeTruthy();
        });

        it('shouldShowFinishInsteadOfANextHoleNumberOnTheLastHole', () => {
            const { getByText, queryByText } = render(<HoleNavigationControls {...baseProps} currentHole={18} isLastHole />);

            expect(getByText('Finish')).toBeTruthy();
            expect(queryByText(/Hole 6/)).toBeNull();
        });

        it('shouldKeepTheHoleBarLabelsOnOneLine', () => {
            const { getByText } = render(<HoleNavigationControls {...baseProps} />);

            expect(getByText('Hole 4').props.numberOfLines).toBe(1);
            expect(getByText('Hole 6').props.numberOfLines).toBe(1);
        });

        it('shouldSetTheHoleBarLabelsAtTheSmallTextSize', () => {
            const fontSizes = require('../../assets/font-sizes').default;
            const { StyleSheet } = require('react-native');
            const { getByText } = render(<HoleNavigationControls {...baseProps} />);

            expect(StyleSheet.flatten(getByText('Hole 4').props.style).fontSize).toBe(fontSizes.smallText);
            expect(StyleSheet.flatten(getByText('Hole 6').props.style).fontSize).toBe(fontSizes.smallText);
        });

        it('shouldGiveThePreviousHoleButtonNoBackgroundColour', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            expect(StyleSheet.flatten(getByTestId('previous-hole-button').props.style).backgroundColor).toBe('transparent');
        });
    });

    describe('next hole button', () => {
        it('shouldSizeTheNextHoleButtonToItsLabelInsteadOfStretching', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            const next = StyleSheet.flatten(getByTestId('next-hole-button').props.style);
            expect(next.flexGrow).toBe(0);
            expect(next.flexBasis).toBe('auto');
        });

        it('shouldKeepTheNextHoleButtonAtItsLabelWidthWhenSpaceRunsShort', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            expect(StyleSheet.flatten(getByTestId('next-hole-button').props.style).flexShrink).toBe(0);
        });

        it('shouldGiveTheNextHoleButtonFullyCurvedCorners', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            expect(StyleSheet.flatten(getByTestId('next-hole-button').props.style).borderRadius).toBeGreaterThanOrEqual(100);
        });

        it('shouldGiveTheNextHoleButtonAGreenBackgroundWithWhiteText', () => {
            const colours = require('../../assets/colours').default;
            const { StyleSheet } = require('react-native');
            const { getByTestId, getByText } = render(<HoleNavigationControls {...baseProps} />);

            const next = StyleSheet.flatten(getByTestId('next-hole-button').props.style);
            expect(next.backgroundColor).toBe(colours.primary);
            expect(StyleSheet.flatten(getByText('Hole 6').props.style).color).toBe(colours.white);
        });

        it('shouldClearTheSharedFlexOneSoTheButtonIsNotSizedToZeroWidth', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            // The shared button style sets flex: 1 (flex-basis 0), which can squeeze the label out of view
            expect(StyleSheet.flatten(getByTestId('next-hole-button').props.style).flex).toBe(0);
        });

        it('shouldKeepTheNextHoleButtonSmall', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            expect(StyleSheet.flatten(getByTestId('next-hole-button').props.style).minHeight).toBeLessThanOrEqual(40);
        });
    });

    describe('hole bar shape', () => {
        it('shouldGiveTheHoleBarAFullyRoundedCapsuleShape', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);

            const bar = StyleSheet.flatten(getByTestId('hole-nav-bar').props.style);
            expect(bar.borderRadius).toBeGreaterThanOrEqual(40);
        });
    });

    describe('button alignment in the floating bar', () => {
        it('shouldCentreTheButtonsVerticallyWithTheBarPadding', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<HoleNavigationControls {...baseProps} />);
            const bar = StyleSheet.flatten(getByTestId('hole-nav-bar').props.style);
            const buttonRow = StyleSheet.flatten(require('../../assets/styles').default.playScreen.navigationButtonsContainer);

            expect(buttonRow.marginTop ?? 0).toBe(0);
            expect(bar.padding).toBe(8);
        });
    });
});

describe('HoleNavigationControls on a shotgun start', () => {
    const shotgunProps = {
        isLastHole: false,
        onPreviousHole: jest.fn(),
        onNextHole: jest.fn(),
        holePhase: 'putting' as const,
    };

    it('shouldHideThePreviousButtonOnTheStartingHole', () => {
        const { queryByTestId } = render(<HoleNavigationControls {...shotgunProps} currentHole={10} startHole={10} />);

        expect(queryByTestId('previous-hole-button')).toBeNull();
    });

    it('shouldShowHoleEighteenAsPreviousFromHoleOneOnAShotgunStart', () => {
        const { getByText } = render(<HoleNavigationControls {...shotgunProps} currentHole={1} startHole={10} />);

        expect(getByText('Hole 18')).toBeTruthy();
    });

    it('shouldShowHoleElevenAsNextFromHoleTenOnAShotgunStart', () => {
        const { getByText } = render(<HoleNavigationControls {...shotgunProps} currentHole={10} startHole={10} />);

        expect(getByText('Hole 11')).toBeTruthy();
    });

    it('shouldShowFinishOnTheLastHoleOfAShotgunStart', () => {
        const { getByText } = render(<HoleNavigationControls {...shotgunProps} currentHole={9} startHole={10} isLastHole />);

        expect(getByText('Finish')).toBeTruthy();
    });
});
