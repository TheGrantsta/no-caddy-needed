import React from 'react';
import { render } from '@testing-library/react-native';
import DrillHistorySection from '@/components/DrillHistorySection';
import { Animated } from 'react-native';

// Mock the useStyles and useThemeColours hooks
jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        flexOne: {},
        normalText: {},
        subHeaderText: {},
        cell: {},
        divider: {},
    }),
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
    }),
}));

describe('DrillHistorySection', () => {
    const mockFadeAnim = new Animated.Value(1);
    const mockSlideAnim = new Animated.Value(0);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('displays Up-and-Down Challenge score with percent sign', () => {
        const drillHistory = [
            { Name: 'Up-and-Down Challenge', Score: 100, Created_At: '01/10' },
        ];

        const { getByText } = render(
            <DrillHistorySection
                fadeAnim={mockFadeAnim}
                slideAnim={mockSlideAnim}
                loading={false}
                allDrillHistory={drillHistory}
                displayedDrillHistory={drillHistory}
                isLoadingMore={false}
                onLoadMore={() => {}}
            />
        );

        expect(getByText('100%')).toBeTruthy();
    });

    it('displays other drill scores without percent sign', () => {
        const drillHistory = [
            { Name: 'Short-Putting Ladder', Score: 7, Created_At: '01/10' },
        ];

        const { getByText, queryByText } = render(
            <DrillHistorySection
                fadeAnim={mockFadeAnim}
                slideAnim={mockSlideAnim}
                loading={false}
                allDrillHistory={drillHistory}
                displayedDrillHistory={drillHistory}
                isLoadingMore={false}
                onLoadMore={() => {}}
            />
        );

        expect(getByText('7')).toBeTruthy();
        expect(queryByText('7%')).toBeFalsy();
    });

    it('displays missing scores as dash', () => {
        const drillHistory = [
            { Name: 'Some Challenge', Score: undefined, Created_At: '01/10' },
        ];

        const { getByText } = render(
            <DrillHistorySection
                fadeAnim={mockFadeAnim}
                slideAnim={mockSlideAnim}
                loading={false}
                allDrillHistory={drillHistory}
                displayedDrillHistory={drillHistory}
                isLoadingMore={false}
                onLoadMore={() => {}}
            />
        );

        expect(getByText('—')).toBeTruthy();
    });
});
