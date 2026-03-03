import * as React from 'react';
import { render } from '@testing-library/react-native';
import NotFoundScreen from '../../app/+not-found';

const mockLinkHref = jest.fn();

jest.mock('expo-router', () => ({
    Stack: {
        Screen: jest.fn(() => null),
    },
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => {
        mockLinkHref(href);
        return <>{children}</>;
    },
}));

describe('NotFoundScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<NotFoundScreen />);
        expect(toJSON()).toBeTruthy();
    });

    it('rendersNotFoundMessage', () => {
        const { getByText } = render(<NotFoundScreen />);
        expect(getByText("This screen doesn't exist.")).toBeTruthy();
    });

    it('rendersLinkToHomeScreen', () => {
        const { getByText } = render(<NotFoundScreen />);
        expect(getByText('Go to home screen!')).toBeTruthy();
    });

    it('linkPointsToHomeRoute', () => {
        render(<NotFoundScreen />);
        expect(mockLinkHref).toHaveBeenCalledWith('/');
    });

    it('configuresStackScreenTitleAsOops', () => {
        const { Stack } = require('expo-router');
        render(<NotFoundScreen />);
        expect(Stack.Screen.mock.calls[0][0]).toEqual({ options: { title: 'Oops!' } });
    });
});
