import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SubMenu from '../../components/SubMenu';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('SubMenu component', () => {
    const mockHandleSubMenu = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Practice sub menu', () => {
        it('renders practice menu items', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="practice" selectedItem="short-game" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Short game')).toBeTruthy();
            expect(getByText('Tools')).toBeTruthy();
            expect(getByText('History')).toBeTruthy();
        });

        it('calls handleSubMenu when Tools is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="short-game" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('practice-sub-menu-tools'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('tools');
        });

        it('calls handleSubMenu when History is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="short-game" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('practice-sub-menu-history'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('history');
        });
    });

    describe('Play sub menu', () => {
        it('renders play menu items', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="play" selectedItem="play-score" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Play')).toBeTruthy();
            expect(getByText('Distances')).toBeTruthy();
            expect(getByText('Wedge chart')).toBeTruthy();
        });

        it('calls handleSubMenu when Distances is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="play" selectedItem="play-score" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('play-distances');
        });

        it('calls handleSubMenu when Wedge chart is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="play" selectedItem="play-score" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('play-wedge-chart');
        });
    });

    describe('Perform sub menu', () => {
        it('renders perform menu items', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="perform" selectedItem="approach" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Approach')).toBeTruthy();
            expect(getByText('Pros')).toBeTruthy();
        });

        it('calls handleSubMenu when Pros is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="perform" selectedItem="approach" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('pros');
        });
    });

    describe('Putting sub menu', () => {
        it('renders putting menu items', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="putting" selectedItem="putting-drills" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Drills')).toBeTruthy();
            expect(getByText('Games')).toBeTruthy();
        });

        it('calls handleSubMenu when Games is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="putting" selectedItem="putting-drills" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('putting-sub-menu-putting-games'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('putting-games');
        });
    });

    describe('Chipping sub menu', () => {
        it('renders chipping menu items', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="chipping" selectedItem="chipping-drills" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByTestId('chipping-sub-menu-chipping-drills')).toBeTruthy();
            expect(getByTestId('chipping-sub-menu-chipping-games')).toBeTruthy();
        });
    });

    describe('Pitching sub menu', () => {
        it('renders pitching menu items', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="pitching" selectedItem="pitching-drills" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByTestId('pitching-sub-menu-pitching-drills')).toBeTruthy();
            expect(getByTestId('pitching-sub-menu-pitching-games')).toBeTruthy();
        });
    });

    describe('Bunker sub menu', () => {
        it('renders bunker menu items', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="bunker" selectedItem="bunker-drills" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByTestId('bunker-sub-menu-bunker-drills')).toBeTruthy();
            expect(getByTestId('bunker-sub-menu-bunker-games')).toBeTruthy();
        });
    });
});
