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
