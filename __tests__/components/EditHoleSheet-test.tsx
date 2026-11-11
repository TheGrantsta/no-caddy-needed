import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import EditHoleSheet from '../../components/EditHoleSheet';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const sins = { troubleOffTee: false, penalties: false, threePutts: true, bogeysInside9Iron: false, doubleChips: false, doubleBogeys: false, bogeysPar5: false };

const renderSheet = (overrides: object = {}) => {
    const handlers = {
        onBack: jest.fn(),
        onParChange: jest.fn(),
        onStrokesChange: jest.fn(),
        onFirstPuttChange: jest.fn(),
        onSecondPuttChange: jest.fn(),
        onGreenInRegulationChange: jest.fn(),
        onSinChange: jest.fn(),
    };
    const utils = render(
        <EditHoleSheet
            holeNumber={3}
            par={4}
            strokes={4}
            firstPutt="18"
            secondPutt="2"
            greenInRegulation={false}
            sins={sins as any}
            {...handlers}
            {...overrides}
        />
    );
    return { ...utils, ...handlers };
};

describe('EditHoleSheet', () => {
    it('shouldShowTheHoleHeadingLargerOnASingleLineInTheThemeTextColour', () => {
        const { getByText } = renderSheet();
        const heading = getByText('Hole 3');

        expect(heading.props.numberOfLines).toBe(1);
        expect(heading).toHaveStyle({ fontSize: require('../../assets/font-sizes').default.subHeader, color: require('../../assets/colours').default.text });
    });

    it('shouldShowTheRoundBackButtonAndTheHoleTitle', () => {
        const { getByText, getByTestId } = renderSheet();

        expect(getByText('Hole 3')).toBeTruthy();
        expect(getByTestId('edit-hole-back-button')).toBeTruthy();
        expect(getByText('Round')).toBeTruthy();
    });

    it('shouldReturnToTheRoundWhenBackIsPressed', () => {
        const { getByTestId, onBack } = renderSheet();

        fireEvent.press(getByTestId('edit-hole-back-button'));

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('shouldShowParAsThreeOptionsWithTheCurrentParSelected', () => {
        const { getByTestId } = renderSheet({ par: 4 });

        expect(getByTestId('edit-hole-par-4')).toBeSelected();
        expect(getByTestId('edit-hole-par-3')).not.toBeSelected();
    });

    it('shouldReportThePar_WhenAnotherParIsPressed', () => {
        const { getByTestId, onParChange } = renderSheet();

        fireEvent.press(getByTestId('edit-hole-par-5'));

        expect(onParChange).toHaveBeenCalledWith(5);
    });

    it('shouldShowTheStrokesAndStepThemWithPlusAndMinus', () => {
        const { getByTestId, onStrokesChange } = renderSheet({ strokes: 4 });

        expect(getByTestId('edit-hole-strokes-value')).toHaveTextContent('4');
        fireEvent.press(getByTestId('edit-hole-strokes-increment'));
        fireEvent.press(getByTestId('edit-hole-strokes-decrement'));

        expect(onStrokesChange).toHaveBeenNthCalledWith(1, 1);
        expect(onStrokesChange).toHaveBeenNthCalledWith(2, -1);
    });

    it('shouldShowTheFirstAndSecondPuttDistances', () => {
        const { getByTestId } = renderSheet();

        expect(getByTestId('first-putt-input')).toHaveTextContent('18');
        expect(getByTestId('second-putt-input')).toHaveTextContent('2');
    });

    it('shouldShowGreenInRegulationAsASwitchAndReportItsChange', () => {
        const { getByTestId, onGreenInRegulationChange } = renderSheet({ greenInRegulation: false });

        expect(getByTestId('edit-hole-gir-switch').props.value).toBe(false);
        fireEvent(getByTestId('edit-hole-gir-switch'), 'valueChange', true);

        expect(onGreenInRegulationChange).toHaveBeenCalledWith(true);
    });

    it('shouldShowTheFiveDeadlySinSwitchesAndReportChanges', () => {
        const { getByText, getByTestId, onSinChange } = renderSheet();

        expect(getByText('Trouble off tee')).toBeTruthy();
        expect(getByText('3-putts')).toBeTruthy();
        expect(getByTestId('edit-hole-sin-threePutts').props.value).toBe(true);

        fireEvent(getByTestId('edit-hole-sin-troubleOffTee'), 'valueChange', true);

        expect(onSinChange).toHaveBeenCalledWith('troubleOffTee', true);
    });

    it('shouldHidePuttingAndSinSectionsForScoreOnlyRounds', () => {
        const { getByTestId, queryByTestId, queryByText } = renderSheet({ showStats: false });

        expect(getByTestId('edit-hole-strokes-value')).toBeTruthy();
        expect(queryByText('PUTTING')).toBeNull();
        expect(queryByText('DEADLY SINS')).toBeNull();
        expect(queryByTestId('first-putt-input')).toBeNull();
        expect(queryByTestId('edit-hole-gir-switch')).toBeNull();
        expect(queryByTestId('edit-hole-sin-threePutts')).toBeNull();
    });

    it('shouldShowPuttingAndSinSectionsByDefault', () => {
        const { getByTestId, getByText } = renderSheet();

        expect(getByText('PUTTING')).toBeTruthy();
        expect(getByText('DEADLY SINS')).toBeTruthy();
        expect(getByTestId('edit-hole-gir-switch')).toBeTruthy();
    });

    it('shouldShowTheFollowUpUnderASinOnlyWhileItIsTicked', () => {
        const renderFollowUp = jest.fn((key: string) => <Text>{`follow-up for ${key}`}</Text>);
        const { getByText, queryByText, getByTestId } = renderSheet({
            sins: { ...sins, threePutts: false, troubleOffTee: true },
            renderFollowUp,
        });

        expect(getByText('follow-up for troubleOffTee')).toBeTruthy();
        expect(getByTestId('edit-hole-follow-up-troubleOffTee')).toBeTruthy();
        expect(queryByText('follow-up for penalties')).toBeNull();
        expect(renderFollowUp).not.toHaveBeenCalledWith('penalties');
    });
});
