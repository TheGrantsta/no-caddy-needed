import {
    initializeAnalytics,
    logEvent,
    logDrillCompleted,
    logRoundStarted,
    logRoundEnded,
    logScreenView,
    setUserId,
    setAttribute,
    logBreadcrumb,
    recordError,
} from '../../service/AnalyticsService';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

jest.mock('@react-native-firebase/analytics');
jest.mock('@react-native-firebase/crashlytics');

const mockAnalytics = analytics as jest.Mock;
const mockCrashlytics = crashlytics as jest.Mock;

describe('AnalyticsService', () => {
    let mockLogEvent: jest.Mock;
    let mockLogScreenView: jest.Mock;
    let mockSetCrashlyticsCollectionEnabled: jest.Mock;
    let mockCrashlyticsLog: jest.Mock;
    let mockRecordError: jest.Mock;
    let mockCrashlyticsSetUserId: jest.Mock;
    let mockSetAttribute: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockLogEvent = jest.fn();
        mockLogScreenView = jest.fn();
        mockSetCrashlyticsCollectionEnabled = jest.fn();
        mockCrashlyticsLog = jest.fn();
        mockRecordError = jest.fn();
        mockCrashlyticsSetUserId = jest.fn();
        mockSetAttribute = jest.fn();

        mockAnalytics.mockReturnValue({
            logEvent: mockLogEvent,
            logScreenView: mockLogScreenView,
        });

        mockCrashlytics.mockReturnValue({
            setCrashlyticsCollectionEnabled: mockSetCrashlyticsCollectionEnabled,
            log: mockCrashlyticsLog,
            recordError: mockRecordError,
            setUserId: mockCrashlyticsSetUserId,
            setAttribute: mockSetAttribute,
        });
    });

    describe('initializeAnalytics', () => {
        it('enables crashlytics collection', async () => {
            await initializeAnalytics();

            expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenCalledWith(true);
        });
    });

    describe('logEvent', () => {
        it('logs events with params', async () => {
            await logEvent('test_event', { key: 'value' });

            expect(mockLogEvent).toHaveBeenCalledWith('test_event', { key: 'value' });
        });

        it('logs events without params', async () => {
            await logEvent('simple_event');

            expect(mockLogEvent).toHaveBeenCalledWith('simple_event', undefined);
        });
    });

    describe('logDrillCompleted', () => {
        it('logs drill completion with drill details', async () => {
            await logDrillCompleted({
                drillName: 'Putting Gate',
                success: true,
                category: 'putting',
            });

            expect(mockLogEvent).toHaveBeenCalledWith('drill_completed', {
                drill_name: 'Putting Gate',
                success: true,
                category: 'putting',
            });
        });
    });

    describe('logRoundStarted', () => {
        it('logs round start with course details', async () => {
            await logRoundStarted({
                playerCount: 2,
            });

            expect(mockLogEvent).toHaveBeenCalledWith('round_started', {
                player_count: 2,
            });
        });
    });

    describe('logRoundEnded', () => {
        it('logs round end with score details', async () => {
            await logRoundEnded({
                playerCount: 1,
                holesPlayed: 18,
            });

            expect(mockLogEvent).toHaveBeenCalledWith('round_ended', {
                player_count: 1,
                holes_played: 18,
            });
        });
    });

    describe('logScreenView', () => {
        it('logs screen view with screen name', async () => {
            await logScreenView({ screenName: 'Home' });

            expect(mockLogScreenView).toHaveBeenCalledWith({
                screen_name: 'Home',
                screen_class: 'Home',
            });
        });

        it('logs screen view with custom class', async () => {
            await logScreenView({ screenName: 'Settings', screenClass: 'SettingsScreen' });

            expect(mockLogScreenView).toHaveBeenCalledWith({
                screen_name: 'Settings',
                screen_class: 'SettingsScreen',
            });
        });
    });

    describe('setUserId', () => {
        it('sets user ID on crashlytics', async () => {
            await setUserId('user-123');

            expect(mockCrashlyticsSetUserId).toHaveBeenCalledWith('user-123');
        });
    });

    describe('setAttribute', () => {
        it('sets attribute on crashlytics', async () => {
            await setAttribute('subscription', 'premium');

            expect(mockSetAttribute).toHaveBeenCalledWith('subscription', 'premium');
        });
    });

    describe('logBreadcrumb', () => {
        it('logs breadcrumb message to crashlytics', async () => {
            await logBreadcrumb('User tapped submit button');

            expect(mockCrashlyticsLog).toHaveBeenCalledWith('User tapped submit button');
        });
    });

    describe('recordError', () => {
        it('records error with context', async () => {
            const error = new Error('Test error');

            await recordError(error, 'Loading data');

            expect(mockCrashlyticsLog).toHaveBeenCalledWith('Context: Loading data');
            expect(mockRecordError).toHaveBeenCalledWith(error);
        });

        it('records error without context', async () => {
            const error = new Error('Test error');

            await recordError(error);

            expect(mockCrashlyticsLog).not.toHaveBeenCalled();
            expect(mockRecordError).toHaveBeenCalledWith(error);
        });
    });

    describe('graceful handling when modules unavailable', () => {
        beforeEach(() => {
            mockAnalytics.mockImplementation(() => {
                throw new Error('Module not available');
            });
            mockCrashlytics.mockImplementation(() => {
                throw new Error('Module not available');
            });
        });

        it('initializeAnalytics handles missing crashlytics gracefully', async () => {
            await expect(initializeAnalytics()).resolves.not.toThrow();
        });

        it('logEvent handles missing analytics gracefully', async () => {
            await expect(logEvent('test_event')).resolves.not.toThrow();
        });

        it('recordError handles missing crashlytics gracefully', async () => {
            const error = new Error('Test error');
            await expect(recordError(error)).resolves.not.toThrow();
        });
    });
});
