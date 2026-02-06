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

    it('splits point on first colon with label in yellow', () => {
        const points = ['Label: This is the description'];
        const { getByTestId } = render(<Chevrons heading='fake heading' points={points} />);

        const label = getByTestId('point-label-0');
        const description = getByTestId('point-description-0');

        expect(label.props.children).toBe('Label:');
        expect(description.props.children).toBe(' This is the description');
    });

    it('handles points without colon', () => {
        const points = ['No colon here'];
        const { getByText } = render(<Chevrons heading='fake heading' points={points} />);

        expect(getByText('No colon here')).toBeTruthy();
    });

    it('splits only on first colon when multiple colons exist', () => {
        const points = ['First: Second: Third'];
        const { getByTestId } = render(<Chevrons heading='fake heading' points={points} />);

        const label = getByTestId('point-label-0');
        const description = getByTestId('point-description-0');

        expect(label.props.children).toBe('First:');
        expect(description.props.children).toBe(' Second: Third');
    });
});
