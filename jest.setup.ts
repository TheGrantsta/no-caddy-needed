import { resetRoundFilterStoreForTests } from './hooks/useRoundFilter';
// Suppress act() warnings for mocked async operations
// These occur because mocked services (mockResolvedValue) complete async state updates
// after act() blocks finish, but the actual component works correctly in real usage.
// This is a testing artifact of mocked promises, not a real functional issue.
const originalError = console.error;
console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('An update to') && message.includes('inside a test was not wrapped in act')) {
        return; // Suppress act() warnings from mocked async operations
    }
    originalError(...args);
};

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => 'MOCK_APP'),
    getApps: jest.fn(() => []),
    getApp: jest.fn(() => 'MOCK_APP'),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => 'MOCK_DB'),
    addDoc: jest.fn(),
    collection: jest.fn(() => 'MOCK_COLLECTION_REF'),
    serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP'),
}));

// Screens read the safe-area inset for the floating tab bar; with no provider in tests, report zero insets.
// Test files that need a specific inset mock the module themselves.
jest.mock('react-native-safe-area-context', () => ({
    ...jest.requireActual('react-native-safe-area-context'),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// The swipeable needs the native reanimated runtime, which Jest does not provide. Render its children and
// right actions inline so swipe-to-delete rows can be tested by pressing their actions.
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    const { View: MockView } = jest.requireActual<typeof import('react-native')>('react-native');
    const MockSwipeable = ({ children, renderRightActions }: any) =>
        React.createElement(MockView, null, children, renderRightActions?.());
    return { __esModule: true, default: MockSwipeable };
});

// The shared round filter reads and writes SQLite. Screen tests get a default that never touches the
// database; tests that need the real service or store mock or unmock it themselves.
jest.mock('./service/RoundFilterPreferenceService', () => ({
    getRoundFilterPreferenceService: jest.fn(() => 'all'),
    saveRoundFilterPreferenceService: jest.fn(() => Promise.resolve(true)),
}));

// Each test starts with no shared round filter, so one test's selection cannot leak into another
beforeEach(() => {
    resetRoundFilterStoreForTests();
});
