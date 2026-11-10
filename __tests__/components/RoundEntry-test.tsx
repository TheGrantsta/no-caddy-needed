import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RoundEntry from '../../components/RoundEntry';
import styles from '../../assets/styles';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({ theme: 'dark', colours: require('../../assets/colours').default }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const renderEntry = (onShowOnboarding = jest.fn()) =>
    render(
        <RoundEntry
            incompleteRound={null}
            onContinueRound={jest.fn()}
            onEndIncompleteRound={jest.fn()}
            recentCourseNames={[]}
            onStartRound={jest.fn()}
            onRemoveCourse={jest.fn()}
            onShowOnboarding={onShowOnboarding}
        />
    );

describe('RoundEntry header', () => {
    it('shouldShowThePlayTitleInTheSharedPageHeaderStyle', () => {
        const { getByText } = renderEntry();

        expect(getByText('Play')).toHaveStyle(styles.pageHeader.title);
    });

    it('shouldOpenHelpFromTheInfoButtonOnTheRightOfTheTitle', () => {
        const onShowOnboarding = jest.fn();
        const { getByTestId } = renderEntry(onShowOnboarding);

        fireEvent.press(getByTestId('play-onboarding-info-button'));

        expect(onShowOnboarding).toHaveBeenCalledTimes(1);
    });
});
