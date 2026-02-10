const crashlytics = jest.fn(() => ({
    log: jest.fn(),
    recordError: jest.fn(),
    setUserId: jest.fn(),
    setAttribute: jest.fn(),
    setAttributes: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
}));

export default crashlytics;
