import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import MyBag from '../../app/(tabs)/my-bag';
import { ONBOARDING_STEPS } from '../../assets/onboardingSteps';

const mockPush = jest.fn();

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe('My Bag screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldShowMyBagTitle', () => {
        const { getByText } = render(<MyBag />);

        expect(getByText('My Bag')).toBeTruthy();
    });

    it('shouldShowYardagesSectionLabel', () => {
        const { getByText } = render(<MyBag />);

        expect(getByText('Yardages')).toBeTruthy();
    });

    it('shouldShowDistancesRowWithItsSubtitle', () => {
        const { getByTestId, getByText } = render(<MyBag />);

        expect(getByTestId('bag-row-distances')).toBeTruthy();
        expect(getByText('Distances')).toBeTruthy();
        expect(getByText('Carry and total for every club')).toBeTruthy();
    });

    it('shouldShowWedgeChartRowWithItsSubtitle', () => {
        const { getByTestId, getByText } = render(<MyBag />);

        expect(getByTestId('bag-row-wedge-chart')).toBeTruthy();
        expect(getByText('Wedge Chart')).toBeTruthy();
        expect(getByText('Partial-swing yardages')).toBeTruthy();
    });

    it('shouldNotShowFootnoteAboutTheBagButtonDuringARound', () => {
        const { queryByText } = render(<MyBag />);

        expect(queryByText(/Also available from the bag button/)).toBeNull();
    });

    it('shouldOpenDistancesScreenWhenDistancesRowPressed', () => {
        const { getByTestId } = render(<MyBag />);

        fireEvent.press(getByTestId('bag-row-distances'));

        expect(mockPush).toHaveBeenCalledWith('/play/distances');
    });

    it('shouldOpenWedgeChartScreenWhenWedgeChartRowPressed', () => {
        const { getByTestId } = render(<MyBag />);

        fireEvent.press(getByTestId('bag-row-wedge-chart'));

        expect(mockPush).toHaveBeenCalledWith('/play/wedge-chart');
    });

    it('shouldNotShowClubsSection', () => {
        const { queryByText, queryByTestId } = render(<MyBag />);

        expect(queryByText('Clubs')).toBeNull();
        expect(queryByText('Clubs in bag')).toBeNull();
        expect(queryByTestId('bag-row-clubs')).toBeNull();
    });

    it('shouldNotShowTheInlineSubMenu', () => {
        const { queryByTestId } = render(<MyBag />);

        expect(queryByTestId('bag-sub-menu-distances')).toBeNull();
        expect(queryByTestId('bag-sub-menu-wedge-chart')).toBeNull();
    });

    describe('info overlay', () => {
        it('shouldShowAnInfoButtonInAWhiteCircleLikeTheOtherHeaders', () => {
            const colours = require('../../assets/colours').default;
            const { getByTestId } = render(<MyBag />);

            expect(getByTestId('bag-info-button')).toHaveStyle({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colours.backgroundLight,
            });
        });

        it('shouldOpenTheBagOverlayWhenTheInfoButtonIsPressed', () => {
            const { getByTestId, queryByTestId, getByText } = render(<MyBag />);
            expect(queryByTestId('onboarding-overlay')).toBeNull();

            fireEvent.press(getByTestId('bag-info-button'));

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
            expect(getByText(ONBOARDING_STEPS.bag[0].text)).toBeTruthy();
        });

        it('shouldCloseTheBagOverlayWhenItIsDismissed', () => {
            const { getByTestId, queryByTestId } = render(<MyBag />);
            fireEvent.press(getByTestId('bag-info-button'));

            fireEvent.press(getByTestId('done-button'));

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });
    });

    it('shouldUseARulerIconForDistances', () => {
        const { UNSAFE_getByProps } = render(<MyBag />);

        expect(UNSAFE_getByProps({ name: 'straighten' })).toBeTruthy();
    });

    it('shouldUseATableIconForTheWedgeChart', () => {
        const { UNSAFE_getByProps } = render(<MyBag />);

        expect(UNSAFE_getByProps({ name: 'table-rows' })).toBeTruthy();
    });
});
