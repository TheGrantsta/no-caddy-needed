const analytics = jest.fn(() => ({
    logEvent: jest.fn(),
    logScreenView: jest.fn(),
    setUserId: jest.fn(),
    setUserProperty: jest.fn(),
    setAnalyticsCollectionEnabled: jest.fn(),
}));

export default analytics;
