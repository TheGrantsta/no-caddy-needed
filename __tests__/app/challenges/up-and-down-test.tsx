import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import UpAndDownChallenge from '../../../app/challenges/up-and-down';
import { insertDrillResultService, getSettingsService } from '../../../service/DbService';

const mockAddListener = jest.fn(() => jest.fn());
const mockSetOptions = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useNavigation: () => ({ goBack: jest.fn(), setOptions: mockSetOptions, addListener: mockAddListener }),
    useRouter: () => ({ back: mockBack }),
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: any) => children,
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
}));

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
        showError: jest.fn(),
    }),
}));

jest.mock('../../../service/DbService', () => ({
    insertDrillResultService: jest.fn(() => Promise.resolve(true)),
    getSettingsService: jest.fn(() => ({ units: 'yards' })),
}));

describe('UpAndDownChallenge screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getSettingsService as jest.Mock).mockImplementation(() => ({ units: 'yards' }));
    });

    it('showsTheCurrentHoleAndProgressOutOf9', () => {
        const { getByText, getByTestId } = render(<UpAndDownChallenge />);

        expect(getByText('Hole 1')).toBeTruthy();
        expect(getByText('of 9')).toBeTruthy();
        expect(getByTestId('simulation-progress-fill')).toHaveStyle({ width: `${(1 / 9) * 100}%` });
    });

    it('showsTheDistanceCardForTheCurrentHole', () => {
        const { getByText, getByTestId } = render(<UpAndDownChallenge />);

        expect(getByText('DISTANCE')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toMatch(/^\d+$/);
        expect(getByText('yd')).toBeTruthy();
    });

    it('showsShotTilesLabelledOneToFourPlusWithTwoSelectedByDefault', () => {
        const { getByText, getByTestId } = render(<UpAndDownChallenge />);

        expect(getByText('SHOTS TAKEN')).toBeTruthy();
        expect(getByText('4+')).toBeTruthy();
        expect(getByTestId('shots-option-2')).toHaveStyle({ backgroundColor: '#2D5A3D' });
        expect(getByTestId('shots-option-1')).toHaveStyle({ backgroundColor: '#fff' });
    });

    it('showsHoleNavigationWithAdjacentHoleLabels', () => {
        const { getByTestId, queryByTestId } = render(<UpAndDownChallenge />);

        expect(getByTestId('next-hole-button')).toBeTruthy();
        expect(queryByTestId('previous-hole-button')).toBeNull();
    });

    it('showsPreviousHoleOnLaterHolesAndFinishOnTheLastHole', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('next-hole-button'));
        expect(getByTestId('previous-hole-button')).toBeTruthy();

        for (let i = 0; i < 7; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }
        expect(getByText('Finish')).toBeTruthy();
    });

    it('shows complete view after 9 holes', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText(/Challenge complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('auto-saves result when completing', async () => {
        const { getByTestId } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = (insertDrillResultService as jest.Mock).mock.calls[0];
        expect(name).toBe('Up-and-down Challenge');
    });

    it('allows navigating between holes', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('next-hole-button'));
        expect(getByText('Hole 2')).toBeTruthy();

        fireEvent.press(getByTestId('previous-hole-button'));
        expect(getByText('Hole 1')).toBeTruthy();
    });

    it('resets to hole 1 on play again', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText('Hole 1')).toBeTruthy();
        expect(getByTestId('next-hole-button')).toBeTruthy();
    });

    it('displays performance bands on completion', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText('PGA Pro')).toBeTruthy();
        expect(getByText('D1 College')).toBeTruthy();
        expect(getByText('Scratch')).toBeTruthy();
    });

    it('opensTheEndOverlayWhenEndIsPressedDuringARun', () => {
        const { getByTestId, getByText } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('simulation-end-button'));

        expect(getByTestId('end-round-sheet')).toBeTruthy();
        expect(getByText('End simulation after hole 1?')).toBeTruthy();
    });

    it('closesTheOverlayAndKeepsPlayingWhenKeepPlayingIsPressed', () => {
        const { getByTestId, queryByTestId } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-keep-playing-button'));

        expect(queryByTestId('end-round-sheet')).toBeNull();
        expect(mockBack).not.toHaveBeenCalled();
    });

    it('savesProgressWithUpAndDownRateOverHolesEnteredWhenSaveIsPressed', () => {
        const { getByTestId } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('shots-option-3'));
        fireEvent.press(getByTestId('next-hole-button'));
        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-save-button'));

        // Hole 1 took 3 shots (missed), hole 2 took the default 2 (made): 1 of 2 = 50%
        expect(insertDrillResultService).toHaveBeenCalledWith('Up-and-down Challenge', false, null, 50);
        expect(mockBack).toHaveBeenCalled();
    });

    it('discardsWithoutSavingAndLeavesWhenDiscardIsPressed', () => {
        const { getByTestId } = render(<UpAndDownChallenge />);

        fireEvent.press(getByTestId('next-hole-button'));
        fireEvent.press(getByTestId('simulation-end-button'));
        fireEvent.press(getByTestId('end-round-discard-button'));

        expect(insertDrillResultService).not.toHaveBeenCalled();
        expect(mockBack).toHaveBeenCalled();
    });

    it('leavesWithoutOverlayWhenEndIsPressedAfterCompletion', () => {
        const { getByTestId, queryByTestId } = render(<UpAndDownChallenge />);

        for (let i = 0; i < 9; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }
        fireEvent.press(getByTestId('simulation-end-button'));

        expect(mockBack).toHaveBeenCalled();
        expect(queryByTestId('end-round-sheet')).toBeNull();
    });

    it('hidesTheStackHeaderSoTheScreenShowsItsOwnAppBar', () => {
        render(<UpAndDownChallenge />);

        expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({ headerShown: false }));
    });
});

describe('UpAndDownChallenge distance units', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldShowDistanceInYardsByDefault', () => {
        const { getByText, queryByText } = render(<UpAndDownChallenge />);

        expect(getByText('yd')).toBeTruthy();
        expect(queryByText('m')).toBeNull();
    });

    it('shouldShowDistanceInMetresWhenMetresSelectedInSettings', () => {
        (getSettingsService as jest.Mock).mockImplementation(() => ({ units: 'metres' }));

        const { getByText, queryByText } = render(<UpAndDownChallenge />);

        expect(getByText('m')).toBeTruthy();
        expect(queryByText('yd')).toBeNull();
    });

    it('asksBeforeLeavingWhenSwipeOrHardwareBackDuringRun', () => {
        mockAddListener.mockClear();
        const { getByText } = render(<UpAndDownChallenge />);
        const listener = mockAddListener.mock.calls.find((c: any[]) => c[0] === 'beforeRemove')?.[1];
        const event = { preventDefault: jest.fn(), data: { action: {} } };

        act(() => {
            listener?.(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(getByText('Quit challenge?')).toBeTruthy();
    });
});
