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
