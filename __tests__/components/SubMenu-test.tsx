import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SubMenu from '../../components/SubMenu';

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

    describe('On-course sub menu', () => {
        it('renders on-course menu items', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="on-course" selectedItem="approach" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Approach')).toBeTruthy();
            expect(getByText('Wedge chart')).toBeTruthy();
            expect(getByText('Pros')).toBeTruthy();
            expect(getByText('Tiger 5')).toBeTruthy();
        });

        it('calls handleSubMenu when Wedge chart is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="on-course" selectedItem="approach" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('on-course-sub-menu-wedge-chart'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('wedge-chart');
        });

        it('calls handleSubMenu when Tiger 5 is pressed', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="on-course" selectedItem="approach" handleSubMenu={mockHandleSubMenu} />
            );

            fireEvent.press(getByTestId('on-course-sub-menu-tiger-5'));

            expect(mockHandleSubMenu).toHaveBeenCalledWith('tiger-5');
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
