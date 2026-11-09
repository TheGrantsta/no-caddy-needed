import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DrillHistorySection from '@/components/DrillHistorySection';
import { Animated } from 'react-native';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text: IconText } = require('react-native');
    return {
        MaterialIcons: ({ name }: { name: string }) => <IconText>{name}</IconText>,
    };
});

const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

describe('DrillHistorySection', () => {
    const mockFadeAnim = new Animated.Value(1);
    const mockSlideAnim = new Animated.Value(0);

    const renderHistory = (drills: { Name: string; Score?: number; Created_At: string; Timestamp?: string }[], overrides: object = {}) =>
        render(
            <DrillHistorySection
                fadeAnim={mockFadeAnim}
                slideAnim={mockSlideAnim}
                loading={false}
                allDrillHistory={drills}
                displayedDrillHistory={drills}
                isLoadingMore={false}
                onLoadMore={() => { }}
                {...overrides}
            />
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldShowTheThisWeekHeadingForDrillsFromTheLastSevenDays', () => {
        const { getByText } = renderHistory([{ Name: 'Lag Putting', Score: 8, Created_At: daysAgo(1) }]);

        expect(getByText('THIS WEEK')).toBeTruthy();
    });

    it('shouldShowThePreviouslyHeadingForOlderDrills', () => {
        const { getByText, queryByText } = renderHistory([{ Name: 'Lag Putting', Score: 8, Created_At: daysAgo(30) }]);

        expect(getByText('PREVIOUSLY')).toBeTruthy();
        expect(queryByText('LAST WEEK')).toBeNull();
        expect(queryByText('THIS WEEK')).toBeNull();
    });

    it('shouldUseTheFullTimestampForTheDateWhenItIsGiven', () => {
        const { getByText, queryByText } = renderHistory([
            { Name: 'Short-Putting Ladder', Score: 15, Created_At: '09/11', Timestamp: daysAgo(0) },
        ]);

        expect(getByText('THIS WEEK')).toBeTruthy();
        expect(getByText('Today')).toBeTruthy();
        expect(queryByText('—')).toBeNull();
    });

    it('shouldShowEachDrillsChallengeName', () => {
        const { getByText } = renderHistory([{ Name: 'Short-Putting Ladder', Score: 15, Created_At: daysAgo(0) }]);

        expect(getByText('Short-putting ladder')).toBeTruthy();
    });

    it('shouldShowTodayForADrillFromToday', () => {
        const { getByText } = renderHistory([{ Name: 'Short-Putting Ladder', Score: 15, Created_At: daysAgo(0) }]);

        expect(getByText('Today')).toBeTruthy();
    });

    it('shouldShowTheScoreWithAScoreCaption', () => {
        const { getByText } = renderHistory([{ Name: 'Short-Putting Ladder', Score: 15, Created_At: daysAgo(0) }]);

        expect(getByText('15')).toBeTruthy();
        expect(getByText('score')).toBeTruthy();
    });

    it('shouldShowTheChallengeIconInATile', () => {
        const { getByText } = renderHistory([{ Name: 'Lag Putting', Score: 8, Created_At: daysAgo(0) }]);

        expect(getByText('trending-up')).toBeTruthy();
    });

    it('shouldNotShowTheOldColumnHeadings', () => {
        const { queryByText } = renderHistory([{ Name: 'Lag Putting', Score: 8, Created_At: daysAgo(0) }]);

        expect(queryByText('Challenge')).toBeNull();
        expect(queryByText('Date')).toBeNull();
    });

    it('displays Up-and-down Challenge score with percent sign', () => {
        const { getByText } = renderHistory([{ Name: 'Up-and-down Challenge', Score: 100, Created_At: daysAgo(0) }]);

        expect(getByText('100%')).toBeTruthy();
    });

    it('displays other drill scores without percent sign', () => {
        const { getByText, queryByText } = renderHistory([{ Name: 'Short-Putting Ladder', Score: 7, Created_At: daysAgo(0) }]);

        expect(getByText('7')).toBeTruthy();
        expect(queryByText('7%')).toBeFalsy();
    });

    it('displays missing scores as dash', () => {
        const { getByText } = renderHistory([{ Name: 'Some Challenge', Score: undefined, Created_At: daysAgo(0) }]);

        expect(getByText('—')).toBeTruthy();
    });

    it('shouldShowLoadMoreWhenThereAreMoreDrillsToShow', () => {
        const drills = [{ Name: 'Lag Putting', Score: 8, Created_At: daysAgo(0) }];
        const onLoadMore = jest.fn();
        const { getByTestId } = renderHistory(drills, { allDrillHistory: [...drills, ...drills], onLoadMore });

        fireEvent.press(getByTestId('load-more-button'));

        expect(onLoadMore).toHaveBeenCalled();
    });

    it('shouldShowTheNoHistoryMessageWhenThereAreNoDrills', () => {
        const { getByText } = renderHistory([]);

        expect(getByText('No challenge history yet')).toBeTruthy();
    });
});
