import React, { act } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import WedgeChartScreen from '../../../app/play/wedge-chart';
import {
    getSettingsService,
    getWedgeChartService,
    saveSettingsService,
    saveWedgeChartService,
} from '../../../service/DbService';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../service/DbService', () => ({
    getWedgeChartService: jest.fn(),
    saveWedgeChartService: jest.fn(),
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn(),
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
    }),
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

const mockGetWedgeChartService = getWedgeChartService as jest.Mock;
const mockSaveWedgeChartService = saveWedgeChartService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

const defaultSettings = {
    theme: 'dark',
    notificationsEnabled: true,
    wedgeChartOnboardingSeen: true,
    distancesOnboardingSeen: true,
    playOnboardingSeen: true,
    homeOnboardingSeen: true,
    practiceOnboardingSeen: true,
    units: 'yards' as const,
};

const nonEmptyChart = {
    distanceNames: ['Half', 'Full'],
    clubs: [{ name: 'PW', distances: [100, 130] }],
};

describe('Wedge Chart screen', () => {
    // Most tests exercise the editable grid, so they enter edit mode first
    const renderInEditMode = () => {
        const utils = render(<WedgeChartScreen />);
        fireEvent.press(utils.getByTestId('wedge-edit-button'));
        return utils;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetWedgeChartService.mockReturnValue({ distanceNames: [], clubs: [] });
        mockGetSettingsService.mockReturnValue(defaultSettings);
        mockSaveSettingsService.mockResolvedValue(true);
        mockSaveWedgeChartService.mockResolvedValue(true);
    });

    it('renders wedge chart heading', () => {
        const { getByText } = render(<WedgeChartScreen />);
        expect(getByText('Wedge Chart')).toBeTruthy();
    });

    it('renders the carry distance note under the editor', () => {
        const { getByTestId, getByText } = renderInEditMode();

        expect(getByTestId('wedge-done-button')).toBeTruthy();
        expect(getByText('Carry distance, not total')).toBeTruthy();
    });

    it('does not render an info button in the heading, matching Distances', () => {
        const { queryByTestId } = renderInEditMode();
        expect(queryByTestId('info-button')).toBeNull();
    });

    it('shows the back button as a white circle like the Distances heading', () => {
        const { StyleSheet } = require('react-native');
        const colours = require('../../../assets/colours').default;
        const { getByTestId } = render(<WedgeChartScreen />);
        const style = StyleSheet.flatten(getByTestId('wedge-back-button').props.style);

        expect(style.backgroundColor).toBe(colours.backgroundLight);
        expect(style.borderRadius).toBe(22);
    });

    it('shows the plain Wedge Chart title while editing', () => {
        const { getByText, queryByText } = renderInEditMode();

        expect(getByText('Wedge Chart')).toBeTruthy();
        expect(queryByText('Edit Wedge Chart')).toBeNull();
    });

    it('shows Done in the header while editing', () => {
        const { getByTestId } = renderInEditMode();
        expect(getByTestId('wedge-done-button')).toBeTruthy();
    });

    it('shows add club button', () => {
        const { getByTestId } = renderInEditMode();
        expect(getByTestId('add-wedge-club-button')).toBeTruthy();
    });

    describe('removing individual clubs', () => {
        it('shouldNotShowClearAllButtonOnceClubsExist', () => {
            const { getByTestId, queryByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));

            expect(queryByTestId('clear-button')).toBeNull();
        });

        it('shouldShowARemoveControlAboveEachClub', () => {
            const { getByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.press(getByTestId('add-wedge-club-button'));

            expect(getByTestId('wedge-remove-club-0')).toBeTruthy();
            expect(getByTestId('wedge-remove-club-1')).toBeTruthy();
        });

        it('shouldRemoveOnlyThePressedClub', () => {
            const { getByTestId, queryByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.changeText(getByTestId('wedge-club-input-0'), 'Gap');
            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.changeText(getByTestId('wedge-club-input-1'), 'Sand');

            fireEvent.press(getByTestId('wedge-remove-club-0'));

            expect(getByTestId('wedge-club-input-0').props.value).toBe('Sand');
            expect(queryByTestId('wedge-club-input-1')).toBeNull();
        });

        it('shouldShowARemoveControlForEachDistanceRow', () => {
            const { getByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.press(getByTestId('add-wedge-distance-button'));
            fireEvent.press(getByTestId('add-wedge-distance-button'));

            expect(getByTestId('wedge-remove-distance-0')).toBeTruthy();
            expect(getByTestId('wedge-remove-distance-1')).toBeTruthy();
        });

        it('shouldRemoveOnlyThePressedDistanceRow', () => {
            const { getByTestId, queryByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.press(getByTestId('add-wedge-distance-button'));
            fireEvent.changeText(getByTestId('distance-name-input-0'), 'Full');
            fireEvent.press(getByTestId('add-wedge-distance-button'));
            fireEvent.changeText(getByTestId('distance-name-input-1'), '3/4');

            fireEvent.press(getByTestId('wedge-remove-distance-0'));

            expect(getByTestId('distance-name-input-0').props.value).toBe('3/4');
            expect(queryByTestId('distance-name-input-1')).toBeNull();
        });

        it('shouldSaveTheChartWithoutTheRemovedDistanceRow', async () => {
            const { getByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.changeText(getByTestId('wedge-club-input-0'), 'Gap');
            fireEvent.press(getByTestId('add-wedge-distance-button'));
            fireEvent.changeText(getByTestId('distance-name-input-0'), 'Full');
            fireEvent.press(getByTestId('add-wedge-distance-button'));
            fireEvent.changeText(getByTestId('distance-name-input-1'), '3/4');
            fireEvent.press(getByTestId('wedge-remove-distance-0'));

            fireEvent.press(getByTestId('wedge-done-button'));

            await waitFor(() => {
                expect(mockSaveWedgeChartService).toHaveBeenLastCalledWith(
                    expect.objectContaining({ distanceNames: ['3/4'] })
                );
            });
        });

        it('shouldSaveTheChartWithoutTheRemovedClub', async () => {
            const { getByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.changeText(getByTestId('wedge-club-input-0'), 'Gap');
            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.changeText(getByTestId('wedge-club-input-1'), 'Sand');
            fireEvent.press(getByTestId('wedge-remove-club-0'));

            fireEvent.press(getByTestId('wedge-done-button'));

            await waitFor(() => {
                expect(mockSaveWedgeChartService).toHaveBeenLastCalledWith(
                    expect.objectContaining({ clubs: [expect.objectContaining({ club: 'Sand' })] })
                );
            });
        });
    });

    describe('read-only view and edit mode', () => {
        const savedChart = {
            distanceNames: ['½', 'Full'],
            clubs: [{ club: 'PW', distances: [{ name: '½', distance: 75 }, { name: 'Full', distance: 120 }] }],
        };

        it('shouldShowTheReadOnlyTableByDefaultWhenWedgesExist', () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            expect(getByTestId('wedge-read-row-0')).toBeTruthy();
            expect(queryByTestId('wedge-done-button')).toBeNull();
        });

        it('shouldShowTheCarryBySwingLengthSectionLabel', () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByText } = render(<WedgeChartScreen />);

            expect(getByText('Carry by swing length')).toBeTruthy();
        });

        it('shouldShowAnEmptyMessageWhenNoWedgesExist', () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            expect(getByTestId('wedge-empty')).toBeTruthy();
        });

        it('shouldShowEditInTheHeaderAndSwitchToTheEditableGridWhenPressed', () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('wedge-edit-button'));

            expect(getByTestId('wedge-done-button')).toBeTruthy();
            expect(getByTestId('wedge-done-button')).toHaveTextContent('Done');
        });

        it('shouldReturnToTheReadOnlyTableWhenDonePressed', () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('wedge-edit-button'));
            fireEvent.press(getByTestId('wedge-cancel-button'));

            expect(queryByTestId('wedge-done-button')).toBeNull();
            expect(getByTestId('wedge-read-row-0')).toBeTruthy();
        });

        it('shouldKeepTheCarryNoteBelowTheCardInViewMode', () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByText } = render(<WedgeChartScreen />);

            expect(getByText('Carry distance, not total')).toBeTruthy();
        });

        it('shouldReturnToTheReadOnlyTableAfterSaving', async () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('wedge-edit-button'));
            await act(async () => {
                fireEvent.press(getByTestId('wedge-done-button'));
            });

            await waitFor(() => {
                expect(queryByTestId('wedge-done-button')).toBeNull();
                expect(getByTestId('wedge-read-row-0')).toBeTruthy();
            });
        });
    });

    describe('content padding', () => {
        it('shouldInsetScreenContentFromTheEdgesLikeDistances', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<WedgeChartScreen />);

            expect(StyleSheet.flatten(getByTestId('wedge-content').props.style).paddingHorizontal).toBeGreaterThanOrEqual(16);
        });
    });

    describe('back navigation', () => {
        it('shouldShowABackButtonThatReturnsToThePreviousScreen', () => {
            const { getByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('wedge-back-button'));

            expect(mockBack).toHaveBeenCalled();
        });
    });

    describe('iOS-style grid', () => {
        const colours = require('../../../assets/colours').default;
        const { StyleSheet } = require('react-native');

        it('shouldShowTheGridInsideAWhiteRoundedCard', () => {
            const { getByTestId } = renderInEditMode();
            const style = StyleSheet.flatten(getByTestId('wedge-edit-card').props.style);

            expect(style.backgroundColor).toBe(colours.backgroundLight);
            expect(style.borderRadius).toBeGreaterThanOrEqual(14);
        });

        it('shouldUseReadablePlaceholderColourForClubNames', () => {
            const { getByTestId } = renderInEditMode();
            fireEvent.press(getByTestId('add-wedge-club-button'));

            expect(getByTestId('wedge-club-input-0').props.placeholderTextColor).toBe(colours.tertiary);
        });

        it('shouldShowClubNamesWithoutAFilledBackground', () => {
            const { getByTestId } = renderInEditMode();
            fireEvent.press(getByTestId('add-wedge-club-button'));

            expect(StyleSheet.flatten(getByTestId('wedge-club-input-0').props.style).backgroundColor).toBeUndefined();
        });
    });

    it('shows add distance button', () => {
        mockGetWedgeChartService.mockReturnValue(nonEmptyChart);
        const { getByTestId } = renderInEditMode();
        expect(getByTestId('add-wedge-distance-button')).toBeTruthy();
    });

    it('shows add swing length button even when no wedges exist yet', () => {
        const { getByTestId } = renderInEditMode();
        expect(getByTestId('add-wedge-distance-button')).toBeTruthy();
    });

    describe('onboarding', () => {
        it('showsOnboardingWhenWedgeChartOnboardingNotSeen', () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            const { getByTestId } = renderInEditMode();
            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('hidesOnboardingWhenWedgeChartOnboardingSeen', () => {
            const { queryByTestId } = renderInEditMode();
            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('hidesOnboardingWhenChartIsNotEmpty', () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            mockGetWedgeChartService.mockReturnValue(nonEmptyChart);
            const { queryByTestId } = renderInEditMode();
            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('dismissOnboardingHidesOverlay', async () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            const { getByTestId, queryByTestId } = renderInEditMode();
            expect(getByTestId('onboarding-overlay')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('done-button'));
            });

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('dismissOnboardingCallsSaveSettingsWithWedgeChartOnboardingSeenTrue', async () => {
            mockGetSettingsService.mockReturnValue({ ...defaultSettings, wedgeChartOnboardingSeen: false });
            const { getByTestId } = renderInEditMode();

            await act(async () => {
                fireEvent.press(getByTestId('done-button'));
            });

            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ wedgeChartOnboardingSeen: true })
            );
        });
    });

    describe('save chart', () => {
        it('pressSaveButtonCallsSaveWedgeChartService', async () => {
            const { getByTestId } = renderInEditMode();

            await act(async () => {
                fireEvent.press(getByTestId('wedge-done-button'));
            });

            expect(mockSaveWedgeChartService).toHaveBeenCalled();
        });
    });
});
