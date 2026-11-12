import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import PageHeader from '../../components/PageHeader';

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

    it('shouldCentreTheTitleWhenCentredIsRequestedAndBalanceASideWithNoControl', () => {
        const { getByText, getByTestId } = render(<PageHeader title="Settings" centered rightAction={<Text>Info</Text>} />);

        expect(getByText('Settings')).toHaveStyle({ textAlign: 'center' });
        expect(getByTestId('page-header-spacer')).toBeTruthy();
    });

    it('shouldKeepTheTitleLeftAlignedWithNoSpacerWhenCentredIsNotRequested', () => {
        const { getByText, queryByTestId } = render(<PageHeader title="Practice" rightAction={<Text>Info</Text>} />);

        expect(getByText('Practice')).toHaveStyle({ textAlign: 'left' });
        expect(queryByTestId('page-header-spacer')).toBeNull();
    });

    it('shouldOmitTheBackButtonWhenNoBackHandlerIsGiven', () => {
        const { queryByLabelText, getByText } = render(<PageHeader title="My Bag" />);

        expect(queryByLabelText('Back')).toBeNull();
        expect(getByText('My Bag')).toBeTruthy();
    });
});
