import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../app/(tabs)/practice';
import { getAllDrillHistoryService, getDrillStatsByTypeService } from '@/service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
}));

jest.mock('../../service/DbService', () => ({
    getAllDrillHistoryService: jest.fn(),
    getDrillStatsByTypeService: jest.fn()
}));

// Explicitly cast as Jest mock functions
const mockedGetAllDrillHistoryService = getAllDrillHistoryService as jest.Mock;
const mockedGetDrillStatsByTypeService = getDrillStatsByTypeService as jest.Mock;

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

describe('Practice page ', () => {
    beforeEach(() => {
        mockedGetAllDrillHistoryService.mockReturnValue([{ Id: 1, Name: 'Fake', Result: 1, Created_At: '' }]);
        mockedGetDrillStatsByTypeService.mockReturnValue([]);
    });

    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('Make your practice time more effective')).toBeTruthy();
        expect(getByText('Short game practice')).toBeTruthy();
    });

    it('renders correctly short game options', () => {
        const { getByText } = render(<View />);

        expect(getByText('Putting')).toBeTruthy();
        expect(getByText('Chipping')).toBeTruthy();
        expect(getByText('Pitching')).toBeTruthy();
        expect(getByText('Bunker play')).toBeTruthy();
    });

    it('renders correctly tool options', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-tools');

        fireEvent.press(subMenuItem);

        expect(getByText('Practice tools')).toBeTruthy();
        expect(getByText('Tempo')).toBeTruthy();
        expect(getByText('Random')).toBeTruthy();
    });

    it('renders correctly history options', () => {
        const drills = [
            { Id: 1, Name: 'Fake - ladder', Result: 1, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 2, Name: 'Fake - clock', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' }
        ];

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Drill History')).toBeTruthy();
    });

    it('renders correctly drill history headings on each page', () => {
        const { getAllByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getAllByText('Drill').length).toBeGreaterThanOrEqual(2);
        expect(getAllByText('Met').length).toBeGreaterThanOrEqual(2);
        expect(getAllByText('Date').length).toBeGreaterThanOrEqual(2);
    });

    it('renders correctly when drill history is empty', () => {
        mockedGetAllDrillHistoryService.mockReturnValue([]);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('No drill history yet')).toBeTruthy();
    });

    it('renders correctly drill history items', () => {
        const drills = [
            { Id: 1, Name: 'Fake - ladder', Result: 1, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 2, Name: 'Fake - clock', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' }
        ];

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Fake - ladder')).toBeTruthy();
        expect(getByText('Fake - clock')).toBeTruthy();
    });

    it('renders correctly drill history items paged', () => {
        const drills = [
            { Id: 1, Name: 'Fake - 1', Result: 1, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 2, Name: 'Fake - 2', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 3, Name: 'Fake - 3', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 4, Name: 'Fake - 4', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 5, Name: 'Fake - 5', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 6, Name: 'Fake - 6', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 7, Name: 'Fake - 7', Result: 1, Created_At: '2025-03-17T13:01:00.684Z' },
            { Id: 8, Name: 'Fake - 8', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 9, Name: 'Fake - 9', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
            { Id: 10, Name: 'Fake - 10', Result: 0, Created_At: '2025-03-16T13:01:00.684Z' },
        ];

        mockedGetAllDrillHistoryService.mockReturnValue(drills);

        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Fake - 1')).toBeTruthy();
        expect(getByText('Fake - 2')).toBeTruthy();
        expect(getByText('Fake - 3')).toBeTruthy();
        expect(getByText('Fake - 4')).toBeTruthy();
        expect(getByText('Fake - 5')).toBeTruthy();
        expect(getByText('Fake - 6')).toBeTruthy();
        expect(getByText('Fake - 7')).toBeTruthy();
        expect(getByText('Fake - 8')).toBeTruthy();
        expect(getByText('Fake - 9')).toBeTruthy();
        expect(getByText('Fake - 10')).toBeTruthy();
    });
});
