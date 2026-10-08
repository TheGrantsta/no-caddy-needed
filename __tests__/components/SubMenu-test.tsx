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
                <SubMenu showSubMenu="practice" selectedItem="challenges" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Challenges')).toBeTruthy();
            expect(getByText('Tools')).toBeTruthy();
            expect(getByText('History')).toBeTruthy();
        });

        it('calls handleSubMenu when Tools is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="challenges" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('practice-sub-menu-tools'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('tools');
        });

        it('calls handleSubMenu when History is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="challenges" handleSubMenu={mockHandleSubMenu} />
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
            expect(getByText('Wedge Chart')).toBeTruthy();
        });

        it('calls handleSubMenu when Distances is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="play" selectedItem="play-score" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('play-distances');
        });

        it('calls handleSubMenu when Wedge Chart is pressed', () => {
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
                <SubMenu showSubMenu="perform" selectedItem="sins" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Deadly Sins')).toBeTruthy();
        });

        it('renders putting perform menu item', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="perform" selectedItem="sins" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Putting')).toBeTruthy();
        });

        it('calls handleSubMenu when Putting is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="perform" selectedItem="sins" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('perform-sub-menu-putting'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('putting');
        });

        it('renders proximity menu item', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="perform" selectedItem="sins" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Proximity')).toBeTruthy();
        });

        it('calls handleSubMenu when Proximity is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="perform" selectedItem="sins" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('perform-sub-menu-proximity'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('proximity');
        });
    });

});
