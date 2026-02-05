import * as React from 'react';
import { render } from '@testing-library/react-native';
import Chevrons from '@/components/Chevrons';

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

describe('renders chevrons', () => {
    it('shows heading', () => {
        const points: string[] = [];
        const { getByText } = render(<Chevrons heading='This is the heading' points={points} />);

        expect(getByText('This is the heading')).toBeTruthy();
    });

    it('shows items', () => {
        const points = ['Point 1', 'Point 2', 'Point 3'];
        const { getByText } = render(<Chevrons heading='fake heading' points={points} />);

        expect(getByText('Point 1')).toBeTruthy();
        expect(getByText('Point 2')).toBeTruthy();
        expect(getByText('Point 3')).toBeTruthy();
    });
});
