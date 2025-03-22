import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../app/(tabs)/practice';

jest.mock('../../service/DbService', () => ({
    getAllDrillHistoryService: jest.fn(() => [])
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

describe('Practice page ', () => {
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
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Drill history')).toBeTruthy();
    });

    it('renders correctly drill history', () => {
        // Drills (Id, Name, Result, Created_At)
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('practice-sub-menu-history');

        fireEvent.press(subMenuItem);

        expect(getByText('Drill')).toBeTruthy();
        expect(getByText('Met')).toBeTruthy();
        expect(getByText('When')).toBeTruthy();
    });
});
