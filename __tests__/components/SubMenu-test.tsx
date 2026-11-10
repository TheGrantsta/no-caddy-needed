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

    describe('Perform sub menu', () => {
        it('shouldListRoundsBeforeSinsInTheStatsMenu', () => {
            const { getAllByRole } = render(
                <SubMenu showSubMenu="perform" selectedItem="rounds" handleSubMenu={mockHandleSubMenu} variant="pill" />
            );

            const titles = getAllByRole('tab').map(tab => tab.props.accessibilityLabel);
            expect(titles).toEqual(['Rounds', 'Sins', 'Putting', 'Proximity']);
        });

        it('renders perform menu items', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="perform" selectedItem="sins" handleSubMenu={mockHandleSubMenu} />
            );

            expect(getByText('Sins')).toBeTruthy();
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

    describe('accessibility', () => {
        it('shouldExposeEachSubMenuItemAsTabWithItsTitle', () => {
            const { getByRole } = render(<SubMenu showSubMenu="practice" selectedItem="challenges" handleSubMenu={jest.fn()} />);

            expect(getByRole('tab', { name: 'Challenges' })).toBeTruthy();
            expect(getByRole('tab', { name: 'Tools' })).toBeTruthy();
        });

        it('shouldMarkOnlySelectedItemAsSelected', () => {
            const { getByRole } = render(<SubMenu showSubMenu="practice" selectedItem="challenges" handleSubMenu={jest.fn()} />);

            expect(getByRole('tab', { name: 'Challenges', selected: true })).toBeTruthy();
            expect(getByRole('tab', { name: 'Tools', selected: false })).toBeTruthy();
        });
    });

    describe('segmented look', () => {
        const colours = require('../../assets/colours').default;
        const { StyleSheet } = require('react-native');

        // Walk up from a menu item's touchable to the segment View that carries the segment styles
        const segmentOf = (node: any) => {
            let current = node;
            while (current && StyleSheet.flatten(current.props.style)?.paddingVertical !== 10) {
                current = current.parent;
            }
            return StyleSheet.flatten(current.props.style);
        };

        it('shouldFillTheSelectedSegmentWithPrimaryGreen', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="tools" handleSubMenu={jest.fn()} />
            );

            expect(segmentOf(getByTestId('practice-sub-menu-tools')).backgroundColor).toBe(colours.primary);
        });

        it('shouldShowTheSelectedSegmentTextInWhite', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="practice" selectedItem="tools" handleSubMenu={jest.fn()} />
            );

            expect(StyleSheet.flatten(getByText('Tools').props.style).color).toBe(colours.white);
        });

        it('shouldGiveEveryTheSameEqualWidthSegment', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="tools" handleSubMenu={jest.fn()} />
            );

            ['practice-sub-menu-challenges', 'practice-sub-menu-tools', 'practice-sub-menu-history'].forEach(id => {
                expect(segmentOf(getByTestId(id)).flex).toBe(1);
            });
        });
    });

    describe('pill variant', () => {
        const colours = require('../../assets/colours').default;
        const { StyleSheet } = require('react-native');

        // Walk up from a menu item's touchable to the segment View that carries the segment styles
        const segmentOf = (node: any) => {
            let current = node;
            while (current && StyleSheet.flatten(current.props.style)?.paddingVertical !== 6) {
                current = current.parent;
            }
            return StyleSheet.flatten(current.props.style);
        };

        it('shouldShowTheSelectedSegmentAsAWhitePill', () => {
            const { getByTestId } = render(
                <SubMenu showSubMenu="practice" selectedItem="tools" handleSubMenu={jest.fn()} variant="pill" />
            );

            expect(segmentOf(getByTestId('practice-sub-menu-tools')).backgroundColor).toBe(colours.backgroundLight);
        });

        it('shouldShowTheSelectedSegmentTextInTheNormalTextColour', () => {
            const { getByText } = render(
                <SubMenu showSubMenu="practice" selectedItem="tools" handleSubMenu={jest.fn()} variant="pill" />
            );

            expect(StyleSheet.flatten(getByText('Tools').props.style).color).toBe(colours.text);
        });
    });
});
