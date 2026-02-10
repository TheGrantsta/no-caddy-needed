import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../../components/ErrorBoundary';
import { recordError, logBreadcrumb } from '../../service/AnalyticsService';

jest.mock('../../service/AnalyticsService', () => ({
    recordError: jest.fn(),
    logBreadcrumb: jest.fn(),
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const mockRecordError = recordError as jest.Mock;
const mockLogBreadcrumb = logBreadcrumb as jest.Mock;

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <Text>Content renders correctly</Text>;
};

describe('ErrorBoundary', () => {
    const originalConsoleError = console.error;

    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress React error boundary console.error output during tests
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('renders children when no error occurs', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(getByText('Content renders correctly')).toBeTruthy();
    });

    it('renders fallback UI when an error occurs', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('displays try again button in fallback UI', () => {
        const { getByTestId } = render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(getByTestId('error-boundary-retry-button')).toBeTruthy();
    });

    it('reports error to Crashlytics when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(mockRecordError).toHaveBeenCalledWith(
            expect.any(Error),
            'ErrorBoundary caught error'
        );
    });

    it('logs component stack as breadcrumb', () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(mockLogBreadcrumb).toHaveBeenCalledWith(
            expect.stringContaining('Component stack:')
        );
    });

    it('resets error state when try again is pressed', () => {
        let shouldThrow = true;

        const ConditionalThrow = () => {
            if (shouldThrow) {
                throw new Error('Test error');
            }
            return <Text>Recovered successfully</Text>;
        };

        const { getByTestId, getByText, rerender } = render(
            <ErrorBoundary>
                <ConditionalThrow />
            </ErrorBoundary>
        );

        expect(getByText('Something went wrong')).toBeTruthy();

        // Fix the error condition before retry
        shouldThrow = false;

        // Press retry button
        fireEvent.press(getByTestId('error-boundary-retry-button'));

        // Re-render to see the fixed content
        rerender(
            <ErrorBoundary>
                <ConditionalThrow />
            </ErrorBoundary>
        );

        expect(getByText('Recovered successfully')).toBeTruthy();
    });
});
