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
        const { getByText } = renderInEditMode();
        expect(getByText('Wedge Chart')).toBeTruthy();
    });

    it('renders the carry distance note below the save button', () => {
        const { getByTestId, getByText } = renderInEditMode();

        expect(getByTestId('save-wedge-chart-button')).toBeTruthy();
        expect(getByText('Carry distance, not total')).toBeTruthy();
    });

    it('does not render an info button in the heading, matching Distances', () => {
        const { queryByTestId } = renderInEditMode();
        expect(queryByTestId('info-button')).toBeNull();
    });

    it('shows the back button as a white circle like the Distances heading', () => {
        const { StyleSheet } = require('react-native');
        const colours = require('../../../assets/colours').default;
        const { getByTestId } = renderInEditMode();
        const style = StyleSheet.flatten(getByTestId('wedge-back-button').props.style);

        expect(style.backgroundColor).toBe(colours.backgroundLight);
        expect(style.borderRadius).toBe(22);
    });

    it('shows save button', () => {
        const { getByTestId } = renderInEditMode();
        expect(getByTestId('save-wedge-chart-button')).toBeTruthy();
    });

    it('shows add club button', () => {
        const { getByTestId } = renderInEditMode();
        expect(getByTestId('add-wedge-club-button')).toBeTruthy();
    });

    it('styles add club like the Distances add club row', () => {
        const { StyleSheet } = require('react-native');
        const colours = require('../../../assets/colours').default;
        const { getByTestId } = renderInEditMode();

        const style = StyleSheet.flatten(getByTestId('add-wedge-club-button').props.style);

        expect(style.backgroundColor).toBe(colours.backgroundLight);
        expect(style.borderRadius).toBeGreaterThanOrEqual(14);
        expect(style.alignSelf).toBe('flex-start');
        expect(style.paddingHorizontal).toBeGreaterThanOrEqual(16);
    });

    it('aligns the add buttons to the left like the Distances list', () => {
        const { StyleSheet } = require('react-native');
        const { getByTestId } = renderInEditMode();

        const row = StyleSheet.flatten(getByTestId('wedge-add-buttons-row').props.style);
        expect(row.justifyContent).toBe('flex-start');
    });

    it('leaves space between the add buttons and Save like the Distances list', () => {
        const { StyleSheet } = require('react-native');
        const { getByTestId } = renderInEditMode();

        expect(StyleSheet.flatten(getByTestId('save-wedge-chart-button').props.style).marginTop).toBeGreaterThanOrEqual(24);
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

            fireEvent.press(getByTestId('save-wedge-chart-button'));

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

            fireEvent.press(getByTestId('save-wedge-chart-button'));

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
            expect(queryByTestId('save-wedge-chart-button')).toBeNull();
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

            expect(getByTestId('save-wedge-chart-button')).toBeTruthy();
            expect(getByTestId('wedge-edit-button')).toHaveTextContent('Done');
        });

        it('shouldReturnToTheReadOnlyTableWhenDonePressed', () => {
            mockGetWedgeChartService.mockReturnValue(savedChart);
            const { getByTestId, queryByTestId } = render(<WedgeChartScreen />);

            fireEvent.press(getByTestId('wedge-edit-button'));
            fireEvent.press(getByTestId('wedge-edit-button'));

            expect(queryByTestId('save-wedge-chart-button')).toBeNull();
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
            fireEvent.press(getByTestId('save-wedge-chart-button'));

            await waitFor(() => {
                expect(queryByTestId('save-wedge-chart-button')).toBeNull();
                expect(getByTestId('wedge-read-row-0')).toBeTruthy();
            });
        });
    });

    describe('back navigation', () => {
        it('shouldShowABackButtonThatReturnsToThePreviousScreen', () => {
            const { getByTestId } = renderInEditMode();

            fireEvent.press(getByTestId('wedge-back-button'));

            expect(mockBack).toHaveBeenCalled();
        });
    });

    describe('column widths', () => {
        const { StyleSheet } = require('react-native');

        it('shouldMakeTheDistanceNameColumnWiderThanAClubColumn', () => {
            const { getByTestId } = renderInEditMode();
            fireEvent.press(getByTestId('add-wedge-club-button'));
            fireEvent.press(getByTestId('add-wedge-distance-button'));

            const labelWidth = parseFloat(StyleSheet.flatten(getByTestId('wedge-distance-name-cell-0').props.style).width);
            const clubWidth = parseFloat(StyleSheet.flatten(getByTestId('wedge-club-column-0').props.style).width);

            expect(labelWidth).toBeGreaterThan(clubWidth);
        });
    });

    describe('iOS-style grid', () => {
        const colours = require('../../../assets/colours').default;
        const { StyleSheet } = require('react-native');

        it('shouldShowTheGridInsideAWhiteRoundedCard', () => {
            const { getByTestId } = renderInEditMode();
            const style = StyleSheet.flatten(getByTestId('wedge-grid-card').props.style);

            expect(style.backgroundColor).toBe(colours.backgroundLight);
            expect(style.borderRadius).toBeGreaterThanOrEqual(14);
        });

        it('shouldShowADashInTheCornerColumnInsteadOfDistanceOrX', () => {
            const { getByTestId, queryByText } = renderInEditMode();

            fireEvent.press(getByTestId('add-wedge-club-button'));

            expect(getByTestId('wedge-corner-label')).toHaveTextContent('-');
            expect(queryByText('Distance')).toBeNull();
            expect(queryByText('X')).toBeNull();
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

    it('does not show add distance button when chart is empty', () => {
        const { queryByTestId } = renderInEditMode();
        expect(queryByTestId('add-wedge-distance-button')).toBeNull();
    });

    it('shows add distance button after adding a club', () => {
        const { getByTestId, queryByTestId } = renderInEditMode();

        // Initially, add distance button should not be visible
        expect(queryByTestId('add-wedge-distance-button')).toBeNull();

        // Add a club
        fireEvent.press(getByTestId('add-wedge-club-button'));

        // Now add distance button should be visible
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
                fireEvent.press(getByTestId('save-wedge-chart-button'));
            });

            expect(mockSaveWedgeChartService).toHaveBeenCalled();
        });
    });
});
