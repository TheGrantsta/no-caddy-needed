import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { recordError, logBreadcrumb } from '../service/AnalyticsService';
import { darkColours } from '../assets/colours';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        recordError(error, 'ErrorBoundary caught error');
        logBreadcrumb(`Component stack: ${errorInfo.componentStack}`);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        The app encountered an unexpected error. Please try again.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleRetry}
                        testID="error-boundary-retry-button"
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: darkColours.background,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: darkColours.text,
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        color: darkColours.text,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: darkColours.yellow,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: darkColours.background,
    },
});

export default ErrorBoundary;
