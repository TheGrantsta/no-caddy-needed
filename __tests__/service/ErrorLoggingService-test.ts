import { logError } from '../../service/ErrorLoggingService';
import { addDoc, collection } from 'firebase/firestore';

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

const mockAddDoc = addDoc as jest.Mock;
const mockCollection = collection as jest.Mock;

describe('ErrorLoggingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        mockCollection.mockReturnValue('MOCK_COLLECTION_REF');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('logError', () => {
        it('writes to the app_errors collection with context, message, and timestamp', async () => {
            mockAddDoc.mockResolvedValue({ id: 'err1' });

            await logError('db.insertRound', new Error('disk full'));

            expect(mockCollection).toHaveBeenCalledWith('MOCK_DB', 'app_errors');
            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                context: 'db.insertRound',
                loggedAt: 'MOCK_TIMESTAMP',
            }));
        });

        it('extracts message from Error instance', async () => {
            mockAddDoc.mockResolvedValue({ id: 'err2' });
            const err = new Error('constraint violation');

            await logError('db.updateScore', err);

            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                message: 'constraint violation',
            }));
        });

        it('extracts stack trace from Error instance', async () => {
            mockAddDoc.mockResolvedValue({ id: 'err3' });
            const err = new Error('index out of bounds');
            const expectedStack = err.stack;

            await logError('db.deleteHole', err);

            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                stack: expectedStack,
            }));
        });

        it('stringifies non-Error values and sets stack to null', async () => {
            mockAddDoc.mockResolvedValue({ id: 'err4' });

            await logError('db.saveDrill', 'thrown string value');

            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                message: 'thrown string value',
                stack: null,
            }));
        });

        it('calls console.error with context and raw error', async () => {
            mockAddDoc.mockResolvedValue({ id: 'err5' });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const err = new Error('test error');

            await logError('db.test', err);

            expect(consoleErrorSpy).toHaveBeenCalledWith('[db.test]', err);
            consoleErrorSpy.mockRestore();
        });

        it('swallows error if addDoc itself rejects', async () => {
            mockAddDoc.mockRejectedValue(new Error('network failure'));

            await expect(logError('db.insert', new Error('original error'))).resolves.toBeUndefined();
        });

        it('does not throw when addDoc rejects', async () => {
            mockAddDoc.mockRejectedValue(new Error('firestore unavailable'));

            await expect(logError('db.update', 'error')).resolves.not.toThrow();
        });
    });
});
