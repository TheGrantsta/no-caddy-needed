import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import Settings from '../../../app/settings';
import * as ExportService from '../../../service/ExportService';
import * as Sharing from 'expo-sharing';

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(() => ({
        notificationsEnabled: true,
        soundsEnabled: true,
        voice: 'male',
        units: 'yards',
        preShotReminderEnabled: false,
        preShotRoutineText: '',
        settingsOnboardingSeen: true,
        skipStatsFlowEnabled: false,
    })),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../service/ReviewService', () => ({
    openStoreReviewService: jest.fn(),
}));

jest.mock('../../../service/ExportService', () => ({
    buildStatsExportPayload: jest.fn(),
    formatStatsExportText: jest.fn(),
    writeStatsExportFile: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowResult = jest.fn();

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: jest.fn(() => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError,
        showResult: mockShowResult,
    })),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: jest.fn(() => ({
        largeButton: { padding: 10 },
        buttonText: { fontSize: 16 },
        divider: { height: 1 },
        contentSection: { marginVertical: 10 },
        headerContainer: { paddingHorizontal: 16 },
        subHeaderText: { fontSize: 18 },
        normalText: { fontSize: 14 },
        textInput: { padding: 10 },
    })),
}));

jest.mock('../../../context/ThemeContext', () => ({
    useTheme: jest.fn(() => ({
        colours: {
            primary: '#2D5A3D',
            text: '#000',
            tertiary: '#999',
        },
    })),
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: jest.fn(() => ({
        landscapePadding: 0,
    })),
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: any) => children,
}));

jest.mock('../../../components/OnboardingOverlay', () => {
    return function MockOverlay() {
        return null;
    };
});

jest.mock('expo-constants', () => ({
    expoConfig: {
        version: '1.0.0',
    },
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

describe('Settings - Export stats button', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders export stats button', () => {
        render(<Settings />);
        const button = screen.getByTestId('export-stats-button');
        expect(button).toBeTruthy();
    });

    it('calls export service functions in sequence when button is pressed', async () => {
        const mockBuildPayload = ExportService.buildStatsExportPayload as jest.Mock;
        const mockFormatText = ExportService.formatStatsExportText as jest.Mock;
        const mockWriteFile = ExportService.writeStatsExportFile as jest.Mock;
        const mockShareAsync = Sharing.shareAsync as jest.Mock;
        const mockIsAvailable = Sharing.isAvailableAsync as jest.Mock;

        const testPayload = {
            generatedAt: '2026-08-04T10:00:00Z',
            roundHistory: [],
            deadlySinsRounds: [],
            puttingMakeRates: [],
            puttingProximity: [],
            clubDistances: [],
            wedgeChart: { distanceNames: [], clubs: [] },
            drillHistory: [],
            holeSinDetails: [],
            roundHoleScores: [],
            holeDeadlySins: [],
            puttingStats: [],
        };
        const testText = 'prompt\n---\n{}';
        const testUri = '/cache/no-caddy-needed-stats-export.txt';

        mockBuildPayload.mockReturnValue(testPayload);
        mockFormatText.mockReturnValue(testText);
        mockWriteFile.mockResolvedValue(testUri);
        mockIsAvailable.mockResolvedValue(true);

        render(<Settings />);
        const button = screen.getByTestId('export-stats-button');
        fireEvent.press(button);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockBuildPayload).toHaveBeenCalledTimes(1);
        expect(mockFormatText).toHaveBeenCalledWith(testPayload);
        expect(mockWriteFile).toHaveBeenCalledWith(testText);
        expect(mockIsAvailable).toHaveBeenCalledTimes(1);
        expect(mockShareAsync).toHaveBeenCalledWith(
            testUri,
            expect.objectContaining({
                mimeType: 'text/plain',
                dialogTitle: 'Export golf stats',
            })
        );
    });

    it('shows error toast when sharing is not available', async () => {
        const mockBuildPayload = ExportService.buildStatsExportPayload as jest.Mock;
        const mockFormatText = ExportService.formatStatsExportText as jest.Mock;
        const mockWriteFile = ExportService.writeStatsExportFile as jest.Mock;
        const mockIsAvailable = Sharing.isAvailableAsync as jest.Mock;

        const testPayload = { generatedAt: '2026-08-04T10:00:00Z' };
        mockBuildPayload.mockReturnValue(testPayload);
        mockFormatText.mockReturnValue('test');
        mockWriteFile.mockResolvedValue('/test');
        mockIsAvailable.mockResolvedValue(false);

        render(<Settings />);
        const button = screen.getByTestId('export-stats-button');
        fireEvent.press(button);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockShowError).toHaveBeenCalledWith('Failed to export stats');
    });

    it('shows error toast when file write fails', async () => {
        const mockBuildPayload = ExportService.buildStatsExportPayload as jest.Mock;
        const mockFormatText = ExportService.formatStatsExportText as jest.Mock;
        const mockWriteFile = ExportService.writeStatsExportFile as jest.Mock;

        mockBuildPayload.mockReturnValue({});
        mockFormatText.mockReturnValue('test');
        mockWriteFile.mockRejectedValue(new Error('Write failed'));

        render(<Settings />);
        const button = screen.getByTestId('export-stats-button');
        fireEvent.press(button);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockShowError).toHaveBeenCalledWith('Failed to export stats');
    });
});
