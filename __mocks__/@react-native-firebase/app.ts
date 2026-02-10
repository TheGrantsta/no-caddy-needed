export default {
    apps: [],
    initializeApp: jest.fn(),
    app: jest.fn(() => ({
        name: '[DEFAULT]',
    })),
};
