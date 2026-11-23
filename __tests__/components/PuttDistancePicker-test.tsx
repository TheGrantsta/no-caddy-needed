import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PuttDistancePicker from '../../components/PuttDistancePicker';

// Walks the rendered JSON tree depth-first and returns testIDs in the order they appear on screen
const collectTestIdsInRenderOrder = (node: unknown): string[] => {
    if (!node || typeof node !== 'object') return [];
    const element = node as { props?: { testID?: string }; children?: unknown[] };
    const own = element.props?.testID ? [element.props.testID] : [];
    const children = Array.isArray(element.children) ? element.children : [];
    return [...own, ...children.flatMap(collectTestIdsInRenderOrder)];
};

describe('PuttDistancePicker', () => {
    it('shouldShowZeroWhenNoDistanceChosen', () => {
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );

        expect(getByTestId('first-putt-input')).toHaveTextContent('0');
    });

    it('shouldShowTheChosenDistance', () => {
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="20" maxDistance={300} onChange={jest.fn()} />
        );

        expect(getByTestId('first-putt-input')).toHaveTextContent('20');
    });

    it('shouldOpenAListOfDistancesWhenPressed', () => {
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );

        expect(queryByTestId('first-putt-input-option-20')).toBeNull();
        fireEvent.press(getByTestId('first-putt-input'));
        expect(getByTestId('first-putt-input-option-20')).toBeTruthy();
    });

    it('shouldShowTheDistancesInlineInsteadOfInAModal', () => {
        const { Modal } = require('react-native');
        const { getByTestId, UNSAFE_queryAllByType } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        expect(getByTestId('first-putt-input-option-1')).toBeTruthy();
        expect(UNSAFE_queryAllByType(Modal)).toHaveLength(0);
    });

    it('shouldOfferEveryDistanceUpToTheMaximum', () => {
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        expect(getByTestId('first-putt-input-option-1')).toBeTruthy();
        expect(queryByTestId('first-putt-input-option-0')).toBeNull();
        expect(getByTestId('first-putt-input-option-300')).toBeTruthy();
        expect(queryByTestId('first-putt-input-option-301')).toBeNull();
    });

    it('shouldReportTheChosenDistanceAsText', () => {
        const onChange = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={onChange} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        fireEvent.press(getByTestId('first-putt-input-option-20'));

        expect(onChange).toHaveBeenCalledWith('20');
        expect(queryByTestId('first-putt-input-option-20')).toBeNull();
    });

    it('shouldClearTheDistanceWhenClearChosen', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="20" maxDistance={300} onChange={onChange} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        fireEvent.press(getByTestId('first-putt-input-option-clear'));

        expect(onChange).toHaveBeenCalledWith('');
    });

    it('shouldNotOfferChipInByDefault', () => {
        const { getByTestId, queryByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        expect(queryByTestId('first-putt-input-option-chip-in')).toBeNull();
    });

    it('shouldOfferChipInOptionWhenAllowed', () => {
        const { getByTestId } = render(
            <PuttDistancePicker
                testID="first-putt-input"
                value=""
                maxDistance={300}
                onChange={jest.fn()}
                allowChipIn
            />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        expect(getByTestId('first-putt-input-option-chip-in')).toHaveTextContent('No putt');
    });

    it('shouldPlaceChipInOptionBeforeOneFoot', () => {
        const { getByTestId, toJSON } = render(
            <PuttDistancePicker
                testID="first-putt-input"
                value=""
                maxDistance={300}
                onChange={jest.fn()}
                allowChipIn
            />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        const renderedTestIds = collectTestIdsInRenderOrder(toJSON());
        expect(renderedTestIds.indexOf('first-putt-input-option-chip-in')).toBeLessThan(
            renderedTestIds.indexOf('first-putt-input-option-1')
        );
    });

    it('shouldReportZeroWhenChipInChosen', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <PuttDistancePicker
                testID="first-putt-input"
                value=""
                maxDistance={300}
                onChange={onChange}
                allowChipIn
            />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        fireEvent.press(getByTestId('first-putt-input-option-chip-in'));

        expect(onChange).toHaveBeenCalledWith('0');
    });

    it('shouldShowChipInLabelWhenZeroIsChosenAndChipInAllowed', () => {
        const { getByTestId } = render(
            <PuttDistancePicker
                testID="first-putt-input"
                value="0"
                maxDistance={300}
                onChange={jest.fn()}
                allowChipIn
            />
        );

        expect(getByTestId('first-putt-input')).toHaveTextContent('No putt');
    });

    it('shouldStillShowZeroWhenBlankAndChipInAllowed', () => {
        const { getByTestId } = render(
            <PuttDistancePicker
                testID="first-putt-input"
                value=""
                maxDistance={300}
                onChange={jest.fn()}
                allowChipIn
            />
        );

        expect(getByTestId('first-putt-input')).toHaveTextContent('0');
    });

    it('shouldOutlineTheBoxInRedWhenThereIsAnError', () => {
        const colours = require('../../assets/colours').default;
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} hasError />
        );

        expect(getByTestId('first-putt-input')).toHaveStyle({ borderColor: colours.red });
    });
});

describe('PuttDistancePicker chip-in label fit', () => {
    it('shouldShowTheChipInOptionOnOneLineAtASmallerSize', () => {
        const fontSizes = require('../../assets/font-sizes').default;
        const { getByTestId } = render(
            <PuttDistancePicker testID="first-putt-input" value="" maxDistance={300} onChange={jest.fn()} allowChipIn />
        );
        fireEvent.press(getByTestId('first-putt-input'));

        const label = getByTestId('first-putt-input-option-chip-in').findByType(require('react-native').Text);
        expect(label.props.numberOfLines).toBe(1);
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontSize: fontSizes.smallestText })]));
    });
});
