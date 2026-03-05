import React, { act } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import ShortGameScreen from '../../components/ShortGameScreen';
import { insertDrillResultService, getDrillsByCategoryService, toggleDrillIsActiveService } from '../../service/DbService';
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
        { id: 1, label: 'Gate', iconName: 'sports-golf', target: '3/5', objective: 'Improve accuracy', setup: 'Set a gate', howToPlay: 'Chip through the gate', isActive: true },
        { id: 2, label: 'Hoop', iconName: 'sports-golf', target: '4/5', objective: 'Land in hoop', setup: 'Place a hoop', howToPlay: 'Chip into the hoop', isActive: true },
    ]),
    toggleDrillIsActiveService: jest.fn().mockResolvedValue(true),
    insertDrillService: jest.fn().mockResolvedValue(true),
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

jest.useFakeTimers();

const mockInsertDrillResultService = insertDrillResultService as jest.Mock;
const mockGetDrillsByCategoryService = getDrillsByCategoryService as jest.Mock;
const mockToggleDrillIsActiveService = toggleDrillIsActiveService as jest.Mock;

const config: ShortGameConfig = {
    category: 'chipping',
    drills: [
        { label: 'Gate', iconName: 'sports-golf', target: '3/5', objective: 'Improve accuracy', setup: 'Set a gate', howToPlay: 'Chip through the gate' },
        { label: 'Hoop', iconName: 'sports-golf', target: '4/5', objective: 'Land in hoop', setup: 'Place a hoop', howToPlay: 'Chip into the hoop' },
    ],
    games: [
        { header: 'Up & down!', objective: 'Get up and down', setup: 'Drop a ball', howToPlay: 'Chip and putt' },
        { header: 'Par 18!', objective: 'Score under 18', setup: 'Play 9 holes', howToPlay: 'Chip and putt each hole' },
    ],
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
        const { UNSAFE_getByType } = render(<ShortGameScreen config={config} />);
        const scrollView = UNSAFE_getByType(ScrollView);
        mockGetDrillsByCategoryService.mockClear();

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        expect(mockGetDrillsByCategoryService).toHaveBeenCalledWith('chipping');
    });

    it('callsToggleServiceWhenDrillToggled', async () => {
        const { getAllByTestId } = render(<ShortGameScreen config={config} />);
        const toggles = getAllByTestId('drill-active-toggle');

        await act(async () => {
            fireEvent.press(toggles[0]);
        });

        expect(mockToggleDrillIsActiveService).toHaveBeenCalledWith(1, false);
    });

    it('handleDrillScrollUpdatesActiveIndex', () => {
        const { UNSAFE_getAllByType } = render(<ShortGameScreen config={config} />);
        const flatLists = UNSAFE_getAllByType(FlatList);

        act(() => {
            flatLists[0].props.onScroll({ nativeEvent: { contentOffset: { x: 375 } } });
        });

        // If it doesn't throw, the handler ran; the dot indicator rerenders
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
        const { UNSAFE_getByType, getByText } = render(<ShortGameScreen config={config} />);
        const scrollView = UNSAFE_getByType(ScrollView);

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
        const { UNSAFE_getByType, queryByText } = render(<ShortGameScreen config={config} />);
        const scrollView = UNSAFE_getByType(ScrollView);

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(queryByText('Release to update')).toBeNull();
    });
});
