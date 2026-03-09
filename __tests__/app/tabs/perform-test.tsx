import React, { act } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import Perform from '../../../app/(tabs)/perform';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({ landscapePadding: {} }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

describe('Perform', () => {
    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<Perform />);
        expect(toJSON()).toBeTruthy();
    });

    it('displaysApproachShotsHeaderByDefault', () => {
        const { getByText } = render(<Perform />);
        expect(getByText('Approach shots')).toBeTruthy();
    });

    it('displaysApproachSubheaderText', () => {
        const { getByText } = render(<Perform />);
        expect(getByText('Make better on course decisions & choose better targets')).toBeTruthy();
    });

    it('displaysConceptsChevrons', () => {
        const { getByText } = render(<Perform />);
        expect(getByText('Concepts')).toBeTruthy();
    });

    it('displaysKeyText', () => {
        const { getByText } = render(<Perform />);
        expect(getByText('Key')).toBeTruthy();
    });

    it('displaysDispersionFootnote', () => {
        const { getByText } = render(<Perform />);
        expect(getByText(/Your dispersion changes with different clubs/)).toBeTruthy();
    });

    it('showsProsSectionWhenProsSubMenuPressed', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Perform')).toBeTruthy();
    });

    it('displaysManageExpectationsTextInProsSection', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Manage your expectations, better!')).toBeTruthy();
    });

    it('showsApproachSubheadingAtDefaultIndex', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Average proximity to the hole')).toBeTruthy();
    });

    it('showsPGASourceAtDefaultIndex', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Source: PGA tour online statistics website')).toBeTruthy();
    });

    it('hasFlatListWithPerformTestID', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByTestId('perform-flat-list')).toBeTruthy();
    });

    it('renderItemShowsApproachTableHeaders', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Distance')).toBeTruthy();
        expect(getByText('Fairway')).toBeTruthy();
        expect(getByText('Rough')).toBeTruthy();
    });

    it('renderItemShowsPuttingTableHeaders', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Distance (feet)')).toBeTruthy();
        expect(getByText('Make rate')).toBeTruthy();
    });

    it('scrollingFlatListShowsPuttingSubheading', () => {
        const { getByTestId, getByText, UNSAFE_getAllByType } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

        act(() => {
            UNSAFE_getAllByType(FlatList)[0].props.onScroll({
                nativeEvent: { contentOffset: { x: 375 } },
            });
        });

        expect(getByText('Putts')).toBeTruthy();
    });

    it('scrollingFlatListShowsProfessionalMaleGolferText', () => {
        const { getByTestId, getByText, UNSAFE_getAllByType } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

        act(() => {
            UNSAFE_getAllByType(FlatList)[0].props.onScroll({
                nativeEvent: { contentOffset: { x: 375 } },
            });
        });

        expect(getByText('Professional male golfer make percentages')).toBeTruthy();
    });

    it('scrollingFlatListShowsPuttingSource', () => {
        const { getByTestId, getByText, UNSAFE_getAllByType } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

        act(() => {
            UNSAFE_getAllByType(FlatList)[0].props.onScroll({
                nativeEvent: { contentOffset: { x: 375 } },
            });
        });

        expect(getByText(/The Lost Art of Putting/)).toBeTruthy();
    });

    describe('onRefresh', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        it('onRefreshShowsRefreshingOverlay', () => {
            const { UNSAFE_getByType, getByText } = render(<Perform />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });

            expect(getByText('Release to update')).toBeTruthy();
        });

        it('onRefreshHidesOverlayAfterTimeout', () => {
            const { UNSAFE_getByType, queryByText } = render(<Perform />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(queryByText('Release to update')).toBeNull();
        });

        it('onRefreshResetsSectionToApproach', () => {
            const { getByTestId, UNSAFE_getByType, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            expect(getByText('Perform')).toBeTruthy();

            const scrollView = UNSAFE_getByType(ScrollView);
            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(getByText('Approach shots')).toBeTruthy();
        });
    });
});
