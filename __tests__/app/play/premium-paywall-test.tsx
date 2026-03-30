import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PremiumPaywallScreen from '../../../app/play/premium-paywall';
import { purchasePremium, restorePurchases, getOfferings } from '../../../service/SubscriptionService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

const mockShow = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('../../../service/SubscriptionService', () => ({
    purchasePremium: jest.fn(),
    restorePurchases: jest.fn(),
    getOfferings: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ roundId: '7' }),
    useRouter: () => ({
        back: mockBack,
        push: mockPush,
    }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: mockShow,
    }),
}));

const mockPurchasePremium = purchasePremium as jest.Mock;
const mockRestorePurchases = restorePurchases as jest.Mock;
const mockGetOfferings = getOfferings as jest.Mock;

const singleOffering = [
    {
        packageIdentifier: '$rc_monthly',
        productIdentifier: 'com.app.premium.monthly',
        priceString: '£2.99 / month',
        title: 'Premium Monthly',
    },
];

describe('PremiumPaywallScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetOfferings.mockResolvedValue(singleOffering);
    });

    it('renders feature description text', async () => {
        const { getByText } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByText(/Analyse Your Round/i)).toBeTruthy());
    });

    it('shows loading indicator while getOfferings is resolving', () => {
        mockGetOfferings.mockReturnValue(new Promise(() => {}));

        const { getByTestId } = render(<PremiumPaywallScreen />);

        expect(getByTestId('paywall-loading')).toBeTruthy();
    });

    it('renders price string once offerings are loaded', async () => {
        const { getByText } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByText('£2.99 / month')).toBeTruthy());
    });

    it('shows fallback text when getOfferings returns empty array', async () => {
        mockGetOfferings.mockResolvedValue([]);

        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('paywall-no-offerings')).toBeTruthy());
    });

    it('renders subscribe button', async () => {
        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('subscribe-button')).toBeTruthy());
    });

    it('renders restore purchase button', async () => {
        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('restore-purchase-button')).toBeTruthy());
    });

    it('renders back button', async () => {
        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('paywall-back-button')).toBeTruthy());
    });

    it('calls router.back when back button is pressed', async () => {
        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('paywall-back-button')).toBeTruthy());
        fireEvent.press(getByTestId('paywall-back-button'));

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('navigates to round-analysis with roundId on successful purchase', async () => {
        mockPurchasePremium.mockResolvedValue({ success: true });

        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('subscribe-button')).toBeTruthy());
        fireEvent.press(getByTestId('subscribe-button'));

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith({
            pathname: '/play/round-analysis',
            params: { roundId: '7' },
        }));
    });

    it('shows error toast and does not navigate on failed purchase', async () => {
        mockPurchasePremium.mockResolvedValue({ success: false, error: 'Payment declined' });

        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('subscribe-button')).toBeTruthy());
        fireEvent.press(getByTestId('subscribe-button'));

        await waitFor(() => expect(mockShow).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ type: 'danger' }),
        ));
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('does not show error toast and does not navigate when user cancels purchase', async () => {
        mockPurchasePremium.mockResolvedValue({ success: false, error: 'cancelled' });

        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('subscribe-button')).toBeTruthy());
        fireEvent.press(getByTestId('subscribe-button'));

        await waitFor(() => expect(mockPurchasePremium).toHaveBeenCalled());
        expect(mockShow).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('navigates to round-analysis with roundId on successful restore', async () => {
        mockRestorePurchases.mockResolvedValue(true);

        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('restore-purchase-button')).toBeTruthy());
        fireEvent.press(getByTestId('restore-purchase-button'));

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith({
            pathname: '/play/round-analysis',
            params: { roundId: '7' },
        }));
    });

    it('shows no previous purchases toast when restore finds no entitlement', async () => {
        mockRestorePurchases.mockResolvedValue(false);

        const { getByTestId } = render(<PremiumPaywallScreen />);

        await waitFor(() => expect(getByTestId('restore-purchase-button')).toBeTruthy());
        fireEvent.press(getByTestId('restore-purchase-button'));

        await waitFor(() => expect(mockShow).toHaveBeenCalledWith(
            'No previous purchases found',
            expect.objectContaining({ type: 'danger' }),
        ));
        expect(mockPush).not.toHaveBeenCalled();
    });
});
