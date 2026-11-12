import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EndRoundSheet from '../../components/EndRoundSheet';

const renderSheet = (overrides: Partial<React.ComponentProps<typeof EndRoundSheet>> = {}) => {
    const props = {
        visible: true,
        holeNumber: 9,
        holesTotal: 18,
        onSave: jest.fn(),
        onDiscard: jest.fn(),
        onKeepPlaying: jest.fn(),
        ...overrides,
    };
    return { props, ...render(<EndRoundSheet {...props} />) };
};

describe('EndRoundSheet', () => {
    it('shouldAskToEndTheRoundAfterTheCurrentHole', () => {
        const { getByText } = renderSheet();

        expect(getByText('End round after hole 9?')).toBeTruthy();
    });

    it('shouldExplainHowManyHolesHaveBeenEnteredAndWhereRoundsCountFor', () => {
        const { getByText } = renderSheet();

        expect(getByText('You’ve entered 9 of 18 holes. Saved rounds count towards Performance.')).toBeTruthy();
    });

    it('shouldOfferSaveRoundAndDiscardRoundAsSeparateActions', () => {
        const { getByText } = renderSheet();

        expect(getByText('Save round')).toBeTruthy();
        expect(getByText('Discard round')).toBeTruthy();
    });

    it('shouldCallOnSaveWhenSaveRoundPressed', () => {
        const { getByTestId, props } = renderSheet();

        fireEvent.press(getByTestId('end-round-save-button'));

        expect(props.onSave).toHaveBeenCalled();
    });

    it('shouldCallOnDiscardWhenDiscardRoundPressed', () => {
        const { getByTestId, props } = renderSheet();

        fireEvent.press(getByTestId('end-round-discard-button'));

        expect(props.onDiscard).toHaveBeenCalled();
    });

    it('shouldCallOnKeepPlayingWhenKeepPlayingPressed', () => {
        const { getByTestId, props } = renderSheet();

        fireEvent.press(getByTestId('end-round-keep-playing-button'));

        expect(props.onKeepPlaying).toHaveBeenCalled();
    });

    it('shouldGiveTheWholeSheetAnOpaqueBackgroundSoThePageDoesNotShowThrough', () => {
        const { StyleSheet } = require('react-native');
        const colours = require('../../assets/colours').default;
        const { getByTestId } = renderSheet();

        const style = StyleSheet.flatten(getByTestId('end-round-sheet').props.style);
        expect(style.backgroundColor).toBe(colours.background);
    });

    it('shouldNotShowTheSheetWhenNotVisible', () => {
        const { queryByText } = renderSheet({ visible: false });

        expect(queryByText('Save round')).toBeNull();
    });

    it('shouldUseCustomTitleMessageAndActionLabelsWhenProvided', () => {
        const { getByText, queryByText } = renderSheet({
            title: 'End simulation after hole 3?',
            message: 'You’ve completed 3 of 18 holes.',
            saveLabel: 'Save result',
            discardLabel: 'Discard result',
        });

        expect(getByText('End simulation after hole 3?')).toBeTruthy();
        expect(getByText('You’ve completed 3 of 18 holes.')).toBeTruthy();
        expect(getByText('Save result')).toBeTruthy();
        expect(getByText('Discard result')).toBeTruthy();
        expect(queryByText('Save round')).toBeNull();
    });
});
