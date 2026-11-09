import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PuttingSimulation from '../../../app/challenges/putting-simulation';
import { insertDrillResultService } from '../../../service/DbService';

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
}));

describe('PuttingSimulation screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('showsPuttFromDistanceForTheCurrentHole', () => {
        const { getByText, getByTestId } = render(<PuttingSimulation />);

        expect(getByText('PUTT FROM')).toBeTruthy();
        expect(getByTestId('simulation-distance-value').props.children).toMatch(/^\d+$/);
        expect(getByText('ft')).toBeTruthy();
    });

    it('showsTheCurrentHoleAndProgressOutOf18', () => {
        const { getByText, getByTestId } = render(<PuttingSimulation />);

        expect(getByText('Hole 1')).toBeTruthy();
        expect(getByText('of 18')).toBeTruthy();
        expect(getByTestId('simulation-progress-fill')).toHaveStyle({ width: `${(1 / 18) * 100}%` });
    });

    it('advancesTheProgressFillAsHolesAreCompleted', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('next-hole-button'));

        expect(getByText('Hole 2')).toBeTruthy();
        expect(getByTestId('simulation-progress-fill')).toHaveStyle({ width: `${(2 / 18) * 100}%` });
    });

    it('showsFourPuttCountTilesWithTheLastLabelledFourPlus', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        expect(getByText('PUTTS TAKEN')).toBeTruthy();
        expect(getByTestId('putts-option-1')).toBeTruthy();
        expect(getByTestId('putts-option-2')).toBeTruthy();
        expect(getByTestId('putts-option-3')).toBeTruthy();
        expect(getByTestId('putts-option-4')).toBeTruthy();
        expect(getByText('4+')).toBeTruthy();
    });

    it('highlightsTheChosenPuttCountTileOnly', () => {
        const { getByTestId } = render(<PuttingSimulation />);

        expect(getByTestId('putts-option-1')).toHaveStyle({ backgroundColor: '#2D5A3D' });

        fireEvent.press(getByTestId('putts-option-3'));

        expect(getByTestId('putts-option-3')).toHaveStyle({ backgroundColor: '#2D5A3D' });
        expect(getByTestId('putts-option-1')).toHaveStyle({ backgroundColor: '#fff' });
    });

    it('recordsFourPlusAsFourPuttsForTheHole', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('putts-option-4'));
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText('72')).toBeTruthy();
    });

    it('showsHoleNavigationWithAdjacentHoleLabels', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        expect(getByText('Hole 2')).toBeTruthy();
        expect(getByTestId('next-hole-button')).toBeTruthy();
    });

    it('hidesPreviousHoleOnHoleOne', () => {
        const { queryByTestId } = render(<PuttingSimulation />);

        expect(queryByTestId('previous-hole-button')).toBeNull();
    });

    it('showsPreviousHoleOnLaterHoles', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('next-hole-button'));

        expect(getByTestId('previous-hole-button')).toBeTruthy();
        expect(getByText('Hole 1')).toBeTruthy();
    });

    it('labelsTheLastHoleFinish', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        for (let i = 0; i < 17; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText('Finish')).toBeTruthy();
    });

    it('shows complete view after 18 holes', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        expect(getByText(/Simulation complete/)).toBeTruthy();
        expect(getByTestId('play-again-button')).toBeTruthy();
    });

    it('auto-saves result when completing', async () => {
        const { getByTestId } = render(<PuttingSimulation />);
        const { insertDrillResultService } = require('../../../service/DbService');

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        // Wait for auto-save
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(insertDrillResultService).toHaveBeenCalled();
        const [name] = insertDrillResultService.mock.calls[0];
        expect(name).toBe('Putting Simulation');
    });

    it('allows navigating between holes', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        fireEvent.press(getByTestId('next-hole-button'));
        expect(getByText('Hole 2')).toBeTruthy();

        fireEvent.press(getByTestId('previous-hole-button'));
        expect(getByText('Hole 1')).toBeTruthy();
    });

    it('resets to hole 1 on play again', () => {
        const { getByTestId, getByText } = render(<PuttingSimulation />);

        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        fireEvent.press(getByTestId('play-again-button'));

        expect(getByText('Hole 1')).toBeTruthy();
        expect(getByTestId('next-hole-button')).toBeTruthy();
    });

    it('saves result again when playing again', async () => {
        const { getByTestId } = render(<PuttingSimulation />);
        const { insertDrillResultService } = require('../../../service/DbService');

        // First completion
        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
        const firstCallCount = insertDrillResultService.mock.calls.length;
        expect(firstCallCount).toBe(1);

        // Play again
        fireEvent.press(getByTestId('play-again-button'));

        // Second completion
        for (let i = 0; i < 18; i++) {
            fireEvent.press(getByTestId('next-hole-button'));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
        const secondCallCount = insertDrillResultService.mock.calls.length;
        expect(secondCallCount).toBe(2);
    });

    it('asksBeforeLeavingWhenSwipeOrHardwareBackDuringRun', () => {
        mockAddListener.mockClear();
        const { getByText } = render(<PuttingSimulation />);
        const listener = mockAddListener.mock.calls.find((c: any[]) => c[0] === 'beforeRemove')?.[1];
        const event = { preventDefault: jest.fn(), data: { action: {} } };

        act(() => {
            listener?.(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(getByText('Quit challenge?')).toBeTruthy();
    });

    describe('app-style header with End button', () => {
        it('hidesTheStackHeaderSoTheScreenShowsItsOwnAppBar', () => {
            render(<PuttingSimulation />);

            expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({ headerShown: false }));
        });

        it('showsAnEndButtonInPlaceOfTheBackButton', () => {
            const { getByTestId, queryByTestId } = render(<PuttingSimulation />);

            expect(getByTestId('simulation-end-button')).toBeTruthy();
            expect(queryByTestId('header-back-button')).toBeNull();
        });

        it('opensTheEndOverlayWhenEndIsPressedDuringARun', () => {
            const { getByTestId, getByText } = render(<PuttingSimulation />);

            fireEvent.press(getByTestId('simulation-end-button'));

            expect(getByTestId('end-round-sheet')).toBeTruthy();
            expect(getByText('End simulation after hole 1?')).toBeTruthy();
        });

        it('closesTheOverlayAndKeepsPlayingWhenKeepPlayingIsPressed', () => {
            const { getByTestId, queryByTestId } = render(<PuttingSimulation />);

            fireEvent.press(getByTestId('simulation-end-button'));
            fireEvent.press(getByTestId('end-round-keep-playing-button'));

            expect(queryByTestId('end-round-sheet')).toBeNull();
            expect(getByTestId('next-hole-button')).toBeTruthy();
            expect(mockBack).not.toHaveBeenCalled();
        });

        it('savesHolesEnteredSoFarIncludingTheCurrentHoleAndLeavesWhenSaveIsPressed', () => {
            const { getByTestId } = render(<PuttingSimulation />);

            fireEvent.press(getByTestId('next-hole-button'));
            fireEvent.press(getByTestId('simulation-end-button'));
            fireEvent.press(getByTestId('end-round-save-button'));

            expect(insertDrillResultService).toHaveBeenCalledWith('Putting Simulation', false, null, 2);
            expect(mockBack).toHaveBeenCalled();
        });

        it('discardsWithoutSavingAndLeaveWhenDiscardIsPressed', () => {
            const { getByTestId } = render(<PuttingSimulation />);

            fireEvent.press(getByTestId('next-hole-button'));
            fireEvent.press(getByTestId('simulation-end-button'));
            fireEvent.press(getByTestId('end-round-discard-button'));

            expect(insertDrillResultService).not.toHaveBeenCalled();
            expect(mockBack).toHaveBeenCalled();
        });

        it('leavesWithoutOverlayWhenEndIsPressedAfterCompletion', () => {
            const { getByTestId, queryByTestId } = render(<PuttingSimulation />);

            for (let i = 0; i < 18; i++) {
                fireEvent.press(getByTestId('next-hole-button'));
            }
            fireEvent.press(getByTestId('simulation-end-button'));

            expect(mockBack).toHaveBeenCalled();
            expect(queryByTestId('end-round-sheet')).toBeNull();
        });
    });
});
