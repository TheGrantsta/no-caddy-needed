import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Reminders from '../../../app/tools/reminders';
import { getPracticeRemindersService, addPracticeReminderService, deletePracticeReminderService, getTopSinsForPracticePlanService, getSettingsService } from '../../../service/DbService';
import { schedulePracticeReminder, cancelPracticeReminder, upgradeOverdueRemindersService } from '../../../service/NotificationService';

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

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
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

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
    const { View, TouchableOpacity } = require('react-native');
    const MockSwipeable = ({ children, renderRightActions, onSwipeableWillOpen, onSwipeableClose }: any) => (
        <View>
            {children}
            {renderRightActions && renderRightActions()}
            <TouchableOpacity testID="swipeable-trigger-open" onPress={onSwipeableWillOpen} />
            <TouchableOpacity testID="swipeable-trigger-close" onPress={onSwipeableClose} />
        </View>
    );
    return { __esModule: true, default: MockSwipeable };
});

jest.mock('../../../service/NotificationService', () => ({
    schedulePracticeReminder: jest.fn(),
    cancelPracticeReminder: jest.fn(),
    upgradeOverdueRemindersService: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../service/DbService', () => ({
    getPracticeRemindersService: jest.fn().mockReturnValue([]),
    addPracticeReminderService: jest.fn().mockResolvedValue(true),
    deletePracticeReminderService: jest.fn().mockResolvedValue(true),
    getTopSinsForPracticePlanService: jest.fn().mockReturnValue([]),
    getSettingsService: jest.fn().mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 }),
}));

const mockGetPracticeRemindersService = getPracticeRemindersService as jest.Mock;
const mockAddPracticeReminderService = addPracticeReminderService as jest.Mock;
const mockDeletePracticeReminderService = deletePracticeReminderService as jest.Mock;
const mockSchedulePracticeReminder = schedulePracticeReminder as jest.Mock;
const mockCancelPracticeReminder = cancelPracticeReminder as jest.Mock;
const mockUpgradeOverdueRemindersService = upgradeOverdueRemindersService as jest.Mock;
const mockGetTopSinsForPracticePlanService = getTopSinsForPracticePlanService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;

