import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ExpandableInfoCard from '../../components/ExpandableInfoCard';

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: ({ name }: { name: string }) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const points = ['First point', 'Second point'];

describe('ExpandableInfoCard', () => {
    it('shouldShowTheTitleWithTheIconAndClosedArrowButHideThePointsByDefault', () => {
        const { getByText, queryByText, queryByTestId, getByTestId } = render(
            <ExpandableInfoCard icon="tune" title="Setup" points={points} testIDPrefix="setup" />
        );

        expect(getByText('Setup')).toBeTruthy();
        expect(getByText('tune')).toBeTruthy();
        expect(getByText('keyboard-arrow-down')).toBeTruthy();
        expect(queryByText('First point')).toBeNull();
        expect(queryByTestId('setup-points')).toBeNull();
        expect(getByTestId('setup-card')).toBeTruthy();
    });

    it('shouldShowEachPointWithAChevronMarkerWhenOpened', () => {
        const { getByTestId, getByText, getAllByText } = render(
            <ExpandableInfoCard icon="tune" title="Setup" points={points} testIDPrefix="setup" />
        );

        fireEvent.press(getByTestId('setup-row'));

        expect(getByTestId('setup-points')).toBeTruthy();
        expect(getByText('First point')).toBeTruthy();
        expect(getByText('Second point')).toBeTruthy();
        expect(getAllByText('chevron-right')).toHaveLength(2);
        expect(getByText('keyboard-arrow-up')).toBeTruthy();
    });

    it('shouldHideThePointsAgainWhenClosed', () => {
        const { getByTestId, queryByText } = render(
            <ExpandableInfoCard icon="tune" title="Setup" points={points} testIDPrefix="setup" />
        );

        fireEvent.press(getByTestId('setup-row'));
        fireEvent.press(getByTestId('setup-row'));

        expect(queryByText('First point')).toBeNull();
    });
});
