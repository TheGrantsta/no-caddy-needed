import React from 'react';
import { render } from '@testing-library/react-native';
import Game from '../../components/Game';

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

describe('Game component', () => {
    const mockGames = [
        {
            header: 'Game One',
            objective: 'First objective',
            setup: 'First setup',
            howToPlay: 'First how to play',
        },
        {
            header: 'Game Two',
            objective: 'Second objective',
            setup: 'Second setup',
            howToPlay: 'Second how to play',
        },
    ];

    it('renders the subheading', () => {
        const { getByText } = render(<Game subHeading="Test Games" games={mockGames} />);

        expect(getByText('Test Games')).toBeTruthy();
    });

    it('renders all game headers', () => {
        const { getByText } = render(<Game subHeading="Test Games" games={mockGames} />);

        expect(getByText('Game One')).toBeTruthy();
        expect(getByText('Game Two')).toBeTruthy();
    });

    it('renders instructions for each game', () => {
        const { getByText } = render(<Game subHeading="Test Games" games={mockGames} />);

        expect(getByText(/First objective/)).toBeTruthy();
        expect(getByText(/Second objective/)).toBeTruthy();
    });

    it('renders setup for each game', () => {
        const { getByText } = render(<Game subHeading="Test Games" games={mockGames} />);

        expect(getByText(/First setup/)).toBeTruthy();
        expect(getByText(/Second setup/)).toBeTruthy();
    });

    it('renders how to play for each game', () => {
        const { getByText } = render(<Game subHeading="Test Games" games={mockGames} />);

        expect(getByText(/First how to play/)).toBeTruthy();
        expect(getByText(/Second how to play/)).toBeTruthy();
    });

    it('renders empty when no games provided', () => {
        const { getByText, queryByText } = render(<Game subHeading="Empty Games" games={[]} />);

        expect(getByText('Empty Games')).toBeTruthy();
        expect(queryByText('Objective:')).toBeNull();
    });

    it('renders single game correctly', () => {
        const singleGame = [mockGames[0]];
        const { getByText, queryByText } = render(<Game subHeading="Single Game" games={singleGame} />);

        expect(getByText('Game One')).toBeTruthy();
        expect(queryByText('Game Two')).toBeNull();
    });
});