describe('Reminders screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPracticeRemindersService.mockReturnValue([]);
        mockSchedulePracticeReminder.mockResolvedValue('notif-id-1');
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });
    });

    it('renders the screen heading', () => {
        const { getByText } = render(<Reminders />);
        expect(getByText('Practice reminders')).toBeTruthy();
    });

    it('shows no reminders message when list is empty', () => {
        const { getByText } = render(<Reminders />);
        expect(getByText('No reminders set')).toBeTruthy();
    });

    it('shouldShowAddReminderButtonInRemindersSection', () => {
        const { getByTestId } = render(<Reminders />);
        expect(getByTestId('add-reminder-button')).toBeTruthy();
    });

    it('shouldShowAddFormWhenAddReminderPressed', () => {
        const { getByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        expect(getByTestId('reminder-label-input')).toBeTruthy();
        expect(getByTestId('reminder-date-picker')).toBeTruthy();
    });

    it('shouldSetTodayAsMinimumDateOnDatePicker', () => {
        const { getByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        const picker = getByTestId('reminder-date-picker');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expect(picker.props.minimumDate.toDateString()).toBe(today.toDateString());
    });

    it('doesNotSaveTwiceIfSaveButtonPressedWhileSaveInProgress', async () => {
        const resolvers: (() => void)[] = [];
        mockSchedulePracticeReminder.mockImplementation(() => new Promise(resolve => {
            resolvers.push(() => resolve('notif-id'));
        }));

        const { getByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        fireEvent.changeText(getByTestId('reminder-label-input'), 'Test reminder');

        // Tap Save twice before first resolves
        fireEvent.press(getByTestId('save-reminder-button'));
        fireEvent.press(getByTestId('save-reminder-button'));

        // Resolve all pending saves
        await act(async () => { resolvers.forEach(r => r()); });

        // Should only save once despite two taps
        expect(mockAddPracticeReminderService).toHaveBeenCalledTimes(1);
    });

    it('shouldShowErrorWhenSavingWithEmptyLabel', () => {
        const { getByTestId, getByText } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        fireEvent.press(getByTestId('save-reminder-button'));
        expect(getByText('Reminder label is required')).toBeTruthy();
    });

    it('shouldNotSaveWhenLabelIsEmpty', () => {
        const { getByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        fireEvent.press(getByTestId('save-reminder-button'));
        expect(mockSchedulePracticeReminder).not.toHaveBeenCalled();
        expect(mockAddPracticeReminderService).not.toHaveBeenCalled();
    });

    it('shouldShowOverdueLabelForPastReminder', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2020-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2019-12-31T09:00:00.000Z' }
        ]);
        const { getByText } = render(<Reminders />);
        expect(getByText('Overdue')).toBeTruthy();
    });

    it('shouldNotShowOverdueLabelForFutureReminder', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2099-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' }
        ]);
        const { queryByText } = render(<Reminders />);
        expect(queryByText('Overdue')).toBeNull();
    });

    it('shouldSaveReminderAndHideFormOnSave', async () => {
        const { getByTestId, queryByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        fireEvent.changeText(getByTestId('reminder-label-input'), 'Morning putting');
        fireEvent.press(getByTestId('save-reminder-button'));
        await waitFor(() => {
            expect(mockSchedulePracticeReminder).toHaveBeenCalledWith('Morning putting', expect.any(Date));
            expect(mockAddPracticeReminderService).toHaveBeenCalled();
            expect(queryByTestId('reminder-label-input')).toBeNull();
        });
    });

    it('shouldScheduleNotificationAt9amOnDueDate', async () => {
        const { getByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        fireEvent.changeText(getByTestId('reminder-label-input'), 'Morning putting');
        fireEvent(getByTestId('reminder-date-picker'), 'onChange', {}, new Date('2099-06-15T14:30:00.000Z'));
        fireEvent.press(getByTestId('save-reminder-button'));
        await waitFor(() => {
            const scheduledDate: Date = mockSchedulePracticeReminder.mock.calls[0][1];
            expect(scheduledDate.getHours()).toBe(9);
            expect(scheduledDate.getMinutes()).toBe(0);
            expect(scheduledDate.getSeconds()).toBe(0);
        });
    });

    it('shouldShowReminderInListAfterSaving', async () => {
        mockGetPracticeRemindersService
            .mockReturnValueOnce([])
            .mockReturnValue([{ Id: 1, Label: 'Morning putting', ScheduledFor: '2026-03-15T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' }]);

        const { getByTestId, getByText } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        fireEvent.changeText(getByTestId('reminder-label-input'), 'Morning putting');
        fireEvent.press(getByTestId('save-reminder-button'));

        await waitFor(() => {
            expect(getByText('Morning putting')).toBeTruthy();
        });
    });

    it('shouldDeleteReminderWhenDeletePressed', async () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2026-03-15T08:00:00.000Z', NotificationId: 'notif-1', Created_At: '2026-03-12T09:00:00.000Z' }
        ]);

        const { getByTestId } = render(<Reminders />);
        fireEvent.press(getByTestId('delete-reminder-1'));

        await waitFor(() => {
            expect(mockDeletePracticeReminderService).toHaveBeenCalledWith(1);
            expect(mockCancelPracticeReminder).toHaveBeenCalledWith('notif-1');
        });
    });

    it('shouldDisplayRemindersSortedSoonestFirst', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Far future', ScheduledFor: '2099-06-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-01-01T00:00:00.000Z' },
            { Id: 2, Label: 'Near future', ScheduledFor: '2026-04-01T08:00:00.000Z', NotificationId: 'n2', Created_At: '2026-01-01T00:00:00.000Z' },
            { Id: 3, Label: 'Medium future', ScheduledFor: '2050-01-01T08:00:00.000Z', NotificationId: 'n3', Created_At: '2026-01-01T00:00:00.000Z' },
        ]);
        const { getAllByText } = render(<Reminders />);
        const labels = getAllByText(/Near future|Medium future|Far future/).map(el => el.props.children);
        expect(labels).toEqual(['Near future', 'Medium future', 'Far future']);
    });

    it('hides add form when cancel is pressed', () => {
        const { getByTestId, queryByTestId, getByText } = render(<Reminders />);
        fireEvent.press(getByTestId('add-reminder-button'));
        expect(getByTestId('reminder-label-input')).toBeTruthy();
        fireEvent.press(getByText('Cancel'));
        expect(queryByTestId('reminder-label-input')).toBeNull();
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
            const { UNSAFE_getByType, getByText } = render(<Reminders />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });

            expect(getByText('Release to update')).toBeTruthy();
        });

        it('onRefreshHidesOverlayAfterTimeout', () => {
            const { UNSAFE_getByType, queryByText } = render(<Reminders />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(queryByText('Release to update')).toBeNull();
        });

        it('onRefreshReloadsReminders', () => {
            const updatedReminders = [
                { Id: 1, Label: 'Evening chipping', ScheduledFor: '2026-03-15T18:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' }
            ];
            mockGetPracticeRemindersService
                .mockReturnValueOnce([])
                .mockReturnValue(updatedReminders);

            const { UNSAFE_getByType, getByText } = render(<Reminders />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
                jest.advanceTimersByTime(750);
            });

            expect(getByText('Evening chipping')).toBeTruthy();
        });
    });

    describe('generate practice plan', () => {
        it('showsGeneratePracticePlanButton', () => {
            const { getByTestId } = render(<Reminders />);
            expect(getByTestId('generate-practice-plan-button')).toBeTruthy();
        });

        it('createsThreeRemindersForTopSinOnly', async () => {
            mockGetTopSinsForPracticePlanService.mockReturnValue([
                { reminderLabel: 'Putting practice — reduce 3-putts', drillLabel: 'Ladder', count: 5 },
                { reminderLabel: 'Chipping practice — eliminate double chips', drillLabel: 'Hoop', count: 3 },
            ]);
            mockSchedulePracticeReminder.mockResolvedValue('notif-id');
            const { getByTestId } = render(<Reminders />);
            await act(async () => {
                fireEvent.press(getByTestId('generate-practice-plan-button'));
            });
            // only the top sin — 3 sessions, not 6
            expect(mockAddPracticeReminderService).toHaveBeenCalledTimes(3);
        });

        it('schedulesSessionsAtDays0And7And14', async () => {
            mockGetTopSinsForPracticePlanService.mockReturnValue([
                { reminderLabel: 'Putting practice — reduce 3-putts', drillLabel: 'Ladder', count: 5 },
            ]);
            mockSchedulePracticeReminder.mockResolvedValue('notif-id');
            const { getByTestId } = render(<Reminders />);
            await act(async () => {
                fireEvent.press(getByTestId('generate-practice-plan-button'));
            });
            expect(mockSchedulePracticeReminder).toHaveBeenCalledTimes(3);
            const d0 = new Date(mockSchedulePracticeReminder.mock.calls[0][1]);
            const d7 = new Date(mockSchedulePracticeReminder.mock.calls[1][1]);
            const d14 = new Date(mockSchedulePracticeReminder.mock.calls[2][1]);
            expect((d7.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24)).toBe(7);
            expect((d14.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24)).toBe(14);
        });

        it('labelsEachReminderWithSessionNumber', async () => {
            mockGetTopSinsForPracticePlanService.mockReturnValue([
                { reminderLabel: 'Putting practice — reduce 3-putts', drillLabel: 'Ladder', count: 5 },
            ]);
            mockSchedulePracticeReminder.mockResolvedValue('notif-id');
            const { getByTestId } = render(<Reminders />);
            await act(async () => {
                fireEvent.press(getByTestId('generate-practice-plan-button'));
            });
            expect(mockAddPracticeReminderService).toHaveBeenNthCalledWith(1,
                'Putting practice — reduce 3-putts: Ladder drill (Session 1 of 3)', expect.any(String), expect.anything());
            expect(mockAddPracticeReminderService).toHaveBeenNthCalledWith(2,
                'Putting practice — reduce 3-putts: Ladder drill (Session 2 of 3)', expect.any(String), expect.anything());
            expect(mockAddPracticeReminderService).toHaveBeenNthCalledWith(3,
                'Putting practice — reduce 3-putts: Ladder drill (Session 3 of 3)', expect.any(String), expect.anything());
        });

        it('showsNoDataMessageWhenNoSinData', async () => {
            mockGetTopSinsForPracticePlanService.mockReturnValue([]);
            const { getByTestId } = render(<Reminders />);
            await act(async () => {
                fireEvent.press(getByTestId('generate-practice-plan-button'));
            });
            expect(getByTestId('no-sin-data-message')).toBeTruthy();
        });

        it('usesSettingsPracticeFrequencyForSpacing', async () => {
            mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 3 });
            mockGetTopSinsForPracticePlanService.mockReturnValue([
                { reminderLabel: 'Putting practice — reduce 3-putts', drillLabel: 'Ladder', count: 5 },
            ]);
            mockSchedulePracticeReminder.mockResolvedValue('notif-id');
            const { getByTestId } = render(<Reminders />);
            await act(async () => {
                fireEvent.press(getByTestId('generate-practice-plan-button'));
            });
            const d0 = new Date(mockSchedulePracticeReminder.mock.calls[0][1]);
            const d1 = new Date(mockSchedulePracticeReminder.mock.calls[1][1]);
            expect((d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24)).toBe(3);
        });

        it('doesNotRegenerateWhenAnySessionLabelAlreadyExists', async () => {
            mockGetPracticeRemindersService.mockReturnValue([
                { Id: 1, Label: 'Putting practice — reduce 3-putts: Ladder drill (Session 1 of 3)', ScheduledFor: new Date().toISOString(), NotificationId: 'n1', Created_At: new Date().toISOString() },
            ]);
            mockGetTopSinsForPracticePlanService.mockReturnValue([
                { reminderLabel: 'Putting practice — reduce 3-putts', drillLabel: 'Ladder', count: 5 },
            ]);
            mockSchedulePracticeReminder.mockResolvedValue('notif-id');
            const { getByTestId } = render(<Reminders />);
            await act(async () => {
                fireEvent.press(getByTestId('generate-practice-plan-button'));
            });
            expect(mockAddPracticeReminderService).not.toHaveBeenCalled();
        });
    });

    describe('Overdue reminder daily upgrade', () => {
        it('callsUpgradeOverdueRemindersServiceOnMount', async () => {
            render(<Reminders />);

            await waitFor(() => {
                expect(mockUpgradeOverdueRemindersService).toHaveBeenCalled();
            });
        });
    });
});
