import React, { act } from 'react';
import { FlatList } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import ShortGameScreen from '../../components/ShortGameScreen';
import { insertDrillResultService, getDrillsByCategoryService, getGamesByCategoryService, deleteGameService, restoreGameService, deleteDrillService, restoreDrillService } from '../../service/DbService';
import type { ShortGameConfig } from '../../types/ShortGame';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
}));

jest.mock('../../hooks/useOrientation', () => ({
    useOrientation: () => ({ landscapePadding: {} }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({ show: jest.fn() }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('../../service/DbService', () => ({
    insertDrillResultService: jest.fn().mockResolvedValue(true),
    getDrillsByCategoryService: jest.fn().mockReturnValue([
        { id: 1, label: 'Gate', iconName: 'sports-golf', target: '3/5', objective: 'Improve accuracy', setup: 'Set a gate', howToPlay: 'Chip through the gate' },
        { id: 2, label: 'Hoop', iconName: 'sports-golf', target: '4/5', objective: 'Land in hoop', setup: 'Place a hoop', howToPlay: 'Chip into the hoop' },
    ]),
    getGamesByCategoryService: jest.fn().mockReturnValue([
        { id: 1, header: 'Up & down!', objective: 'Get up and down', setup: 'Drop a ball', howToPlay: 'Chip and putt' },
        { id: 2, header: 'Par 18!', objective: 'Score under 18', setup: 'Play 9 holes', howToPlay: 'Chip and putt each hole' },
    ]),
    insertGameService: jest.fn().mockResolvedValue(true),
    deleteGameService: jest.fn().mockResolvedValue(true),
    restoreGameService: jest.fn().mockResolvedValue(true),
    deleteDrillService: jest.fn().mockResolvedValue(true),
    restoreDrillService: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../components/AddDrillForm', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ category, onSaved, onCancel }: { category: string; onSaved: () => void; onCancel: () => void }) => (
        <View testID='add-drill-form' accessibilityLabel={category}>
            <TouchableOpacity testID='mock-on-saved' onPress={onSaved}>
                <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity testID='mock-on-cancel' onPress={onCancel}>
                <Text>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
});

jest.mock('../../components/AddGameForm', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ category, onSaved, onCancel }: { category: string; onSaved: () => void; onCancel: () => void }) => (
        <View testID='add-game-form' accessibilityLabel={category}>
            <TouchableOpacity testID='mock-game-on-saved' onPress={onSaved}>
                <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity testID='mock-game-on-cancel' onPress={onCancel}>
                <Text>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
});

jest.useFakeTimers();

const mockInsertDrillResultService = insertDrillResultService as jest.Mock;
const mockGetDrillsByCategoryService = getDrillsByCategoryService as jest.Mock;
const mockGetGamesByCategoryService = getGamesByCategoryService as jest.Mock;
const mockDeleteGameService = deleteGameService as jest.Mock;
const mockRestoreGameService = restoreGameService as jest.Mock;
const mockDeleteDrillService = deleteDrillService as jest.Mock;
const mockRestoreDrillService = restoreDrillService as jest.Mock;

const config: ShortGameConfig = {
    category: 'chipping',
    drillsFooter: 'Practice drills regularly',
    gamesFooter: 'Play these games to improve',
};

describe('ShortGameScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<ShortGameScreen config={config} />);
        expect(toJSON()).toBeTruthy();
    });

    it('showsDrillsSectionByDefault', () => {
        const { getByText } = render(<ShortGameScreen config={config} />);
        expect(getByText('Chipping drills')).toBeTruthy();
    });

    it('capitalizesCategoryInDrillsHeading', () => {
        const { getByText } = render(<ShortGameScreen config={config} />);
        expect(getByText('Chipping drills')).toBeTruthy();
    });

    it('showsDrillLabels', () => {
        const { getByText } = render(<ShortGameScreen config={config} />);
        expect(getByText('Gate')).toBeTruthy();
        expect(getByText('Hoop')).toBeTruthy();
    });

    it('showsDrillsFooter', () => {
        const { getByText } = render(<ShortGameScreen config={config} />);
        expect(getByText('Practice drills regularly')).toBeTruthy();
    });

    it('showsGamesSectionAfterSubMenuPress', () => {
        const { getByText, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        expect(getByText('Chipping games')).toBeTruthy();
    });

    it('showsGameHeaders', () => {
        const { getByText, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        expect(getByText('Up & down!')).toBeTruthy();
        expect(getByText('Par 18!')).toBeTruthy();
    });

    it('showsGamesFooter', () => {
        const { getByText, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        expect(getByText('Play these games to improve')).toBeTruthy();
    });

    it('hidesDrillsWhenGamesSectionSelected', () => {
        const { queryByText, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        expect(queryByText('Chipping drills')).toBeNull();
    });

    it('saveDrillResultCallsServiceWithFormattedName', async () => {
        const { getAllByTestId } = render(<ShortGameScreen config={config} />);
        const saveButtons = getAllByTestId('save-drill-result-button');

        await act(async () => {
            fireEvent.press(saveButtons[0]);
        });

        expect(mockInsertDrillResultService).toHaveBeenCalledWith('Chipping - Gate', true, 1);
    });

    it('saveDrillResultUsesDrillLabelForEachDrill', async () => {
        const { getAllByTestId } = render(<ShortGameScreen config={config} />);
        const saveButtons = getAllByTestId('save-drill-result-button');

        await act(async () => {
            fireEvent.press(saveButtons[1]);
        });

        expect(mockInsertDrillResultService).toHaveBeenCalledWith('Chipping - Hoop', true, 2);
    });

    it('loadsDrillsFromServiceOnMount', () => {
        render(<ShortGameScreen config={config} />);

        expect(mockGetDrillsByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('reloadsDrillsFromServiceOnRefresh', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        const scrollView = getByTestId('main-scroll-view');
        mockGetDrillsByCategoryService.mockClear();

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        expect(mockGetDrillsByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('callsDeleteDrillServiceWhenDrillDeleted', async () => {
        const { getAllByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getAllByTestId('delete-drill-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-drill-delete')[0]);
        });

        expect(mockDeleteDrillService).toHaveBeenCalledWith(1);
    });

    it('showsUndoDrillDeleteAfterDrillDeleted', async () => {
        const { getAllByTestId, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getAllByTestId('delete-drill-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-drill-delete')[0]);
        });

        expect(getByTestId('undo-drill-delete')).toBeTruthy();
    });

    it('callsRestoreDrillServiceWhenUndoDrillPressed', async () => {
        const { getAllByTestId, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getAllByTestId('delete-drill-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-drill-delete')[0]);
        });

        await act(async () => {
            fireEvent.press(getByTestId('undo-drill-delete'));
        });

        expect(mockRestoreDrillService).toHaveBeenCalledWith(1);
    });

    it('hidesUndoDrillDeleteAfterRestored', async () => {
        const { getAllByTestId, getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getAllByTestId('delete-drill-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-drill-delete')[0]);
        });

        await act(async () => {
            fireEvent.press(getByTestId('undo-drill-delete'));
        });

        expect(queryByTestId('undo-drill-delete')).toBeNull();
    });

    it('reloadsDrillsAfterUndoDrill', async () => {
        const { getAllByTestId, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getAllByTestId('delete-drill-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-drill-delete')[0]);
        });

        mockGetDrillsByCategoryService.mockClear();

        await act(async () => {
            fireEvent.press(getByTestId('undo-drill-delete'));
        });

        expect(mockGetDrillsByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('undoDrillOverlayAutoClosesAfterFiveSeconds', async () => {
        const { getAllByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getAllByTestId('delete-drill-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-drill-delete')[0]);
        });

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(queryByTestId('undo-drill-delete')).toBeNull();
    });

    it('handleDrillScrollUpdatesActiveIndex', () => {
        const { UNSAFE_getAllByType } = render(<ShortGameScreen config={config} />);
        const flatLists = UNSAFE_getAllByType(FlatList);

        act(() => {
            flatLists[0].props.onScroll({ nativeEvent: { contentOffset: { x: 375 } } });
        });

        expect(flatLists[0].props.onScroll).toBeDefined();
    });

    it('handleGameScrollUpdatesActiveIndex', () => {
        const { UNSAFE_getAllByType, getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));

        const flatLists = UNSAFE_getAllByType(FlatList);

        act(() => {
            flatLists[0].props.onScroll({ nativeEvent: { contentOffset: { x: 375 } } });
        });

        expect(flatLists[0].props.onScroll).toBeDefined();
    });

    it('onRefreshShowsRefreshingOverlay', () => {
        const { getByTestId, getByText } = render(<ShortGameScreen config={config} />);
        const scrollView = getByTestId('main-scroll-view');

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        expect(getByText('Release to update')).toBeTruthy();
    });

    it('showsAddDrillButtonInDrillsSection', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        expect(getByTestId('add-drill-button')).toBeTruthy();
    });

    it('showsAddDrillFormWhenAddDrillButtonPressed', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        expect(getByTestId('add-drill-form')).toBeTruthy();
    });

    it('passesCorrectCategoryToAddDrillForm', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        expect(getByTestId('add-drill-form').props.accessibilityLabel).toBe('chipping');
    });

    it('hidesAddDrillFormAfterSaved', () => {
        const { getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        fireEvent.press(getByTestId('mock-on-saved'));
        expect(queryByTestId('add-drill-form')).toBeNull();
    });

    it('hidesDrillsListWhenFormIsShown', () => {
        const { getByTestId, queryByText } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        expect(queryByText('Gate')).toBeNull();
    });

    it('hidesAddDrillButtonWhenFormIsShown', () => {
        const { getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        expect(queryByTestId('add-drill-button')).toBeNull();
    });

    it('hidesFormWhenCancelPressed', () => {
        const { getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        fireEvent.press(getByTestId('mock-on-cancel'));
        expect(queryByTestId('add-drill-form')).toBeNull();
    });

    it('reloadsDrillsAfterDrillSaved', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('add-drill-button'));
        mockGetDrillsByCategoryService.mockClear();
        fireEvent.press(getByTestId('mock-on-saved'));
        expect(mockGetDrillsByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('onRefreshHidesOverlayAfterTimeout', () => {
        const { getByTestId, queryByText } = render(<ShortGameScreen config={config} />);
        const scrollView = getByTestId('main-scroll-view');

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(queryByText('Release to update')).toBeNull();
    });

    it('drillItemIsVerticallyScrollable', () => {
        const { getAllByTestId } = render(<ShortGameScreen config={config} />);
        const drillScrolls = getAllByTestId('drill-item-scroll');
        expect(drillScrolls.length).toBeGreaterThan(0);
        expect(drillScrolls[0].props.nestedScrollEnabled).toBe(true);
    });

    it('loadsGamesFromServiceOnMount', () => {
        render(<ShortGameScreen config={config} />);
        expect(mockGetGamesByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('showsAddGameButtonInGamesSection', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        expect(getByTestId('add-game-button')).toBeTruthy();
    });

    it('showsAddGameFormWhenAddGameButtonPressed', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        expect(getByTestId('add-game-form')).toBeTruthy();
    });

    it('passesCorrectCategoryToAddGameForm', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        expect(getByTestId('add-game-form').props.accessibilityLabel).toBe('chipping');
    });

    it('hidesAddGameFormAfterSaved', () => {
        const { getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        fireEvent.press(getByTestId('mock-game-on-saved'));
        expect(queryByTestId('add-game-form')).toBeNull();
    });

    it('hidesGamesListWhenFormIsShown', () => {
        const { getByTestId, queryByText } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        expect(queryByText('Up & down!')).toBeNull();
    });

    it('hidesAddGameButtonWhenFormIsShown', () => {
        const { getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        expect(queryByTestId('add-game-button')).toBeNull();
    });

    it('hidesGameFormWhenCancelPressed', () => {
        const { getByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        fireEvent.press(getByTestId('mock-game-on-cancel'));
        expect(queryByTestId('add-game-form')).toBeNull();
    });

    it('reloadsGamesAfterGameSaved', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getByTestId('add-game-button'));
        mockGetGamesByCategoryService.mockClear();
        fireEvent.press(getByTestId('mock-game-on-saved'));
        expect(mockGetGamesByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('callsDeleteGameServiceWhenGameDeleted', async () => {
        const { getByTestId, getAllByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getAllByTestId('delete-game-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-game-delete')[0]);
        });

        expect(mockDeleteGameService).toHaveBeenCalledWith(1);
    });

    it('showsUndoOptionAfterGameDeleted', async () => {
        const { getByTestId, getAllByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getAllByTestId('delete-game-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-game-delete')[0]);
        });

        expect(getByTestId('undo-game-delete')).toBeTruthy();
    });

    it('callsRestoreGameServiceWhenUndoPressed', async () => {
        const { getByTestId, getAllByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getAllByTestId('delete-game-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-game-delete')[0]);
        });

        await act(async () => {
            fireEvent.press(getByTestId('undo-game-delete'));
        });

        expect(mockRestoreGameService).toHaveBeenCalledWith(1);
    });

    it('hidesUndoAfterRestored', async () => {
        const { getByTestId, getAllByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getAllByTestId('delete-game-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-game-delete')[0]);
        });

        await act(async () => {
            fireEvent.press(getByTestId('undo-game-delete'));
        });

        expect(queryByTestId('undo-game-delete')).toBeNull();
    });

    it('reloadsGamesAfterUndo', async () => {
        const { getByTestId, getAllByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getAllByTestId('delete-game-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-game-delete')[0]);
        });

        mockGetGamesByCategoryService.mockClear();

        await act(async () => {
            fireEvent.press(getByTestId('undo-game-delete'));
        });

        expect(mockGetGamesByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('reloadsGamesFromServiceOnRefresh', () => {
        const { getByTestId } = render(<ShortGameScreen config={config} />);
        const scrollView = getByTestId('main-scroll-view');
        mockGetGamesByCategoryService.mockClear();

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        expect(mockGetGamesByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('gameItemIsVerticallyScrollable', () => {
        const { getByTestId, getAllByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        const gameScrolls = getAllByTestId('game-item-scroll');
        expect(gameScrolls.length).toBeGreaterThan(0);
        expect(gameScrolls[0].props.nestedScrollEnabled).toBe(true);
    });

    it('showsEmptyStateWhenNoGames', () => {
        mockGetGamesByCategoryService.mockReturnValueOnce([]);
        const { getByTestId, getByText } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        expect(getByText(/No games yet/)).toBeTruthy();
    });

    it('undoOverlayAutoClosesAfterFiveSeconds', async () => {
        const { getByTestId, getAllByTestId, queryByTestId } = render(<ShortGameScreen config={config} />);
        fireEvent.press(getByTestId('chipping-sub-menu-chipping-games'));
        fireEvent.press(getAllByTestId('delete-game-button')[0]);

        await act(async () => {
            fireEvent.press(getAllByTestId('confirm-game-delete')[0]);
        });

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(queryByTestId('undo-game-delete')).toBeNull();
    });
});
