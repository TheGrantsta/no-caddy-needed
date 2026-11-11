import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayerSetup from '../../components/PlayerSetup';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

// Swipeable renders its right actions alongside the content so the delete action can be pressed in tests
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
    const { View: MockView } = require('react-native');
    const MockSwipeable = ({ children, renderRightActions }: any) => (
        <MockView>
            {children}
            {renderRightActions?.()}
        </MockView>
    );
    return { __esModule: true, default: MockSwipeable };
});

describe('PlayerSetup', () => {
    const mockOnStartRound = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows You as fixed first player', () => {
        const { getByText } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByText('You')).toBeTruthy();
    });

    it('shows Host label beside You', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByTestId('player-you-host-label')).toHaveTextContent('Host');
    });

    it('shows Add player button', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByTestId('add-player-button')).toBeTruthy();
    });

    it('shows Start button labelled Start round', () => {
        const { getByTestId, getByText } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByTestId('start-button')).toBeTruthy();
        expect(getByText('Start round')).toBeTruthy();
    });

    it('does not show a Cancel button', () => {
        const { queryByTestId, queryByText } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(queryByTestId('cancel-button')).toBeNull();
        expect(queryByText('Cancel')).toBeNull();
    });

    it('adds a player input when Add player is pressed', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));

        expect(getByTestId('player-name-input-0')).toBeTruthy();
    });

    it('adds up to 3 additional players', () => {
        const { getByTestId, queryByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));

        expect(getByTestId('player-name-input-0')).toBeTruthy();
        expect(getByTestId('player-name-input-1')).toBeTruthy();
        expect(getByTestId('player-name-input-2')).toBeTruthy();
        expect(queryByTestId('add-player-button')).toBeNull();
    });

    it('removes a player when remove button is pressed', () => {
        const { getByTestId, queryByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        expect(getByTestId('player-name-input-0')).toBeTruthy();

        fireEvent.press(getByTestId('remove-player-0'));
        expect(queryByTestId('player-name-input-0')).toBeNull();
    });

    it('shows add player button again after removing a player when at max', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));

        fireEvent.press(getByTestId('remove-player-1'));

        expect(getByTestId('add-player-button')).toBeTruthy();
    });

    it('does not call onStartRound when course name is empty', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('start-button'));

        expect(mockOnStartRound).not.toHaveBeenCalled();
    });

    it('calls onStartRound with player names and course name', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.changeText(getByTestId('player-name-input-1'), 'Bob');

        fireEvent.press(getByTestId('start-button'));

        expect(mockOnStartRound).toHaveBeenCalledWith(['Alice', 'Bob'], 'St Andrews', 1);
    });

    it('filters out empty player names on start', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');

        fireEvent.press(getByTestId('add-player-button'));
        // Leave second input empty

        fireEvent.press(getByTestId('start-button'));

        expect(mockOnStartRound).toHaveBeenCalledWith(['Alice'], 'St Andrews', 1);
    });

    describe('Course search field', () => {
        it('uses a course name placeholder for the text field', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            expect(getByTestId('course-name-input').props.placeholder).toBe('Course name');
        });

        it('shows no search icon beside the course name field', () => {
            const { queryByText } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            expect(queryByText(/Icon: search/)).toBeNull();
        });

        it('passes typed course name to onStartRound', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Pebble Beach');
            fireEvent.press(getByTestId('start-button'));

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'Pebble Beach', 1);
        });

        it('shows error message when course name is empty', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.press(getByTestId('start-button'));

            expect(getByTestId('course-name-error')).toBeTruthy();
            expect(getByTestId('course-name-error').props.children).toBe('Course name is required');
        });

        it('does not call onStartRound when course name is only whitespace', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.changeText(getByTestId('course-name-input'), '   ');
            fireEvent.press(getByTestId('start-button'));

            expect(mockOnStartRound).not.toHaveBeenCalled();
        });

        it('clears error message when user types a course name', () => {
            const { getByTestId, queryByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.press(getByTestId('start-button'));
            expect(getByTestId('course-name-error')).toBeTruthy();

            fireEvent.changeText(getByTestId('course-name-input'), 'A');

            expect(queryByTestId('course-name-error')).toBeNull();
        });

        it('trims course name before passing to onStartRound', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.changeText(getByTestId('course-name-input'), ' Pebble Beach ');
            fireEvent.press(getByTestId('start-button'));

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'Pebble Beach', 1);
        });

        it('normalizes course name to existing recent course when case/whitespace differs', () => {
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            fireEvent.changeText(getByTestId('course-name-input'), 'st andrews');
            fireEvent.press(getByTestId('start-button'));

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'St Andrews', 1);
        });

        it('normalizes with whitespace variance when finding existing course', () => {
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['Pebble Beach']} />
            );

            fireEvent.changeText(getByTestId('course-name-input'), ' PEBBLE BEACH ');
            fireEvent.press(getByTestId('start-button'));

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'Pebble Beach', 1);
        });

        it('filters recent courses to those containing the typed text, ignoring case', () => {
            const { getByTestId, queryByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews', 'Pebble Beach']} />
            );

            fireEvent.changeText(getByTestId('course-name-input'), 'PEBB');

            expect(getByTestId('recent-course-Pebble Beach')).toBeTruthy();
            expect(queryByTestId('recent-course-St Andrews')).toBeNull();
        });

        it('shows every recent course again when the search text is cleared', () => {
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews', 'Pebble Beach']} />
            );

            fireEvent.changeText(getByTestId('course-name-input'), 'Pebble');
            fireEvent.changeText(getByTestId('course-name-input'), '');

            expect(getByTestId('recent-course-St Andrews')).toBeTruthy();
            expect(getByTestId('recent-course-Pebble Beach')).toBeTruthy();
        });
    });

    describe('Recent courses', () => {
        it('shows recent course names when provided', () => {
            const { getByText } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews', 'Pebble Beach']} />
            );

            expect(getByText('St Andrews')).toBeTruthy();
            expect(getByText('Pebble Beach')).toBeTruthy();
        });

        it('shows a Recent label above the list', () => {
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            expect(getByTestId('recent-courses-label')).toHaveTextContent('Recent');
        });

        it('shows a swipe hint when there are recent courses', () => {
            const { getByText } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            expect(getByText('Swipe left on a course to remove it.')).toBeTruthy();
        });

        it('does not show recent section or swipe hint when list is empty', () => {
            const { queryByTestId, queryByText } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={[]} />
            );

            expect(queryByTestId('recent-courses-label')).toBeNull();
            expect(queryByText('Swipe left on a course to remove it.')).toBeNull();
        });

        it('does not show recent section when prop is not provided', () => {
            const { queryByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            expect(queryByTestId('recent-courses-label')).toBeNull();
        });

        it('populates course name input when recent name is tapped', () => {
            const { getByTestId, getByText } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            fireEvent.press(getByText('St Andrews'));
            fireEvent.press(getByTestId('start-button'));

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'St Andrews', 1);
        });

        it('clears error when recent course name is tapped', () => {
            const { getByTestId, getByText, queryByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            fireEvent.press(getByTestId('start-button'));
            expect(getByTestId('course-name-error')).toBeTruthy();

            fireEvent.press(getByText('St Andrews'));

            expect(queryByTestId('course-name-error')).toBeNull();
        });

        it('shows a checkmark only on the course that is currently selected', () => {
            const { getByTestId, queryByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews', 'Pebble Beach']} />
            );

            fireEvent.press(getByTestId('recent-course-Pebble Beach'));

            expect(getByTestId('recent-course-selected-Pebble Beach')).toBeTruthy();
            expect(queryByTestId('recent-course-selected-St Andrews')).toBeNull();
        });

        it('shows no checkmark when the typed course name matches no recent course', () => {
            const { getByTestId, queryByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            fireEvent.changeText(getByTestId('course-name-input'), 'Augusta');

            expect(queryByTestId('recent-course-selected-St Andrews')).toBeNull();
        });
    });

    describe('Remove recent course by swiping', () => {
        it('keeps each recent course row opaque so its delete action is hidden until swiped', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            const rowStyle = StyleSheet.flatten(getByTestId('recent-course-St Andrews').props.style);

            expect(rowStyle.backgroundColor).toBe(require('../../assets/colours').default.backgroundLight);
        });

        it('shows a delete action for each recent course', () => {
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews', 'Pebble Beach']} />
            );

            expect(getByTestId('delete-recent-course-St Andrews')).toBeTruthy();
            expect(getByTestId('delete-recent-course-Pebble Beach')).toBeTruthy();
        });

        it('callsOnRemoveCourseWhenDeleteActionPressed', () => {
            const mockOnRemoveCourse = jest.fn();
            const { getByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} onRemoveCourse={mockOnRemoveCourse} />
            );

            fireEvent.press(getByTestId('delete-recent-course-St Andrews'));

            expect(mockOnRemoveCourse).toHaveBeenCalledWith('St Andrews');
        });

        it('hidesRemovedCourseFromListOptimistically', () => {
            const { getByTestId, queryByTestId } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews', 'Pebble Beach']} />
            );

            fireEvent.press(getByTestId('delete-recent-course-St Andrews'));

            expect(queryByTestId('recent-course-St Andrews')).toBeNull();
            expect(getByTestId('recent-course-Pebble Beach')).toBeTruthy();
        });

        it('hides the swipe hint once no recent courses remain', () => {
            const { getByTestId, queryByText } = render(
                <PlayerSetup onStartRound={mockOnStartRound} recentCourseNames={['St Andrews']} />
            );

            fireEvent.press(getByTestId('delete-recent-course-St Andrews'));

            expect(queryByText('Swipe left on a course to remove it.')).toBeNull();
        });
    });

    describe('keyboard return key', () => {
        it('shouldShowDoneOnCourseNameKeyboard', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            expect(getByTestId('course-name-input').props.returnKeyType).toBe('done');
        });

        it('shouldShowDoneOnPlayerNameKeyboard', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);
            fireEvent.press(getByTestId('add-player-button'));

            expect(getByTestId('player-name-input-0').props.returnKeyType).toBe('done');
        });
    });
    describe('starting hole', () => {
        const startWithCourse = (getByTestId: (id: string) => any, course = 'St Andrews') => {
            fireEvent.changeText(getByTestId('course-name-input'), course);
            fireEvent.press(getByTestId('start-button'));
        };

        it('shouldLabelTheStartingHoleRowAsFirstTee', () => {
            const { getByText } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            expect(getByText('First tee')).toBeTruthy();
        });

        it('shouldShowHoleOneAsTheStartingHoleByDefault', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            expect(getByTestId('starting-hole-dropdown-toggle')).toHaveTextContent(/Hole 1/);
        });

        it('shouldOfferEveryHoleFromOneToEighteen', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.press(getByTestId('starting-hole-dropdown-toggle'));

            expect(getByTestId('starting-hole-option-Hole 1')).toBeTruthy();
            expect(getByTestId('starting-hole-option-Hole 18')).toBeTruthy();
        });

        it('shouldStartTheRoundOnTheChosenHoleForAShotgunStart', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            fireEvent.press(getByTestId('starting-hole-dropdown-toggle'));
            fireEvent.press(getByTestId('starting-hole-option-Hole 10'));
            startWithCourse(getByTestId);

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'St Andrews', 10);
        });

        it('shouldStartOnHoleOneWhenNoOtherHoleIsChosen', () => {
            const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

            startWithCourse(getByTestId);

            expect(mockOnStartRound).toHaveBeenCalledWith([], 'St Andrews', 1);
        });
    });
});
