import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import PageHeader from '../../components/PageHeader';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@expo/vector-icons', () => {
    const { Text: IconText } = require('react-native');
    return {
        MaterialIcons: ({ name }: { name: string }) => <IconText>{name}</IconText>,
    };
});

describe('PageHeader', () => {
    it('shouldShowTheTitleCentredBetweenABackButtonAndAnOptionalAction', () => {
        const { getByText, getByLabelText } = render(
            <PageHeader title="Practice reminders" onBack={jest.fn()} rightAction={<Text>Add</Text>} />
        );

        expect(getByText('Practice reminders')).toBeTruthy();
        expect(getByLabelText('Back')).toBeTruthy();
        expect(getByText('Add')).toBeTruthy();
    });

    it('shouldCallOnBackWhenTheBackButtonIsPressed', () => {
        const onBack = jest.fn();
        const { getByLabelText } = render(<PageHeader title="Tempo training" onBack={onBack} />);

        fireEvent.press(getByLabelText('Back'));

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('shouldShowTheSubtitleWhenGiven', () => {
        const { getByText } = render(
            <PageHeader title="Tempo training" subtitle="Swing with tempo to self organise" onBack={jest.fn()} />
        );

        expect(getByText('Swing with tempo to self organise')).toBeTruthy();
    });

    it('shouldOmitTheSubtitleWhenNotGiven', () => {
        const { queryByText } = render(<PageHeader title="Practice reminders" onBack={jest.fn()} />);

        expect(queryByText('Swing with tempo to self organise')).toBeNull();
    });

    it('shouldShowTheTitleLeftAlignedInTheStandardHeadingStyle', () => {
        const { getByText } = render(<PageHeader title="Practice" onBack={jest.fn()} />);

        expect(getByText('Practice')).toHaveStyle({ fontSize: 32, fontWeight: 'bold', textAlign: 'left' });
    });

    it('shouldOmitTheBackButtonWhenNoBackHandlerIsGiven', () => {
        const { queryByLabelText, getByText } = render(<PageHeader title="My Bag" />);

        expect(queryByLabelText('Back')).toBeNull();
        expect(getByText('My Bag')).toBeTruthy();
    });
});
