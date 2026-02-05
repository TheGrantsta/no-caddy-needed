import React from 'react';
import { render } from '@testing-library/react-native';
import IconButton from '../../components/IconButton';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('IconButton component', () => {
    it('renders the label', () => {
        const { getByText } = render(
            <IconButton iconName="home" label="Home" size="medium" />
        );

        expect(getByText('Home')).toBeTruthy();
    });

    it('renders the icon', () => {
        const { getByText } = render(
            <IconButton iconName="golf-course" label="Golf" size="medium" />
        );

        // The mock renders icon info as text
        expect(getByText(/Icon: golf-course/)).toBeTruthy();
    });

    it('renders with small size', () => {
        const { getByTestId } = render(
            <IconButton iconName="home" label="Home" size="small" />
        );

        const container = getByTestId('container');
        expect(container).toBeTruthy();
    });

    it('renders with medium size', () => {
        const { getByTestId } = render(
            <IconButton iconName="home" label="Home" size="medium" />
        );

        const container = getByTestId('container');
        expect(container).toBeTruthy();
    });

    it('renders with large size', () => {
        const { getByTestId } = render(
            <IconButton iconName="home" label="Home" size="large" />
        );

        const container = getByTestId('container');
        expect(container).toBeTruthy();
    });

    it('renders different icons correctly', () => {
        const icons = ['settings', 'sports-golf', 'music-note', 'shuffle-on'];

        icons.forEach(iconName => {
            const { getByText } = render(
                <IconButton iconName={iconName as any} label="Test" size="medium" />
            );

            expect(getByText(new RegExp(`Icon: ${iconName}`))).toBeTruthy();
        });
    });

    it('renders different labels correctly', () => {
        const labels = ['Practice', 'On course', 'Settings', 'Tempo'];

        labels.forEach(label => {
            const { getByText } = render(
                <IconButton iconName="home" label={label} size="medium" />
            );

            expect(getByText(label)).toBeTruthy();
        });
    });
});
