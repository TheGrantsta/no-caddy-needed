import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { HoleScoreHeader } from '../../components/HoleScoreInput';

const renderHeader = (overrides: object = {}) => {
    const handlers = { onParChange: jest.fn(), onEndRound: jest.fn(), onOpenBag: jest.fn() };
    const utils = render(
        <HoleScoreHeader holeNumber={2} courseName="New course" par={4} {...handlers} {...overrides} />
    );
    return { ...utils, ...handlers };
};

describe('HoleScoreHeader progress bar', () => {
    it('shouldFillTheProgressBarByThePlayPosition', () => {
        const { StyleSheet } = require('react-native');
        const { getByTestId } = renderHeader({ holePosition: 9, totalHoles: 18 });

        expect(StyleSheet.flatten(getByTestId('hole-status-fill').props.style).width).toBe('50%');
    });

    it('shouldShowNoTextInTheStatusLine', () => {
        const { queryByText, queryByTestId } = renderHeader({ holePosition: 2, totalHoles: 18 });

        expect(queryByTestId('hole-status-text')).toBeNull();
        expect(queryByText('Hole 2 of 18')).toBeNull();
    });

    it('shouldShowTheProgressBarBelowTheParOptions', () => {
        const collectTestIds = (node: any): string[] => {
            if (!node || typeof node !== 'object') return [];
            const own = node.props?.testID ? [node.props.testID] : [];
            const children = Array.isArray(node.children) ? node.children : [];
            return [...own, ...children.flatMap(collectTestIds)];
        };
        const { toJSON } = renderHeader({ holePosition: 2, totalHoles: 18 });

        const ids = collectTestIds(toJSON());
        expect(ids.indexOf('hole-status-fill')).toBeGreaterThan(ids.indexOf('par-5-button'));
    });
});

describe('HoleScoreHeader', () => {
    it('shouldShowTheHoleNumberCourseAndParOptions', () => {
        const { getByText, getByTestId } = renderHeader();

        expect(getByTestId('hole-number-text')).toHaveTextContent('Hole 2');
        expect(getByTestId('hole-course-name')).toHaveTextContent('New course');
        expect(getByTestId('par-3-button')).toBeTruthy();
        expect(getByText('Par 4')).toBeTruthy();
        expect(getByTestId('par-5-button')).toBeTruthy();
    });

    it('shouldReportTheParChosen', () => {
        const { getByTestId, onParChange } = renderHeader();

        fireEvent.press(getByTestId('par-3-button'));

        expect(onParChange).toHaveBeenCalledWith(3);
    });

    it('shouldReportEndRoundAndBagPresses', () => {
        const { getByTestId, onEndRound, onOpenBag } = renderHeader();

        fireEvent.press(getByTestId('end-round-button'));
        fireEvent.press(getByTestId('open-bag-button'));

        expect(onEndRound).toHaveBeenCalledTimes(1);
        expect(onOpenBag).toHaveBeenCalledTimes(1);
    });
});
